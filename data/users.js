import { users } from "../config/mongoCollections.js";
<<<<<<< HEAD
import { ObjectId, ReturnDocument } from "mongodb";
import { hash, compare } from "bcrypt";
import { 
    checkComment,
    checkEmail, 
    checkFirstName, 
    checkId, 
    checkLastName, 
    checkPassword, 
    checkUsername, 
    checkUserType 
} from "../helpers.js";

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
=======
import {
    checkId,
    checkString,
    checkUsername,
    checkEmail,
    checkPassword,
    checkUserType
} from "../helpers.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const getAllUsers = async () => {
    const usersCollection = await users();
    let userList = await usersCollection.find({}).toArray();
    if (!userList) throw "Error {getAllUsers}: No user accounts in database";

    userList = userList.map(user => {
        user._id = user._id.toString();
        delete user.hashPassword;
        return user;
    });

    return userList;
};

export const getUserById = async (id) => {
    const parsedId = checkId(id);
>>>>>>> main
    const usersCollection = await users();
    const userItem = await usersCollection.findOne({_id: new ObjectId(validatedId)});
    if (!userItem) throw `Error {${errorSource}}: No user found with id ${id}`;

    userItem._id = userItem._id.toString();
    return userItem;
};

<<<<<<< HEAD
/**
 * Creates a new user with selected type and inserts it into the database
 * @param {*} type 
 * @param {*} firstName 
 * @param {*} lastName 
 * @param {*} username      //Must be unique
 * @param {*} password 
 * @param {*} emailAddress  //Must be unique
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
=======
export const createUser = async ({
    firstName,
    lastName,
    username,
    emailAddress,
    password,
    type
}) => {
    const validatedFirstName = checkString(firstName, "firstName");
    const validatedLastName = checkString(lastName, "lastName");
    const validatedUsername = checkUsername(username);
    const validatedEmail = checkEmail(emailAddress).toLowerCase();
    const validatedPassword = checkPassword(password);
    const validatedType = checkUserType(type);

    const usersCollection = await users();

    const existingByUsername = await usersCollection.findOne({ username: validatedUsername });
    if (existingByUsername) throw "Error: Username is already taken";

    const existingByEmail = await usersCollection.findOne({ emailAddress: validatedEmail });
    if (existingByEmail) throw "Error: An account with that email already exists";

    const hashPassword = await bcrypt.hash(validatedPassword, SALT_ROUNDS);

    const newUser = {
        type: validatedType,
        firstName: validatedFirstName,
        lastName: validatedLastName,
        username: validatedUsername,
        emailAddress: validatedEmail,
        hashPassword,
        timestamp: new Date().toISOString(),
        comments: []
    };

    const insertInfo = await usersCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw "Error {createUser}: Could not create user";
    }

    const inserted = { ...newUser, _id: insertInfo.insertedId.toString() };
    delete inserted.hashPassword;
    return inserted;
};

export const updateUser = async () => {
>>>>>>> main

    // Make sure no duplicate user exists
    const userCollection = await users();
    const userInfo = userCollection.findOne({username: validatedUsername});
    if (userInfo) throw `Error {${errorSource}}: Unable to create user`;

    // Also emails have to be unique
    const emailInfo = userCollection.findOne({emailAddress: validatedEmail});
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
        timestamp: timestamp,
        comments: []
    }

    // Save into database as a new user
    const insertInfo = userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged) throw `Error {${errorSource}}: Could not add user to database`;

    const newId = insertInfo.insertedId.toString();
    return await getUserById(newId);
};

<<<<<<< HEAD
/**
 * Updates user by objectId
 * @param {*} id 
 * @param {*} type 
 * @param {*} firstName 
 * @param {*} lastName 
 * @param {*} emailAddress 
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
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: id is not a valid objectId`;
=======
export const deleteUser = async () => {
>>>>>>> main

    // Template for partial update
    const updateUser = {};
    if (type !== undefined) updateUser["type"] = checkUserType(type);
    if (firstName !== undefined) updateUser["firstName"] = checkFirstName(firstName);
    if (lastName !== undefined) updateUser["lastName"] = checkLastName(lastName);
    if (emailAddress !== undefined) updateUser["emailAddress"] = checkEmail(emailAddress);

    if (Object.keys(updateUser).length === 0) throw `Error {${errorSource}}: No fields to update`;

    // Find user Id and update it
    const userCollection = await users();
    const updateInfo = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$set: {...updateUser}},
        {ReturnDocument: "after"}
    );
    if (!updateInfo) throw `Error {${errorSource}}: Could not update user with id ${validatedId}`;

    updateInfo._id = updateInfo._id.toString();
    return updateInfo;
};

<<<<<<< HEAD
/**
 * Appends new comment id to user comments array
 * @param {*} id 
 * @param {*} commentId 
 * @returns newComment
 */
export const addCommentToUser = async (
    id,
    commentId
) => {
    const errorSource = "createComment";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: id is not a valid objectId`;
=======
export const getUserComments = async () => {
>>>>>>> main

    const validatedCommentId = checkId(commentId);
    if (!ObjectId.isValid(validatedCommentId)) throw `Error {${errorSource}}: commentId is not a valid objectId`;

    // Add the comment id to user comments
    const userCollection = await users();
    const updateInfo = userCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$push: {comments: validatedCommentId}},
        {ReturnDocument: "after"}
    )
    if (!updateInfo) throw `Error {${errorSource}}: No user associated with this id ${validatedId}`;

    updateInfo._id = updateInfo._id.toString();
    return updateInfo
};
<<<<<<< HEAD

/**
 * Deletes user from database by objectId
 * @param {string} id 
 * @returns 
 */
export const deleteUser = async(id) => {
    const errorSource = "deleteUser";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    // Get user collection from database
    const userCollection = await users();

    // Delete user from database
    const deletionInfo = await userCollection.deleteOne({_id: validatedId});
    if (deletionInfo.deletedCount === 0) throw `Error {${errorSource}}: Could not delete user with id ${validatedId}`;

    return { deleted: true };
};

/**
 * 
 * @param {string} id 
 * @returns commentList
 */
export const getUserComments = async(id) => {
    const errorSource = "getUserComments";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    
};
=======
>>>>>>> main
