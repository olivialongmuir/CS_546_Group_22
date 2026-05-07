import { ObjectId } from 'mongodb';
import { comments, reactions, restaurants } from '../config/mongoCollections.js';
import { 
    checkWebsite, 
    checkPhone, 
    checkRestaurantStatus, 
    checkLatitude,
    checkLongitude,
    checkRestaurantName,
    checkRestaurantType,
    COLLECTION_IDS
} from '../public/js/helpers.js';
import { validateId } from './utility.js';

/**
 * Restaurant Schema:
 * {
 *  _id:                objectId
 *  name:               string
 *  type:               string
 *  latitude:           number
 *  longitude:          number
 *  website:            string
 *  phone:              string
 *  status:             string
 *  stats:              subdocument
 * }
 */

/**
 * Subdocument {stats} Schema:
 * {
 *  likes:              number
 *  dislikes:           number
 * }
 */

/**
 * Gets all restaurants form database as a list of objects
 * @returns restaurantList
 */
export const getAllRestaurants = async() => {
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
    const validatedId = validateId(id, 'restaurantId', errorSource);

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
 * @param {string} name 
 * @param {string} type 
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} website 
 * @param {string} phone 
 * @param {string} status 
 * @returns newRestaurant
 */
export const createRestaurant = async(
    name,
    type,
    latitude,
    longitude,
    website,
    phone,
    status
) => {
    const errorSource = "createRestaurant";
    const validatedName = checkRestaurantName(name);
    const validatedType = checkRestaurantType(type);
    const validatedLatitude = checkLatitude(latitude);
    const validatedLongitude = checkLongitude(longitude);
    const validatedStatus = checkRestaurantStatus(status, "status");

    // Optional
    const validatedWebsite = website != null ? checkWebsite(website) : null;
    const validatedPhone = phone != null ? checkPhone(phone) : null;

    // Create new restaurant object
    const newRestaurant = {
        name: validatedName,
        type: validatedType,
        latitude: validatedLatitude,
        longitude: validatedLongitude,
        website: validatedWebsite,
        phone: validatedPhone,
        status: validatedStatus,
        stats: {
            likes: 0,
            dislikes: 0
        }
    };

    // Insert new restaurant object into database
    const restaurantCollection = await restaurants();
    const insertInfo = await restaurantCollection.insertOne(newRestaurant);
    if (!insertInfo.acknowledged) throw `Error {${errorSource}}: Could not add restaurant to database`;

    // Return newly created restaurant
    const newId = insertInfo.insertedId.toString();
    return await getRestaurantById(newId);
};

/**
 * Updates restaurant by objectId
 * @param {string} id 
 * @param {string} name 
 * @param {string} type 
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} website 
 * @param {string} phone 
 * @param {string} status 
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
    status
) => {
    const errorSource = "updateRestaurant";
    const validatedId = validateId(id, 'restaurantId', errorSource);

    // Template for partial update
    const updateRestaurant = {};
    if (name !== undefined) updateRestaurant["name"] = checkRestaurantName(name);
    if (type !== undefined) updateRestaurant["type"] = checkRestaurantType(type);
    if (latitude !== undefined) updateRestaurant["latitude"] = checkLatitude(latitude);
    if (longitude !== undefined) updateRestaurant["longitude"] = checkLongitude(longitude);
    if (status !== undefined) updateRestaurant["status"] = checkRestaurantStatus(status);

    // Optional
    if (website !== undefined) updateRestaurant["website"] = website != null ? checkWebsite(website) : null;
    if (phone !== undefined) updateRestaurant["phone"] = phone != null ? checkPhone(phone) : null;

    if (Object.keys(updateRestaurant).length === 0) throw `Error {${errorSource}}: No fields to update`;

    // Find restaurant Id and update it
    const restaurantCollection = await restaurants();
    let updateInfo = await restaurantCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$set: {...updateRestaurant}},
        {returnDocument: "after"}
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
    const validatedId = validateId(id, 'restaurantId', errorSource);

    // Delete restaurant from database
    const [restaurantCollection, reactionCollection, commentCollection] = await Promise.all([
        restaurants(),
        reactions(),
        comments()
    ])

    // Delete restaurant from database
    let deletionInfo = await restaurantCollection.deleteOne({_id: new ObjectId(validatedId)});
    if (deletionInfo.deletedCount === 0) throw `Error {${errorSource}}: Could not delete restaurant with id ${validatedId}`;

    // Delete all comments associated with restaurant. Ok to have 0 count since there might not be any comments
    deletionInfo = commentCollection.deleteMany({restaurantId: validatedId});

    // Delete all reactions associated with restaurant. Ok to have 0 count since there might not be any reactions
    deletionInfo = reactionCollection.deleteMany({targetId: validatedId, targetKey: COLLECTION_IDS.RESTAURANT});

    return { deleted: true };
};

/**
 * Gets all restaurant comments as an array
 * @param {string} id 
 * @returns commentItems
 */
export const getRestaurantComments = async(id) => {
    const errorSource = "getRestaurantComments";
    const validatedId = validateId(id, 'restaurantId', errorSource);

    // Check that this restaurant exists in restaurants database
    const restaurantCollection = await restaurants();
    const restaurantItem = await restaurantCollection.findOne({_id: new ObjectId(validatedId)});
    if (!restaurantItem) throw `Error {${errorSource}} No restaurant found with id ${validatedId}`;

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
 * @param {string} id 
 * @returns reportItems
 */
export const getRestaurantRodentReports = async (id) => {
    const errorSource = "getRestaurantRodentReports";
    const validatedId = validateId(id, 'restaurantId', errorSource);

    // Check restaurant exists in database
    const restaurantCollection = await restaurants();
    const restaurant = await restaurantCollection.findOne({_id: new ObjectId(validatedId)});
    if (!restaurant) throw `Error {${errorSource}}: No restaurant with id ${validatedId}`;

    // Gets all rodent reports attached to a restaurant
    const reportCollection = await rodentReports();
    let reportItems = await reportCollection.find({restaurantId: validatedId}).toArray();

    // Ensure all rodent report IDs are in the form of a string
    reportItems = reportItems.map(report => {
        report._id = report._id.toString();
        return report;
    })
    return reportItems;
};
