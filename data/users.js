import { users } from "../config/mongoCollections.js";

/**
 * Gets all users from database as a list of objects
 * @returns usersList
 */
export const getAllUsers = async() => {
    //Get users collection from database
    const usersCollection = await users();
    let userList = await usersCollection.find({}).toArray();

    //Check if database returned anything
    if (!userList) throw "Error {getAllUsers}: No user accounts in database";

    //Convert all object ids to string ids
    userList = userList.map(user => {
        user.__id = user.__id.toString();
        return user
    })

    return userList
};

export const getUserById = async() => {

};

export const createUser = async() => {

};

export const updateUser = async() => {

};

export const deleteUser = async() => {

};

export const getUserComments = async() => {

};