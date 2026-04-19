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
    if (!userList) throw "Error {getAllUsers}: No user accounts in database";

    //Convert all object ids to string ids
    userList = userList.map(user => {
        user.__id = user.__id.toString();
        return user
    })

    return userList
};

export const getUserById = async(id) => {
    const parsedId = checkId(id);
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(parsedId) });
    if (!user) throw `Error {getUserById}: No user found with id ${id}`;
    user._id = user._id.toString();
    return user;
};

export const createUser = async() => {

};

export const updateUser = async() => {

};

export const deleteUser = async() => {

};

export const getUserComments = async() => {

};