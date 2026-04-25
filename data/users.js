import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { hash, compare } from "bcrypt";
import { 
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
    const usersCollection = await users();
    const userItem = await usersCollection.findOne({_id: new ObjectId(validatedId)});
    if (!userItem) throw `Error {${errorSource}}: No user found with id ${id}`;

    userItem._id = userItem._id.toString();
    return userItem;
};

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

export const updateUser = async(id) => {
    const errorSource = "updateUser";

};

export const deleteUser = async(id) => {
    const errorSource = "deleteUser";

};

export const getUserComments = async(id) => {
    const errorSource = "getUserComments";

};