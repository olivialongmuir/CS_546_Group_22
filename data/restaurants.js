import { ObjectId } from 'mongodb';
import { restaurants } from '../config/mongoCollections.js';
import { checkId, checkString, checkNumber, checkWebsite, checkPhone, checkReportStatus } from '../helpers.js';

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

export const getRestaurantById = async(id) => {
    const validatedId = checkId(id);
    // Get restaurant collection from database
    const restaurantCollection = await restaurants();
    const restaurantItem = await restaurantCollection.findOne({_id: new ObjectId(validatedId)});

    // Check if database returned anything
    if (restaurantItem == null) throw `Error {getRestaurantById}: No restaurant associated with this id ${validatedId}`;
    // Convert object id to regular string id
    restaurantItem._id = restaurantItem._id.toString();
    return restaurantItem;

};

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
    // Perform validation on all parameters
    const validatedName = checkString(name, "name");
    const validatedType = checkString(type, "type");
    const validatedLatitude = checkNumber(latitude, "latitude");
    const validatedLongitude = checkNumber(longitude, "longitude");
    const validatedWebsite = checkWebsite(website, "website");
    const validatedPhone = checkPhone(phone, "phone");
    const validatedPermitNumber = checkString(permit_number, "permit_number");
    const validatedStatus = checkReportStatus(status, "status");

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
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Error {createRestaurant}: Could not add restaurant to database";
    const newId = insertInfo.insertedId.toString();
    return await getRestaurantById(newId);
};

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
    const validatedId = checkId(id);
    const restaurantCollection = await restaurants();

    // Ensure restaurant exists in database
    const restaurantItem = await restaurantCollection.findOne({_id: new ObjectId(validatedId)});
    if (!restaurantItem) throw `Error {updateRestaurant}: No restaurant associated with this id ${validatedId}`;

    // Dynamically update object
    let updatedFields = {};
    if (name !== undefined) updatedFields.name = checkString(name, "name");
    if (type !== undefined) updatedFields.type = checkString(type, "type");
    if (latitude !== undefined) updatedFields.latitude = checkNumber(latitude, "latitude");
    if (longitude !== undefined) updatedFields.longitude = checkNumber(longitude, "longitude");
    if (website !== undefined) updatedFields.website = checkWebsite(website, "website");
    if (phone !== undefined) updatedFields.phone = checkPhone(phone, "phone");
    if (permit_number !== undefined) updatedFields.permit_number = checkString(permit_number, "permit_number");
    if (status !== undefined) updatedFields.status = checkReportStatus(status, "status");

    if (Object.keys(updatedFields).length === 0) throw "Error {updateRestaurant}: No fields to update";

    // Update restaurant in database
    const updateInfo = await restaurantCollection.updateOne(
        {_id: new ObjectId(validatedId)},
        {$set: updatedFields}
    );

    if (updateInfo.matchedCount === 0) throw `Error {updateRestaurant}: Could not update restaurant with id ${validatedId}`;
    return await getRestaurantById(validatedId);
};

export const deleteRestaurant = async(id) => {
    const validatedId = checkId(id);
    // Get restaurant collection from database
    const restaurantCollection = await restaurants();
    // Delete restaurant from database
    const deletionInfo = await restaurantCollection.deleteOne({_id: new ObjectId(validatedId)});
    if (deletionInfo.deletedCount === 0) throw `Error {deleteRestaurant}: Could not delete restaurant with id ${validatedId}`;
    return { deleted: true };
};


export const getRestaurantComments = async(restaurantId) => {
    const validatedId = checkId(restaurantId);
    // Get restaurant collection from database
    const restaurantCollection = await restaurants();
    // Find restaurant by ID
    const restaurantItem = await restaurantCollection.findOne({_id: new ObjectId(validatedId)});
    if (!restaurantItem) throw `Error {getRestaurantComments}: No restaurant associated with this id ${validatedId}`;
    return (restaurantItem.comments || []).map(c => {
        c._id = c._id.toString();
        return c;
});
};

export const addCommentToRestaurant = async (restaurantId, comment, user) => {
    const validatedId = checkId(restaurantId);
    const newComment = {
        _id: new ObjectId(),
        comment: checkString(comment, "comment"),
        user: checkString(user, "user"),
        createdAt: new Date()
    };
    const restaurantCollection = await restaurants();
    const updateInfo = await restaurantCollection.updateOne(
        { _id: new ObjectId(validatedId) },
        { $push: { comments: newComment } }
    );
    if (updateInfo.matchedCount === 0)
        throw `Error {addCommentToRestaurant}: No restaurant associated with this id ${validatedId}`;

    newComment._id = newComment._id.toString();
    return newComment;
};

export const getRestaurantRodentReports = async (restaurantId) => {
    const validatedId = checkId(restaurantId);
    const restaurantCollection = await restaurants();
    // Check restaurant exists in database
    const restaurant = await restaurantCollection.findOne({
            _id: new ObjectId(validatedId)
    });
    if (!restaurant) throw `Error {getRestaurantRodentReports}: No restaurant with id ${validatedId}`;
    const reportCollection = await rodentReports();
    const reports = await reportCollection
        .find({ restaurantId: validatedId })
        .toArray();
    return reports.map(report => {
        report._id = report._id.toString();
        return report;
    });
};
