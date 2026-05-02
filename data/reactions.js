import { ObjectId } from "mongodb";
import { users, comments, reactions, restaurants, rodentReports } from "../config/mongoCollections.js";
import { validateId } from "./utility.js";
import { 
    checkReactionType, 
    checkTargetKeyType, 
    COLLECTION_IDS 
} from "../helpers.js";

/**
 * Reaction Schema:
 * {
 *  _id:            objectId
 *  userId:         string
 *  targetId:       string
 *  targetKey:      string
 *  reactionType:   string
 *  timestamp:      string
 * }
 */

/**
 * Wrapper: Updates restaurant reaction
 * @param {string} userId 
 * @param {string} restaurantId 
 * @param {string} type - like, dislike
 */
export const updateRestaurantReaction = async(userId, restaurantId, type) => {
    const errorSource = "updateRestaurantReaction";
    return updateReaction(userId, restaurantId, COLLECTION_IDS.RESTAURANT, type, errorSource)
}

/**
 * Wrapper: Updates comment reaction
 * @param {string} userId 
 * @param {string} commentId 
 * @param {string} type - like, dislike
 */
export const updateCommentReaction = async(userId, commentId, type) => {
    const errorSource = "updateCommentReaction";
    return updateReaction(userId, commentId, COLLECTION_IDS.COMMENT, type, errorSource)
}

/**
 * Wrapper: Updates rodent report reaction
 * @param {string} userId 
 * @param {string} reportId 
 * @param {string} type - like, dislike
 */
export const updateReportReaction = async(userId, reportId, type) => {
    const errorSource = "updateReportReaction";
    return updateReaction(userId, reportId, COLLECTION_IDS.REPORT, type, errorSource)
}

/**
 * Wrapper: Deletes restaurant reaction
 * @param {string} reactionId
 * @param {string} restaurantId 
 */
export const deleteRestaurantReaction = async(reactionId, restaurantId) => {
    const errorSource = "deleteRestaurantReaction";
    return deleteReaction(reactionId, restaurantId, COLLECTION_IDS.RESTAURANT, errorSource);
}

/**
 * Wrapper: Deletes comment reaction
 * @param {string} reactionId 
 * @param {string} commentId 
 */
export const deleteCommentReaction = async(reactionId, commentId) => {
    const errorSource = "deleteCommentReaction";
    return deleteReaction(reactionId, commentId, COLLECTION_IDS.COMMENT, errorSource);
}

/**
 * Wrapper: Deletes rodent report reaction
 * @param {string} reactionId 
 * @param {string} reportId 
 */
export const deleteReportReaction = async(reactionId, reportId) => {
    const errorSource = "deletereportReaction";
    return deleteReaction(reactionId, reportId, COLLECTION_IDS.REPORT, errorSource);
}

/**
 * Helper: Updates reaction based on reaction type. Can be either a comment, report, or restaurant reaction depending on targetKey and targetId
 * @param {string} userId 
 * @param {string} targetId
 * @param {string} targetKey - commentId, reportId, restaurantId
 * @param {string} type - like, dislike
 * @returns 
 */
const updateReaction = async(
    userId,
    targetId,
    targetKey,
    type,
    errorSource
) => {
    const validatedUserId = validateId(userId, 'userId', errorSource);
    const validatedTargetId = validateId(targetId, `${targetKey}`, errorSource);
    const validatedTargetKey = checkTargetKeyType(targetKey);
    const validatedReactionType = checkReactionType(type);

    // Check if user and comment exist
    const [reactionCollection, userCollection] = await Promise.all([
        reactions(),
        users()
    ]);

    //Check that the user exists
    const userItem = await userCollection.findOne({_id: new ObjectId(validatedUserId)});
    if (!userItem) throw `Error {${errorSource}}: No user found with id ${validatedUserId}`;

    // Decide on which collection we are looking for
    let targetCollection = null;
    switch (validatedTargetKey) {
        case COLLECTION_IDS.RESTAURANT:
            targetCollection = await restaurants();
            break;
        case COLLECTION_IDS.COMMENT:
            targetCollection = await comments();
            break;
        case COLLECTION_IDS.REPORT:
            targetCollection = await rodentReports();
            break;
        default:
            throw `Error {${errorSource}}: TargetKey ${targetKey} is not a valid option. How did you get to this point?`;
    }

    const targetItem = await targetCollection.findOne({_id: new ObjectId(validatedTargetId)})
    if (!targetItem) throw `Error {${errorSource}}: No ${validatedTargetKey} found with id ${validatedTargetId}`;

    // Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();

    // Try updating reaction. Create a new reaction if it does not exist
    let reactionItem = await reactionCollection.findOneAndUpdate(
        {
            userId: validatedUserId, 
            targetId: validatedTargetId,
            targetKey: validatedTargetKey
        },
        {
            $set: {reactionType: validatedReactionType},
            $setOnInsert: {timestamp: timestamp} 
        },
        {
            upsert: true, //Create reaction if not found
            returnDocument: "before"
        }
    );

    // Check if a reaction got created or is this an update
    const prevType = reactionItem ? reactionItem.reactionType : null;

    // Clicked on the same request twice. Delete the reaction
    if (prevType === validatedReactionType) {
        await deleteReaction(reactionItem._id.toString());
        return { likes: 0, dislikes: 0 };
    }

    // Update comment like/dislike count
    let updateQuery = {};
    if (prevType === null) {
        updateQuery = {$inc: {[`stats.${validatedReactionType}s`]: 1}}; // Just increment it by 1 if a new reaction
    } else {
        updateQuery = // Otherwise properly increment or decrement the counts
        [{
            $set: {
                [`stats.${prevType}s`]: {
                    $max: [0, {$subtract: [`$stats.${prevType}s`, 1]}] // $max to ensure we don't go below 0 likes/dislikes. Basically a clamp()
                },
                [`stats.${validatedReactionType}s`]: { 
                    $add: [`$stats.${validatedReactionType}s`, 1] 
                }
            }
        }];
    }

    const updateInfo = await targetCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedTargetId)},
        updateQuery,
        {returnDocument: "after"}
    );
    return updateInfo.stats;
};

/**
 * Helper: Deletes reaction from database by objectId. Updates comment likes/dislikes
 * @param {string} reactionId
 * @param {string} targetId
 * @param {string} targetKey
 * @returns 
 */
const deleteReaction = async(reactionId, targetId, targetKey, errorSource) => {
    const validatedReactionId = validateId(reactionId, 'reactionId', errorSource);
    const validatedTargetId = validateId(targetId, `${targetKey}`, errorSource);
    const validatedTargetKey = checkTargetKeyType(targetKey);

    // Decide on which collection we are looking for
    let targetCollection = null;
    switch (validatedTargetKey) {
        case COLLECTION_IDS.RESTAURANT:
            targetCollection = await restaurants();
            break;
        case COLLECTION_IDS.COMMENT:
            targetCollection = await comments();
            break;
        case COLLECTION_IDS.REPORT:
            targetCollection = await rodentReports();
            break;
        default:
            throw `Error {${errorSource}}: TargetKey ${targetKey} is not a valid option. How did you get to this point?`;
    }

    // Delete reaction from database
    const reactionCollection = await reactions();
    const deletionInfo = await reactionCollection.findOneAndDelete({_id: new ObjectId(validatedReactionId)});
    if (!deletionInfo) throw `Error {${errorSource}}: Could not delete reaction with id ${validatedReactionId}`;

    // Find and update comment stats
    const decrementField = deletionInfo.reactionType === 'like'
        ? 'stats.likes'
        : 'stats.dislikes';

    const updateInfo = await targetCollection.findOneAndUpdate(
        {_id: new ObjectId(deletionInfo.targetId)},
        [{
            $set: {
                [decrementField]: {$max: [0, {$subtract: [`$${decrementField}`, 1]}]} // $max to ensure we don't go below 0 likes/dislikes. Basically a clamp()
            }
        }],
        {returnDocument: "after"}
    )

    return updateInfo.stats;
};