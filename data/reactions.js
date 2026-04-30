import { ObjectId } from "mongodb";
import { users, comments, reactions } from "../config/mongoCollections.js";
import { validateId } from "./utility.js";
import { checkReactionType } from "../helpers.js";

/**
 * Updates reaction based on reaction type
 * @param {string} userId 
 * @param {string} commentId 
 * @param {string} type 
 * @returns 
 */
export const updateReaction = async(
    userId,
    commentId,
    type
) => {
    const errorSource = "updateReaction";
    const validatedUserId = validateId(userId, 'userId', errorSource);
    const validatedCommentId = validateId(commentId, 'commentId', errorSource);
    const validatedReactionType = checkReactionType(type);

    // Check if user and comment exist
    const [reactionCollection, commentCollection, userCollection] = await Promise.all([
        reactions(),
        comments(),
        users()
    ]);

    const [userItem, commentItem] = await Promise.all([
        userCollection.findOne({_id: new ObjectId(validatedUserId)}),
        commentCollection.findOne({_id: new ObjectId(validatedCommentId)})
    ]);
    if (!userItem) throw `Error {${errorSource}}: No user found with id ${validatedUserId}`;
    if (!commentItem) throw `Error {${errorSource}}: No comment found with id ${validatedCommentId}`;

    // Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();

    // Try updating reaction. Create a new reaction if it does not exist
    let reactionItem = await reactionCollection.findOneAndUpdate(
        {
            userId: validatedUserId, 
            commentId: validatedCommentId
        },
        {
            $set: {reactionType: validatedReactionType},
            $setOnInsert: {timestamp: timestamp} // Only timestamp if creating a new reaction
        },
        {
            upsert: true, //Create reaction if not found
            returnDocument: "before"
        }
    );
    const prevType = reactionItem ? reactionItem.reactionType : null;

    // Clicked on the same request twice
    if (prevType === validatedReactionType) {
        await deleteReaction(reactionItem._id.toString());
        return { removed: true };
    }

    // Update comment like/dislike count
    let updateQuery = {};
    if (prevType === null) {
        updateQuery = {$inc: {[`stats.${validatedReactionType}s`]: 1}};
    } else {
        updateQuery = {
            $inc: {
                [`stats.${validatedReactionType}s`]: 1,
                [`stats.${prevType}s`]: -1
            }
        };
    }

    const updateInfo = await commentCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedCommentId)},
        updateQuery,
        {returnDocument: "after"}
    );
    return updateInfo;
};

/**
 * Deletes reaction from database by objectId. Updates comment with correct likes/dislikes
 * @param {string} id 
 * @returns 
 */
export const deleteReaction = async(id) => {
    const errorSource = 'deleteReaction';
    const validatedId = validateId(id, 'reactionId', errorSource);

    const [reactionCollection, commentCollection] = await Promise.all([
        reactions(),
        comments()
    ])

    // Delete reaction from database
    const deletionInfo = await reactionCollection.findOneAndDelete({_id: new ObjectId(validatedId)});
    if (!deletionInfo) throw `Error {${errorSource}}: Could not delete reaction with id ${validatedId}`;

    // Find and update comment stats
    const decrementField = deletionInfo.reactionType === 'like'
        ? 'stats.likes'
        : 'stats.dislikes';

    await commentCollection.updateOne(
        {_id: deletionInfo.commentId},
        {$inc: {[decrementField]: -1}}
    )

    return { deleted: true };
};