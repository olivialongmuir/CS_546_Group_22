import { users, comments } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { hash, compare } from "bcryptjs";
import { 
    checkEmail, 
    checkFirstName, 
    checkLastName, 
    checkPassword, 
    checkUsername, 
    checkUserType 
} from "../helpers.js";
import { validateId } from "./utility.js";

/**
 * Gets all users from database as a list of objects
 * @returns usersList
 */
export const getAllUsers = async() => {
    // Get users collection from database
    const usersCollection = await users();
    let userList = await usersCollection.find({}).toArray();

    // Check if database returned anything
    if (userList.length === 0) return [];

    // Convert all object ids to string ids
    userList = userList.map(user => {
        user.__id = user.__id.toString();
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
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

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
export const createUser = async(
    type,
    firstName,
    lastName,
    username,
    password,
    emailAddress
) => {
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
    if (userInfo) throw `Error {${errorSource}}: Unable to create user`;

    // Also emails have to be unique
    const emailInfo = await userCollection.findOne({emailAddress: validatedEmail});
    if (emailInfo) throw `Error {${errorSource}}: Unable to create user`;

    // Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();

    // Hash our password and salt it
    const hashPassword = await hash(validatedPassword, 10);

    // Template for new user
    const newUser = {
        type: validatedType,
        firstName: validatedFirstName,
        lastName: validatedLastName,
        username: validatedUsername,
        emailAddress: validatedEmail,
        hashPassword: hashPassword,
        timestamp: timestamp
    }

    // Save into database as a new user
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged) throw `Error {${errorSource}}: Could not add user to database`;

    const newId = insertInfo.insertedId.toString();
    return await getUserById(newId);
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

    // Check that this user exists in user database
    const userCollection = await users();
    const userItems = await userCollection.findOne({_id: new ObjectId(validatedId)});
    if (!userItems) `Error {${errorSource}} No user found with id ${validatedId}`;

    // Get all comments from comments database associated with this user
    const commentCollection = await comments();
    let commentItems = await commentCollection
        .find({userId: validatedId})
        .toArray(); // Assuming not too many comments

    // Ensure all comment IDs are in the form of a string
    commentItems = (commentItems || []).map(item => {
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

    // Check user exists in database
    const userCollection = await users();
    const userItems = await userCollection.findOne({_id: new ObjectId(validatedId)});
    if (!userItems) `Error {${errorSource}} No user found with id ${validatedId}`;

    // Gets all rodent reports attached to a user
    const reportCollection = await rodentReports();
    let reportItems = await reportCollection
        .find({userId: validatedId})
        .toArray();

    // Ensure all rodent report IDs are in the form of a string
    reportItems = reportItems.map(report => {
        report._id = report._id.toString();
        return report;
    })
    return reportItems;
};