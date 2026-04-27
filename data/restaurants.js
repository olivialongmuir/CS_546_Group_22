import { ObjectId, ReturnDocument } from 'mongodb';
import { comments, restaurants } from '../config/mongoCollections.js';
import { 
    checkId,
    checkString, 
    checkNumber, 
    checkWebsite, 
    checkPhone, 
    checkRestaurantStatus, 
    checkUsername
} from '../helpers.js';

/**
 * Gets all restaurants form database as a list of objects
 * @returns restaurantList
 */
export const getAllRestaurants = async() => {
    // Get restaurant collection from database
    const restaurantCollection = await restaurants();
    let restaurantList = await restaurantCollection.find({}).toArray();

    // If restaurantList is empty, return empty array
    if (restaurantList.length === 0) return [];

    // Convert all object ids to string ids
    restaurantList = restaurantList.map(restaurant => {
        restaurant._id = restaurant._id.toString();
        return restaurant
    })
    return restaurantList;
};

/**
 * Gets restaurant from database by objectId
 * @param {string} id 
 * @returns 
 */
export const getRestaurantById = async(id) => {
    const errorSource = "getRestaurantById";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    // Get restaurant collection from database
    const restaurantCollection = await restaurants();
    let restaurantItem = await restaurantCollection.findOne({_id: new ObjectId(validatedId)});
    if (!restaurantItem) throw `Error {${errorSource}}: No restaurant associated with this id ${validatedId}`;

    // Convert object id to regular string id
    restaurantItem._id = restaurantItem._id.toString();
    return restaurantItem;
};

/**
 * Creates a new restaurant and inserts it into the database
 * @param {*} name 
 * @param {*} type 
 * @param {*} latitude 
 * @param {*} longitude 
 * @param {*} website 
 * @param {*} phone 
 * @param {*} permit_number 
 * @param {*} status 
 * @returns newRestaurant
 */
export const createRestaurant = async(
    name,
    type,
    latitude,
    longitude,
    website,
    phone,
    permit_number,
    status
) => {
    const errorSource = "createRestaurant";
    // Perform validation on all parameters
    const validatedName = checkString(name, "name");
    const validatedType = checkString(type, "type");
    const validatedLatitude = checkNumber(latitude, "latitude");
    const validatedLongitude = checkNumber(longitude, "longitude");
    const validatedWebsite = checkWebsite(website, "website");
    const validatedPhone = checkPhone(phone, "phone");
    const validatedPermitNumber = checkString(permit_number, "permit_number");
    const validatedStatus = checkRestaurantStatus(status, "status");

    // Get restaurant collection from database
    const restaurantCollection = await restaurants();

    // Create new restaurant object
    const newRestaurant = {
        name: validatedName,
        type: validatedType,
        latitude: validatedLatitude,
        longitude: validatedLongitude,
        website: validatedWebsite,
        phone: validatedPhone,
        permit_number: validatedPermitNumber,
        status: validatedStatus
    };

    // Insert new restaurant object into database
    const insertInfo = await restaurantCollection.insertOne(newRestaurant);
    if (!insertInfo.acknowledged) throw `Error {${errorSource}}: Could not add restaurant to database`;

    // Return newly created restaurant
    const newId = insertInfo.insertedId.toString();
    return await getRestaurantById(newId);
};

/**
 * Updates restaurant by objectId
 * @param {*} id 
 * @param {*} name 
 * @param {*} type 
 * @param {*} latitude 
 * @param {*} longitude 
 * @param {*} website 
 * @param {*} phone 
 * @param {*} permit_number 
 * @param {*} status 
 * @returns updateInfo
 */
export const updateRestaurant = async(
    id,
    name,
    type,
    latitude,
    longitude,
    website,
    phone,
    permit_number,
    status
) => {
    const errorSource = "updateRestaurant";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: id is not a valid objectId`;

    // Template for partial update
    const updateRestaurant = {};
    if (name !== undefined) updateRestaurant["name"] = checkString(name, "name");
    if (type !== undefined) updateRestaurant["type"] = checkString(type, "type");
    if (latitude !== undefined) updateRestaurant["latitude"] = checkNumber(latitude, "latitude");
    if (longitude !== undefined) updateRestaurant["longitude"] = checkNumber(longitude, "longitude");
    if (website !== undefined) updateRestaurant["website"] = checkWebsite(website);
    if (phone !== undefined) updateRestaurant["phone"] = checkPhone(phone);
    if (permit_number !== undefined) updateRestaurant["permit_number"] = checkString(permit_number);
    if (status !== undefined) updateRestaurant["status"] = checkRestaurantStatus(status);

    if (Object.keys(updateRestaurant).length === 0) throw `Error {${errorSource}}: No fields to update`;

    // Find restaurant Id and update it
    const restaurantCollection = await restaurants();
    let updateInfo = await restaurantCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$set: {...updateRestaurant}},
        {ReturnDocument: "after"}
    );
    if (!updateInfo) throw `Error {${errorSource}}: Could not update restaurant with id ${validatedId}`;

    updateInfo._id = updateInfo._id.toString();
    return updateInfo;
};

/**
 * Deletes restaurant from database by objectId
 * @param {string} id 
 * @returns 
 */
export const deleteRestaurant = async(id) => {
    const errorSource = "deleteRestaurant";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    // Delete restaurant from database
    const restaurantCollection = await restaurants();
    const deletionInfo = await restaurantCollection.deleteOne({_id: new ObjectId(validatedId)});
    if (deletionInfo.deletedCount === 0) throw `Error {${errorSource}}: Could not delete restaurant with id ${validatedId}`;

    return { deleted: true };
};

/**
 * Gets all restaurant comments as an array
 * @param {string} id 
 * @returns commentItems
 */
export const getRestaurantComments = async(id) => {
    const errorSource = "getRestaurantComments";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    // Check that this restaurant exists in restaurants database
    const restaurantCollection = await restaurants();
    const restaurantItem = await restaurantCollection.findOne({_id: new ObjectId(validatedId)});
    if (!restaurantItem) `Error {${errorSource}} No restaurant found with id ${validatedId}`;

    // Get all comments from comments database associated with this restaurant
    const commentCollection = await comments();
    let commentItems = await commentCollection.find({restaurantId: validatedId}).toArray(); // Assuming not too many comments

    // Ensure all comment IDs are in the form of a string
    commentItems = (commentItems || []).map(item => {
        item._id = item._id.toString();
        return item
    })
    return commentItems
};

/**
 * Gets a list of rodent reports associated with restaurant by objectId
 * @param {string} restaurantId 
 * @returns rodentReports
 */
export const getRestaurantRodentReports = async (restaurantId) => {
    const errorSource = "getRestaurantRodentReports";
    const validatedId = checkId(restaurantId);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    // Check restaurant exists in database
    const restaurantCollection = await restaurants();
    const restaurant = await restaurantCollection.findOne({_id: new ObjectId(validatedId)});
    if (!restaurant) throw `Error {${errorSource}}: No restaurant with id ${validatedId}`;

    // Gets all rodent reports attached to a restaurant
    const reportCollection = await rodentReports();
    let reportItems = await reportCollection
        .find({restaurantId: validatedId})
        .toArray();

    // Ensure all rodent report IDs are in the form of a string
    reportItems = reportItems.map(report => {
        report._id = report._id.toString();
        return report;
    })
    return reportItems;
};
