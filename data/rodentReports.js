import { ObjectId, ReturnDocument } from 'mongodb';
import { rodentReports } from "../config/mongoCollections.js";
import { 
    checkDate, 
    checkDescription, 
    checkId, 
    checkJobId, 
    checkNote, 
    checkNumber, 
    checkPhotoUrl, 
    checkRatSizeRating, 
    checkRatType, 
    checkRodentStatus, 
    checkUserType, 
    checkZipcode 
} from "../helpers.js";

/**
 * Gets all rodent reports from database as a list of objects
 * @returns reportsList
 */
export const getAllReports = async() => {
    // Get rodentReports collection from database
    const reportsCollection = await rodentReports();
    let reportsList = await reportsCollection.find({}).toArray();

    // Check if database returned anything. Return empty array if nothing
    if (reportsList.length === 0) return [];

    // Convert all object ids to string ids
    reportsList = reportsList.map(report => {
        report._id = report._id.toString();
        return report
    })
    return reportsList
};

/**
 * Gets rodent report from database by objectId
 * @param {string} id 
 * @returns reportItem
 */
export const getReportById = async(id) => {
    const errorSource = "getReportById";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    // Get rodentReports collection from database
    const reportsCollection = await rodentReports();
    const reportItem = await reportsCollection.findOne({_id: new ObjectId(validatedId)});
    if (!reportItem) throw `Error {${errorSource}}: No report associated with this id ${validatedId}`;

    // Convert object id to regular string id
    reportItem._id = reportItem._id.toString();
    return reportItem;
};

/**
 * Creates a new rodent report and inserts it into the database
 * @param {*} jobId 
 * @param {*} zipcode 
 * @param {*} latitude 
 * @param {*} longitude 
 * @param {*} inspectionDate 
 * @param {*} status 
 * @param {*} approvedDate 
 * @param {*} restaurantId 
 * @param {*} userId 
 * @param {*} description 
 * @returns newReport
 */
export const createReport = async(
    jobId,
    zipcode,
    latitude,
    longitude,
    inspectionDate,
    status,
    approvedDate,
    restaurantId,
    userId,
    description
) => {
    const errorSource = "createReport";
    const validatedZipcode = checkZipcode(zipcode);
    const validatedLatitude = checkNumber(latitude, "latitude");
    const validatedLongitude = checkNumber(longitude, "longitude");
    const validatedInspectionDate = checkDate(inspectionDate);
    const validatedStatus = checkRodentStatus(status);
    const validatedDate = checkDate(approvedDate);
    const validatedDescription = checkDescription(description);

    const validatedJobId = checkJobId(jobId);
    if (!ObjectId.isValid(validatedJobId)) throw `Error {${errorSource}}: jobId is not a valid objectId`;

    const validatedRestaurantId =  checkId(restaurantId);
    if (!ObjectId.isValid(validatedRestaurantId)) throw `Error {${errorSource}}: restaurantId is not a valid objectId`;

    const validatedUserId = checkId(userId);
    if (!ObjectId.isValid(validatedUserId)) throw `Error {${errorSource}}: userId is not a valid objectId`;
    
    // Make sure no duplicate report exists
    const reportCollection = await rodentReports();
    const reportInfo = reportCollection.findOne({jobId: validatedJobId})
    if (reportInfo) throw `Error {${errorSource}}: Report with this jobId already exists`;

    // Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();

    // Template for new report
    const newReport = {
        jobId: validatedJobId,
        zipcode: validatedZipcode,
        latitude: validatedLatitude,
        longitude: validatedLongitude,
        inspectionDate: validatedInspectionDate,
        status: validatedStatus,
        approvedDate: validatedDate,
        restaurantId: validatedRestaurantId,
        userId: validatedUserId,
        description: validatedDescription,
        rodent: [],
        timestamp: timestamp,
        updatedAt: null,
        verifiedBy: null
    }

    // Insert new report into database
    const insertInfo = await reportCollection.insertOne(newReport);
    if (!insertInfo.acknowledged) throw `Error {${errorSource}}: Unable to add new report`;

    // Return newly created report
    const newId = insertInfo.insertedId.toString();
    return await getReportById(newId);
};

/**
 * Updates rodent report by objectId
 * @param {*} id
 * @param {*} jobId 
 * @param {*} zipcode 
 * @param {*} latitude 
 * @param {*} longitude 
 * @param {*} inspectionDate 
 * @param {*} status 
 * @param {*} approvedDate 
 * @param {*} restaurantId 
 * @param {*} userId 
 * @param {*} description 
 * @param {*} verifiedBy 
 * @returns updateInfo
 */
export const updateReport = async(
    id,
    jobId,
    zipcode,
    latitude,
    longitude,
    inspectionDate,
    status,
    approvedDate,
    restaurantId,
    userId,
    description,
    verifiedBy
) => {
    const errorSource = "updateReport";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    // Template for partial update
    const updateReport = {};
    if (zipcode !== undefined) updateReport["zipcode"] = checkZipcode(jobId);
    if (latitude !== undefined) updateReport["latitude"] = checkNumber(latitude, "latitude");
    if (longitude !== undefined) updateReport["longitude"] = checkNumber(longitude, "longitude");
    if (inspectionDate !== undefined) updateReport["inspectionDate"] = checkDate(inspectionDate);
    if (status !== undefined)  updateReport["status"] = checkReportStatus(status);
    if (approvedDate !== undefined) updateReport["approvedDate"] = checkDate(approvedDate);
    if (description !== undefined) updateReport["description"] = checkDescription(description);
    if (verifiedBy !== undefined) updateReport["verifiedBy"] = checkUserType(verifiedBy);

    if (jobId !== undefined) {
        updateReport["jobId"] = checkJobId(jobId);
        if (!ObjectId.isValid(updateReport.jobId)) throw `Error {${errorSource}}: jobId is not a valid objectId`;
    }

    if (restaurantId !== undefined) {
        updateReport["restaurantId"] = checkId(restaurantId);
        if (!ObjectId.isValid(updateReport.restaurantId)) throw `Error {${errorSource}}: restaurantId is not a valid objectId`;
    }

    if (userId !== undefined) {
        updateReport["userId"] = checkId(userId);
        if (!ObjectId.isValid(updateReport.userId)) throw `Error {${errorSource}}: userId is not a valid objectId`;
    }

    if (Object.keys(updateReport).length === 0) throw `Error {${errorSource}}: No fields to update`;

    // Find report matching Id and update it
    const reportCollection = await rodentReports();
    const updateInfo = await reportCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$set: {...updateReport}},
        {ReturnDocument: "after"}
    );
    if (!updateInfo) throw `Error {${errorSource}}: Could update rodent report with id ${validatedId}`;

    updateInfo._id = updateInfo._id.toString();
    return updateInfo
};

/**
 * Appends new rodent to sub-field of rodent report by objectId
 * @param {string} id 
 * @param {string} name 
 * @param {string} type 
 * @param {string} rating 
 * @param {string} note 
 * @param {string} photoUrl 
 * @returns insertInfo
 */
export const createRodent = async(
    id,
    name,
    type,
    rating,
    note,
    photoUrl
) => {
    const errorSource = "createRodent";
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    const validatedName = checkName(name);
    const validatedType = checkRatType(type);
    const validatedRating = checkRatSizeRating(rating);
    const validatedNote = checkNote(note);
    const validatedPhotoUrl = checkPhotoUrl(photoUrl);

    // Template for new rodent comment
    const newRodent = {
        name: validatedName,
        type: validatedType,
        rating: validatedRating,
        note: validatedNote,
        photoUrl: validatedPhotoUrl
    }
    
    // Insert new rodent into database
    const reportCollection = await rodentReports();
    const insertInfo = await reportCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$push: {rodent: newRodent}},
        {returnDocument: "after"}
    );
    if (!insertInfo) throw `Error {${errorSource}}: Could not find and push rodent to id ${validatedId}`;

    // Return newly created report
    const newId = insertInfo.insertedId.toString();
    return await getReportById(newId);
};

/**
 * Deletes rodent report from database by objectId
 * @param {string} id 
 * @returns
 */
export const deleteReport = async(id) => {
    const errorSource = "deleteReport"
    const validatedId = checkId(id);
    if (!ObjectId.isValid(validatedId)) throw `Error {${errorSource}}: ID is not a valid objectId`;

    // Delete report from database
    const reportCollection = await rodentReports();
    const deletionInfo = await reportCollection.findOneAndDelete({_id: new ObjectId(validatedId)});
    if (!deletionInfo.deletedCount === 0) throw `Error {${errorSource}}: Could not delete rodent report with id ${validatedId}`;

    return { deleted: true };
};