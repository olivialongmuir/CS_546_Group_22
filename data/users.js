import { users } from "../config/mongoCollections.js";
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
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(parsedId) });
    if (!user) throw `Error {getUserById}: No user found with id ${id}`;
    user._id = user._id.toString();
    return user;
};

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

};

export const deleteUser = async () => {

};

export const getUserComments = async () => {

};
