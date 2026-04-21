import { users } from "../config/mongoCollections.js";
import { checkId } from "../helpers.js";
import { ObjectId } from "mongodb";

/**
 * Gets all users from database as a list of objects
 * @returns usersList
 */
export const getAllUsers = async() => {
    //Get users collection from database
    const usersCollection = await users();
    let userList = await usersCollection.find({}).toArray();

    //Check if database returned anything
    if (userList.length === 0) throw "Error {getAllUsers}: No user accounts in database";

    //Convert all object ids to string ids
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

    //Get rodentReports collection from database
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(parsedId) });
    if (!user) throw `Error {${errorSource}}: No user found with id ${id}`;
    user._id = user._id.toString();
    return user;
};

export const createUser = async() => {
    const errorSource = "createUser";

};

export const updateUser = async() => {
    const errorSource = "updateUser";

};

export const deleteUser = async() => {
    const errorSource = "deleteUser";

};

export const getUserComments = async() => {
    const errorSource = "getUserComments";

};