import { ObjectId, ReturnDocument } from "mongodb";
import { users, restaurants, comments } from "../config/mongoCollections.js";
import { checkComment, checkId } from "../helpers.js";

/**
 * Creates a new comment and inserts it into the database. Updates all linked collections
 * @param {string} userId 
 * @param {string} restaurantId 
 * @param {string} comment 
 * @returns newComment
 */
export const createComment = async(
    userId,
    restaurantId,
    comment
) => {
    const errorSource = "createComment";
    const validatedUserId = checkId(userId);
    if (!ObjectId.isValid(validatedUserId)) throw `Error {${errorSource}}: userId is not a valid objectId`;

    const validatedRestaurantId = checkId(restaurantId);
    if (!ObjectId.isValid(validatedRestaurantId)) throw `Error {${errorSource}}: restaurantId is not a valid objectId`;

    const validatedComment = checkComment(comment);

    // Check user exists in database
    const userCollection = await users();
    const userItems = await userCollection.findOne({_id: new ObjectId(validatedUserId)});
    if (!userItems) `Error {${errorSource}} No user found with id ${validatedUserId}`;

    // Check restaurant exists in database
    const restaurantCollection = await restaurants();
    const restaurantItem = await restaurantCollection.findOne({_id: new ObjectId(validatedRestaurantId)});
    if (!restaurantItem) throw `Error {${errorSource}}: No restaurant with id ${validatedRestaurantId}`;

    // Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();

    // Template for new comment
    const newId = new ObjectId();
    const newIdStr = newId.toString();
    const newComment = {
        _id: newId,
        userId: validatedUserId,
        restaurantId: validatedRestaurantId,
        comment: validatedComment,
        timestamp: timestamp
    }

    // Insert new comment. Must append id to restaurant and user collections
    const commentCollection = await comments();
    const insertInfo = await commentCollection.insertOne(newComment);
    if (!insertInfo.acknowledged) throw `Error {${errorSource}}: Could not add comment to database`;

    // Update user and restaurants comments array. This can be done concurrently as they are independent events
    const updateUserQuery = userCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedUserId)},
        {$push: {comments: newIdStr}}
    )

    const updateRestaurantQuery = restaurantCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedRestaurantId)},
        {$push: {comments: newIdStr}}
    )

    await Promise.all([updateUserQuery, updateRestaurantQuery]);

    // Return newly created comment
    return await getCommentById(newIdStr);
}

/**
 * Gets comment from database by objectId
 * @param {string} id 
 * @returns commentItem
 */
export const getCommentById = async(id) => {
    const errorSource = "getCommentById";
    const validatedId = checkId(userId);
    if (!ObjectId.isValid(validatedUserId)) throw `Error {${errorSource}}: userId is not a valid objectId`;

    // Find comment from database
    const commentCollection = await comments();
    let commentItem = await commentCollection.findOne({_id: new ObjectId(validatedId)});
    if (!commentItem) throw `{${errorSource}}: No comment found with id ${validatedId}`;

    commentItem._id = commentItem._id.toString();
    return commentItem;
};

export const deleteComment = async(id) => {
    const errorSource = "getCommentById";
    const validatedId = checkId(userId);
    if (!ObjectId.isValid(validatedUserId)) throw `Error {${errorSource}}: userId is not a valid objectId`;

    // Delete comment from database. Must remove ids from restaurant and user list
}