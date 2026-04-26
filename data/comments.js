import { ObjectId, ReturnDocument } from "mongodb";
import { users, restaurants, comments } from "../config/mongoCollections.js";
import { checkComment, checkId } from "../helpers.js";

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

    // Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();

    // Create a new comment. Must append id to restaurant and user collections

}

export const getCommentById = async(id) => {
    const errorSource = "getCommentById";
    const validatedId = checkId(userId);
    if (!ObjectId.isValid(validatedUserId)) throw `Error {${errorSource}}: userId is not a valid objectId`;

    // Find comment from database
    const commentCollection = await comments();
    const commentItem = await commentCollection.findOne({_id: new ObjectId(validatedId)});
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