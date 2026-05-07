import { ObjectId } from "mongodb";
import { comments, reactions, rodentReports, restaurants } from "../config/mongoCollections.js";
import { checkComment, COLLECTION_IDS, validateCommentType } from "../public/js/helpers.js";
import { validateId } from "./utility.js";

/**
 * Comments Schema:
 * {
 *  _id:                objectId
 *  userId:             string
 *  restaurantId:       string
 *  comment:            string
 *  timestamp:          string
 *  edited:             bool
 *  stats:              subdocument
 * }
 */

/**
 * Subdocument {stats} Schema:
 * {
 *  likes:              number
 *  dislikes:           number
 * }
 */

/**
 * Creates a new comment and inserts it into the database. Updates all linked collections
 * @param {string} userId 
 * @param {string} commentType defines wether or not should be a 'restuarant' or a 'rodent' comment
 * @param {string} targetId  if of rodent or restaurant
 * @param {string} comment 
 * @returns newComment
 */
export const createComment = async(
    userId,
    commentType,
    targetId,
    comment
) => {


    const errorSource = "createComment";
    const validatedUserId = validateId(userId, 'userId', errorSource);
    const validatedCommentType = validateCommentType(commentType)
    const validatedTargetId = validateId(targetId, 'targetId', errorSource);
    const validatedComment = checkComment(comment);

    // Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();


    //Determines wether or not should be a restuarant or a rodent comment and sets other type as null. This allows use to use shared collection
    let restaurantId;
    let rodentReportId;
    if(validatedCommentType == 'restaurant'){
        restaurantId = validatedTargetId;
        rodentReportId = null;
    }else if(validatedCommentType == 'rodent'){
        restaurantId = null;
        rodentReportId = validatedTargetId;
    }

    // Template for new comment
    const newComment = {
        userId: validatedUserId,
        restaurantId: restaurantId,
        rodentReportId: rodentReportId,
        comment: validatedComment,
        timestamp: timestamp,
        edited: false,
        updatedAt: null,
        stats: {
            likes: 0,
            dislikes: 0
        }
    }

    // Insert new comment. Must append id to restaurant and user collections
    const commentCollection = await comments();
    const insertInfo = await commentCollection.insertOne(newComment);
    if (!insertInfo.acknowledged) throw `Error {${errorSource}}: Could not add comment to database`;

    // Return newly created comment
    const newId = insertInfo.insertedId.toString();

    if (validatedCommentType === 'restaurant') {
        const restaurantCollection = await restaurants();
        const updateResult = await restaurantCollection.updateOne(
        { _id: new ObjectId(validatedTargetId) },
        { $push: { comments: newId } }
    );

    if (updateResult.modifiedCount === 0) {
      throw `Error {${errorSource}}: Failed to append comment to restaurant`;
    }
    } else if (validatedCommentType === 'rodent') {
        const rodentCollection = await rodentReports();
        const updateResult = await rodentCollection.updateOne(
        { _id: new ObjectId(validatedTargetId) },
        { $push: { comments: newId } }
        );

        if (updateResult.modifiedCount === 0) {
        throw `Error {${errorSource}}: Failed to append comment to rodent report`;
        }
    }
    return await getCommentById(newId);
}



/**
 * Gets comment from database by objectId
 * @param {string} id 
 * @returns commentItem
 */
export const getCommentById = async(id) => {
    const errorSource = "getCommentById";
    const validatedId = validateId(id, 'commentId', errorSource);

    // Find comment from database
    const commentCollection = await comments();
    let commentItem = await commentCollection.findOne({_id: new ObjectId(validatedId)});
    if (!commentItem) throw `{${errorSource}}: No comment found with id ${validatedId}`;

    commentItem._id = commentItem._id.toString();
    return commentItem;
};

/**
 * Updates comment by objectId
 * @param {string} id 
 * @param {string} comment 
 * @returns updateInfo
 */
export const updateComment = async(
    id,
    comment
) => {
    const errorSource = "updateComment";
    const validatedId = validateId(id, 'commentId', errorSource);
    const validatedComment = checkComment(comment);

    // Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();

    // Update comment
    const commentCollection = await comments();
    let updateInfo = await commentCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$set: {
            comment: validatedComment,
            edited: true,
            updatedAt: timestamp
        }},
        {returnDocument: "after"}
    )
    if (!updateInfo) throw `Error {${errorSource}}: Could not update comment with id ${validatedId}`;

    updateInfo._id = updateInfo._id.toString();
    return updateInfo;
};

/**
 * Deletes comment from database by objectId. Removes all reactions for that comment
 * @param {string} id 
 * @returns 
 */
export const deleteComment = async (id) => {
  const errorSource = "deleteComment";

  const validatedId = validateId(id, "commentId", errorSource);

  const [commentCollection, reactionCollection] = await Promise.all([
    comments(),
    reactions()
  ]);

  // delete the comment
  const deletionInfo = await commentCollection.deleteOne({
    _id: new ObjectId(validatedId)
  });

  if (deletionInfo.deletedCount === 0) {
    throw `Error {${errorSource}}: Could not delete comment with id ${validatedId}`;
  }

  // delete all related reactions
  await reactionCollection.deleteMany({
    targetId: validatedId,
    targetKey: COLLECTION_IDS.COMMENT
  });

  return { deleted: true };
};
