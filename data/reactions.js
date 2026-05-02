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
export const updateReaction = async (userId, commentId, type) => {
  const errorSource = "updateReaction";

  const validatedUserId = validateId(userId, 'userId', errorSource);
  const validatedCommentId = validateId(commentId, 'commentId', errorSource);
  const validatedReactionType = checkReactionType(type);

  const [reactionCollection, commentCollection, userCollection] =
    await Promise.all([reactions(), comments(), users()]);

  const [userItem, commentItem] = await Promise.all([
    userCollection.findOne({ _id: new ObjectId(validatedUserId) }),
    commentCollection.findOne({ _id: new ObjectId(validatedCommentId) })
  ]);

  if (!userItem) throw `Error {${errorSource}}: No user found`;
  if (!commentItem) throw `Error {${errorSource}}: No comment found`;

  const now = new Date().toISOString();

  // find existing reaction collection
  const existing = await reactionCollection.findOne({
    userId: validatedUserId,
    commentId: validatedCommentId
  });

  let updateQuery = null;

  // if no reaction exists,add one
  if (!existing) {
    await reactionCollection.insertOne({
      userId: validatedUserId,
      commentId: validatedCommentId,
      reactionType: validatedReactionType,
      timestamp: now
    });
    updateQuery = {
      $inc: { [`stats.${validatedReactionType}s`]: 1 }
    };
  }
  // if same reaction, remove the reaction
  else if (existing.reactionType === validatedReactionType) {
    await reactionCollection.deleteOne({ _id: existing._id });

    updateQuery = {
      $inc: { [`stats.${validatedReactionType}s`]: -1 }
    };
  }
  // if switching reaction, remove the old and add the new
  else {
    await reactionCollection.updateOne(
      { _id: existing._id },
      { $set: { reactionType: validatedReactionType } }
    );
    updateQuery = {
      $inc: {
        [`stats.${validatedReactionType}s`]: 1,
        [`stats.${existing.reactionType}s`]: -1
      }
    };
  }
  // update stats
  const updatedComment = await commentCollection.findOneAndUpdate(
    { _id: new ObjectId(validatedCommentId) },
    updateQuery,
    { returnDocument: "after" }
  );
  return updatedComment;
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