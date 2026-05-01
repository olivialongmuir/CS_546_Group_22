import { ObjectId } from 'mongodb';
import { rodentReports } from "../config/mongoCollections.js";
import { 
    checkDate, 
    checkDescription, 
    checkJobId, 
    checkNote, 
    checkPhotoUrl, 
    checkRatSizeRating, 
    checkRodentName,
    checkRodentType, 
    checkRodentStatus, 
    checkUserType, 
    checkZipcode, 
    checkLatitude,
    checkLongitude,
    checkNumber
} from "../helpers.js";
import { validateId } from './utility.js';

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
    const validatedId = validateId(id, 'reportId', errorSource);

    // Get rodentReports collection from database
    const reportsCollection = await rodentReports();
    let foundInfo = await reportsCollection.findOne({_id: new ObjectId(validatedId)});
    if (!foundInfo) throw `Error {${errorSource}}: No report associated with this id ${validatedId}`;

    // Convert object id to regular string id
    foundInfo._id = foundInfo._id.toString();
    return foundInfo;
};

/**
 * Creates a new rodent report and inserts it into the database
 * @param {string} jobId 
 * @param {string} zipcode 
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} inspectionDate 
 * @param {string} status 
 * @param {string} approvedDate 
 * @param {string} restaurantId 
 * @param {string} userId 
 * @param {string} description 
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
    const validatedStatus = checkRodentStatus(status);
    const validatedDescription = checkDescription(description);
    const validatedUserId = validateId(userId, 'userId', errorSource);


    let validatedJobId = null;
    if(jobId != null){
        validatedJobId = checkJobId(jobId);
    }

    //Allowed null values for dates. These values are null until a validation event
    let validatedInspectionDate = null;
    if(restaurantId != null){
        validatedInspectionDate = checkDate(inspectionDate);
    }
    let validatedDate = null;
    if(approvedDate != null){
        validatedDate = checkDate(approvedDate);
    }

    //null restaurant id for an unassocated report
    let validatedRestaurantId = null;
    if(restaurantId != null){
        validatedRestaurantId = validateId(restaurantId, 'restaurantId', errorSource);
    }


    //Make sure no duplicate report exists
    //Removing this logic because JobID isnt used in our website to identify a report
    // const reportCollection = await rodentReports();
    // const reportInfo = await reportCollection.findOne({jobId: validatedJobId})
    // if (reportInfo) throw `Error {${errorSource}}: Report with this jobId already exists`;

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
    const reportsCollection = await rodentReports()
    const insertInfo = await reportsCollection.insertOne(newReport);
    if (!insertInfo.acknowledged) throw `Error {${errorSource}}: Unable to add new report`;

    // Return newly created report
    const newId = insertInfo.insertedId.toString();
    return await getReportById(newId);
};



/**
 * Updates rodent report by objectId
 * @param {string} id
 * @param {string} jobId 
 * @param {string} zipcode 
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} inspectionDate 
 * @param {string} status 
 * @param {string} approvedDate 
 * @param {string} restaurantId 
 * @param {string} userId 
 * @param {string} description 
 * @param {string} verifiedBy 
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
    const validatedId = validateId(id, 'reportId', errorSource);

    // Template for partial update
    const updateReport = {};
    if (zipcode !== undefined) updateReport["zipcode"] = checkZipcode(zipcode);
    if (latitude !== undefined) updateReport["latitude"] = checkLatitude(latitude);
    if (longitude !== undefined) updateReport["longitude"] = checkLongitude(longitude);
    if (inspectionDate !== undefined) updateReport["inspectionDate"] = checkDate(inspectionDate);
    if (status !== undefined)  updateReport["status"] = checkReportStatus(status);
    if (approvedDate !== undefined) updateReport["approvedDate"] = checkDate(approvedDate);
    if (description !== undefined) updateReport["description"] = checkDescription(description);
    if (verifiedBy !== undefined) updateReport["verifiedBy"] = checkUserType(verifiedBy);
    if (jobId !== undefined) {updateReport["jobId"] = checkJobId(jobId);}
    if (restaurantId !== undefined) {updateReport["restaurantId"] = validateId(restaurantId, 'restaurantId', errorSource);}
    if (userId !== undefined) {updateReport["userId"] = validateId(userId, 'userId', errorSource);}

    if (Object.keys(updateReport).length === 0) throw `Error {${errorSource}}: No fields to update`;

    // Find report matching Id and update it
    const reportCollection = await rodentReports();
    let updateInfo = await reportCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$set: {...updateReport}},
        {returnDocument: "after"}
    );
    if (!updateInfo) throw `Error {${errorSource}}: Could update rodent report with id ${validatedId}`;

    updateInfo._id = updateInfo._id.toString();
    return updateInfo;
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
    const validatedId = validateId(id, 'reportId', errorSource);
    const validatedName = checkRodentName(name);
    const validatedType = checkRodentType(type);
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
    let insertInfo = await reportCollection.findOneAndUpdate(
        {_id: new ObjectId(validatedId)},
        {$push: {rodent: newRodent}},
        {returnDocument: "after"}
    );
    if (!insertInfo) throw `Error {${errorSource}}: Could not find and push rodent to id ${validatedId}`;

    // Return newly created report
    insertInfo._id = insertInfo._id.toString();
    return insertInfo;
};

/**
 * Deletes rodent report from database by objectId
 * @param {string} id 
 * @returns
 */
export const deleteReport = async(id) => {
    const errorSource = "deleteReport"
    const validatedId = validateId(id, 'reportId', errorSource);

    // Delete report from database
    const reportCollection = await rodentReports();
    const deletionInfo = await reportCollection.findOneAndDelete({_id: new ObjectId(validatedId)});
    if (!deletionInfo.deletedCount === 0) throw `Error {${errorSource}}: Could not delete rodent report with id ${validatedId}`;

    return { deleted: true };
};