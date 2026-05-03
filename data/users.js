import { users, comments, reactions, restaurants, rodentReports } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { hash, compare } from "bcryptjs";
import { 
    checkEmail, 
    checkFirstName, 
    checkLastName, 
    checkPassword, 
    checkUsername, 
    checkUserType,
    COLLECTION_IDS,
} from "../helpers.js";
import { validateId } from "./utility.js";
import { getRestaurantById } from "./restaurants.js";

/**
 * User Schema:
 * {
 *  type:               string
 *  firstName:          string
 *  lastName:           string
 *  username:           string
 *  emailAddress:       string
 *  hashPassword:       string
 *  approved:           string
 *  timestamp:          string
 * }
 */

/**
 * Gets all users from database as a list of objects
 * @returns usersList
 */
export const getAllUsers = async() => {
    const usersCollection = await users();
    let userList = await usersCollection.find({}).toArray();

    // Check if database returned anything
    if (userList.length === 0) return [];

    // Convert all object ids to string ids
    userList = userList.map(user => {
        user._id = user._id.toString();
        delete user.hashPassword; // Do not return hased password
        return user
    })
    return userList
};

/**
 * Gets user from database by objectId
 * @param {string} id 
 * @returns userItem
 */
export const getUserById = async(id) => {
    const errorSource = "getUserById";
    const validatedId = validateId(id, 'userId', errorSource);

    // Get rodentReports collection from database
    const usersCollection = await users();
    let userItem = await usersCollection.findOne({_id: new ObjectId(validatedId)});
    if (!userItem) throw `Error {${errorSource}}: No user found with id ${validatedId}`;

    userItem._id = userItem._id.toString();
    return userItem;
};

/**
 * Creates a new user with selected type and inserts it into the database
 * @param {string} type 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} username      //Must be unique
 * @param {string} password 
 * @param {string} emailAddress  //Must be unique
 * @returns newUser
 */
export const createUser = async({
    type,
    firstName,
    lastName,
    username,
    password,
    emailAddress
}) => {
    const errorSource = "createUser";
    const validatedType = checkUserType(type);
    const validatedFirstName = checkFirstName(firstName);
    const validatedLastName = checkLastName(lastName);
    const validatedUsername = checkUsername(username);
    const validatedPassword = checkPassword(password);
    const validatedEmail = checkEmail(emailAddress);

    // Make sure no duplicate user exists
    const userCollection = await users();
    const userInfo = await userCollection.findOne({username: validatedUsername});
    if (userInfo) throw `Error {${errorSource}}: Username is already taken`;

    // Also emails have to be unique
    const emailInfo = await userCollection.findOne({emailAddress: validatedEmail});
    if (emailInfo) throw `Error {${errorSource}}: An account with that email already exists`;

    // Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();

    // Hash our password and salt it
    const hashPassword = await hash(validatedPassword, 10);

    // Consumers are auto-approved; everyone else requires admin approval
    const approved = validatedType === 'consumer';

    // Template for new user
    const newUser = {
        type: validatedType,
        firstName: validatedFirstName,
        lastName: validatedLastName,
        username: validatedUsername,
        emailAddress: validatedEmail,
        hashPassword: hashPassword,
        approved: approved,
        timestamp: timestamp
    }

    // Save into database as a new user
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged) throw `Error {${errorSource}}: Could not add user to database`;

    const newId = insertInfo.insertedId.toString();
    return await getUserById(newId);
};

/**
 * Returns all users currently awaiting admin approval
 * @returns pendingUsers
 */
export const getPendingUsers = async () => {
    const userCollection = await users();
    let pending = await userCollection.find({ approved: false }).toArray();

    // Check if database returned anything
    if (pending.length === 0) return [];

    pending = pending.map(user => {
        user._id = user._id.toString();
        delete user.hashPassword; // Do not return hased password
        return user;
    });
    return pending;
};

/**
 * Marks a user as approved
 * @param {string} id
 * @returns updatedUser
 */
export const approveUser = async (id) => {
    const errorSource = "approveUser";
    const validatedId = validateId(id, 'userId', errorSource);

    const userCollection = await users();
    const result = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(validatedId) },
        { $set: { approved: true } },
        { returnDocument: 'after' }
    );
    if (!result) throw `Error {${errorSource}}: Could not approve user with id ${validatedId}`;

    result._id = result._id.toString();
    delete result.hashPassword;
    return result;
};

/**
 * Updates user by objectId
 * @param {string} id 
 * @param {string} type 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} emailAddress 
 * @returns updateInfo
 */
export const updateUser = async(
    id,
    type,
    firstName,
    lastName,
    emailAddress
) => {
    const errorSource = "updateUser";
    const validatedId = validateId(id, 'userId', errorSource);

    // Template for partial update
    const updateUser = {};
    if (type !== undefined) updateUser["type"] = checkUserType(type);
    if (firstName !== undefined) updateUser["firstName"] = checkFirstName(firstName);
    if (lastName !== undefined) updateUser["lastName"] = checkLastName(lastName);
    if (emailAddress !== undefined) updateUser["emailAddress"] = checkEmail(emailAddress);

    if (Object.keys(updateUser).length === 0) throw `Error {${errorSource}}: No fields to update`;

    // Find user Id and update it
    const userCollection = await users();
    let updateInfo = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$set: {...updateUser}},
        {returnDocument: "after"}
    );
    if (!updateInfo) throw `Error {${errorSource}}: Could not update user with id ${validatedId}`;

    updateInfo._id = updateInfo._id.toString();
    delete updateInfo.hashPassword; // Do not return hased password
    return updateInfo;
};

/**
 * Deletes user from database by objectId
 * @param {string} id 
 * @returns 
 */
export const deleteUser = async(id) => {
    const errorSource = "deleteUser";
    const validatedId = validateId(id, 'userId', errorSource);

    // Delete user from database
    const userCollection = await users();
    const deletionInfo = await userCollection.deleteOne({_id: validatedId});
    if (deletionInfo.deletedCount === 0) throw `Error {${errorSource}}: Could not delete user with id ${validatedId}`;

    return { deleted: true };
};

/**
 * Gets all user comments as an array
 * @param {string} id 
 * @returns commentList
 */
export const getUserComments = async(id) => {
    const errorSource = "getUserComments";
    const validatedId = validateId(id, 'userId', errorSource);

    // Get all comments from comments database associated with this user
    const commentCollection = await comments();
    let commentItems = await commentCollection.find({userId: validatedId}).toArray();
    if (commentItems.length === 0) return [];

    // Ensure all comment IDs are in the form of a string
    commentItems = commentItems.map(item => {
        item._id = item._id.toString();
        return item
    })
    return commentItems
};

/**
 * Gets a list of rodent reports associated with user by objectId
 * @param {string} id 
 * @returns rodentReports
 */
export const getUserRodentReports = async (id) => {
    const errorSource = "getUserRodentReports";
    const validatedId = validateId(id, 'userId', errorSource);

    // Gets all rodent reports attached to a user
    const reportCollection = await rodentReports();
    let reportItems = await reportCollection.find({userId: validatedId}).toArray();

    // Check if database returned anything. Return empty array if nothing
    if (reportItems.length === 0) return [];

    // Ensure all rodent report IDs are in the form of a string
    reportItems = reportItems.map(report => {
        report._id = report._id.toString();
        return report;
    })
    return reportItems;
};

/**
 * Gets all reports that user have reacted to
 * @param {string} userId 
 * @param {string} reportId 
 * @returns reportsList
 */
export const getUserReactedReports = async(userId, reportId) => {
    const errorSource = 'getAllReactedReports';
    const validatedReportId = validateId(reportId, 'reportId', errorSource);
    const validatedUserId = validateId(userId, 'userId', errorSource);

    const [reportsCollection, reactionCollection] = await Promise.all([
        rodentReports(),
        reactions()
    ]);

    // Find all reactions by user on a report
    const reactionsList = await reactionCollection.find({
        userId: validatedUserId, 
        targetId: validatedReportId,
        targetKey: COLLECTION_IDS.REPORT
    }).toArray();

    // Check if database returned anything. Return empty array if nothing
    if (reactionsList.length === 0) return [];

    // Get just the ids
    const reportIds = reactionsList.map(reaction => new ObjectId(reaction.targetId));
    
    // Find matching items by objectId
    let itemsList = await reportsCollection.find({
        _id: {$in: reportIds}
    }).toArray();

    // Check if database returned anything. Return empty array if nothing
    if (itemsList.length === 0) return [];

    // Convert all object ids to string ids
    itemsList = itemsList.map(report => {
        report._id = report._id.toString();
        return report
    })
    return itemsList
}

/**
 * Gets all comments that user have reacted to
 * @param {string} userId 
 * @param {string} commentId 
 * @returns commentsList
 */
export const getUserReactedComments = async(userID, commentId) => {
    const errorSource = 'getUserReactedComments';
    const validatedCommentId = validateId(commentId, 'commentId', errorSource);
    const validatedUserId = validateId(userID, 'userId', errorSource);

    const [commentCollection, reactionCollection] = await Promise.all([
        comments(),
        reactions()
    ]);

    // Find all reactions by user on a report
    const reactionsList = await reactionCollection.find({
        userId: validatedUserId, 
        targetId: validatedCommentId,
        targetKey: COLLECTION_IDS.COMMENT
    }).toArray();

    // Check if database returned anything. Return empty array if nothing
    if (reactionsList.length === 0) return [];

    // Get just the ids
    const reportIds = reactionsList.map(reaction => new ObjectId(reaction.targetId));
    
    // Find matching items by objectId
    let itemsList = await commentCollection.find({
        _id: {$in: reportIds}
    }).toArray();

    // Check if database returned anything. Return empty array if nothing
    if (itemsList.length === 0) return [];

    // Convert all object ids to string ids
    itemsList = itemsList.map(report => {
        report._id = report._id.toString();
        return report
    })
    return itemsList
}

/**
 * Gets all restaurants that user have reacted to
 * @param {string} userId 
 * @param {string} restaurantId 
 * @returns restaurantsList
 */
export const getUserReactedRestaurants = async(userID, restaurantId) => {
    const errorSource = 'getAllReactedReports';
    const validatedCommentId = validateId(restaurantId, 'restaurantId', errorSource);
    const validatedUserId = validateId(userID, 'userId', errorSource);

    const [restaurantsCollection, reactionCollection] = await Promise.all([
        restaurants(),
        reactions()
    ]);

    // Find all reactions by user on a report
    const reactionsList = await reactionCollection.find({
        userId: validatedUserId, 
        targetId: validatedCommentId,
        targetKey: COLLECTION_IDS.RESTAURANT
    }).toArray();

    // Check if database returned anything. Return empty array if nothing
    if (reactionsList.length === 0) return [];

    // Get just the ids
    const reportIds = reactionsList.map(reaction => new ObjectId(reaction.targetId));
    
    // Find matching items by objectId
    let itemsList = await restaurantsCollection.find({
        _id: {$in: reportIds}
    }).toArray();

    // Check if database returned anything. Return empty array if nothing
    if (itemsList.length === 0) return [];

    // Convert all object ids to string ids
    itemsList = itemsList.map(report => {
        report._id = report._id.toString();
        return report
    })
    return itemsList
}
/**
 * Aggregate user activity
 * @param {string} userId 
 * @returns activity(10)
 */
export const getUserActivity = async (userId) => {
  const [userComments, reports] = await Promise.all([
    getUserComments(userId),
    getUserRodentReports(userId)
  ]);

  // store activity
  const activity = [];

  // comments
  for (let c of userComments) {
    const restaurant = await getRestaurantById(c.restaurantId);

    activity.push({
      type: "comment",
      text: `You commented on "${restaurant.name}"`,
      time: c.timestamp,
      color: "blue",
      link: `/restaurants/${restaurant._id}`,
      status: restaurant.status?.key
    });
  }

  // reports
  for (let r of reports) {
    activity.push({
    type: "report",
    text: `You submitted a rodent report`,
    time: r.timestamp,
    color: "orange",
    link: `/ratreports/${r._id}`
    });
  }

  // find reactions
  const commentsCollection = await comments();
  const reactionCollection = await reactions();
  const userReactions = await reactionCollection
    .find({ userId })
    .toArray();

  for (let r of userReactions) {
    if (r.targetKey === COLLECTION_IDS.COMMENT) {

        const comment = await commentsCollection.findOne({
        _id: new ObjectId(r.targetId)
        });

        if (!comment) continue;

        const preview = comment.comment.length > 60
            ? comment.comment.slice(0, 60) + "..."
            : comment.comment;

        activity.push({
            type: "reaction",
            text: `You ${r.reactionType}d: "${preview}"`,
            time: r.timestamp,
            color: r.reactionType === "like" ? "green" : "red"
        });
    }
  }
  activity.sort((a, b) => new Date(b.time) - new Date(a.time));

  // return most recent 5
  return activity.slice(0, 5);
};