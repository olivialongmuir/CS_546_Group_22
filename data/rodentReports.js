import { ObjectId } from 'mongodb';
import { reactions, rodentReports, comments } from "../config/mongoCollections.js";
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
    COLLECTION_IDS
} from "../public/js/helpers.js";
import { validateId } from './utility.js';

/**
 * Restaurant Schema:
 * {
 *  _id:                objectId
 *  jobId:              string
 *  zipcode:            string
 *  latitude:           number
 *  longitude:          number
 *  inspectionDate:     string
 *  status:             string
 *  approvedDate:       string
 *  restaurantId:       string
 *  userId:             string
 *  description:        string
 *  rodent:             array of subdocuments
 *  timestamp:          string
 *  updatedAt:          string
 *  verifiedBy:         string
 *  stats:              subdocument
 * }
 */

/**
 * Subdocument {rodent} Schema:
 * {
 *  name:               string
 *  type:               string
 *  rating:             number
 *  note:               string
 *  photoUrl:           string
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
 * Gets all rodent reports from database as a list of objects
 * @returns reportsList
 */
export const getAllReports = async() => {
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
    const validatedLatitude = checkLatitude(latitude);
    const validatedLongitude = checkLongitude(longitude);
    const validatedStatus = checkRodentStatus(status);
    const validatedDescription = checkDescription(description);
    const validatedUserId = validateId(userId, 'userId', errorSource);

    // Allow null values for jobId. This is an optional field, not used in project currently
    const validatedJobId = jobId != null ? checkJobId(jobId) : null;

    // Allowed null values for dates. These values are null until a validation event
    const validatedInspectionDate = restaurantId != null ? checkDate(inspectionDate) : null;
    const validatedDate = approvedDate != null ? checkDate(approvedDate) : null;

    // null restaurant id for an unassocated report
    const validatedRestaurantId = restaurantId != null ? validateId(restaurantId, 'restaurantId', errorSource) : null;

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
        verifiedBy: null,
        comments:[],
        stats: {
            likes: 0,
            dislikes: 0
        }
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
    if (status !== undefined)  updateReport["status"] = checkRodentStatus(status);
    if (approvedDate !== undefined) updateReport["approvedDate"] = checkDate(approvedDate);
    if (description !== undefined) updateReport["description"] = checkDescription(description);
    if (verifiedBy !== undefined) updateReport["verifiedBy"] = checkUserType(verifiedBy);
    if (jobId !== undefined) updateReport["jobId"] = jobId != null ? checkJobId(jobId) : null; // jobId is optionally null
    if (restaurantId !== undefined) updateReport["restaurantId"] = validateId(restaurantId, 'restaurantId', errorSource);
    if (userId !== undefined) updateReport["userId"] = validateId(userId, 'userId', errorSource);

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
 * Appends new rodent subdocument to rodent report by objectId
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

    // Template for new rodent sighting
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
    const [reportCollection, reactionCollection] = await Promise.all([
        rodentReports(),
        reactions()
    ])

    let deletionInfo = await reportCollection.deleteOne({_id: new ObjectId(validatedId)});
    if (!deletionInfo.deletedCount === 0) throw `Error {${errorSource}}: Could not delete rodent report with id ${validatedId}`;

    // Also have to delete all corresponding reactions. Ok to have 0 count since not all rodent reports have reactions
    deletionInfo = await reactionCollection.deleteMany({targetId: validatedId, targetKey: COLLECTION_IDS.REPORT});

    return { deleted: true };
};



/**
 * Gets all comments for a rodent report as an array
 * @param {string} id 
 * @returns commentItems
 */
export const getRodentReportComments = async(id) => {
    const errorSource = "getRodentReportComments";
    const validatedId = validateId(id, 'rodentReportId', errorSource);

    // Check that this restaurant exists in restaurants database
    const rodentsCollection = await rodentReports();
    const rodentItem = await rodentsCollection.findOne({_id: new ObjectId(validatedId)});
    if (!rodentItem) throw `Error {${errorSource}} No rodent found with id ${validatedId}`;

    // Get all comments from comments database associated with this restaurant
    //Use the rodent ID as search key instead of restaurant
    const commentCollection = await comments();
    let commentItems = await commentCollection.find({rodentReportId: validatedId}).toArray(); // Assuming not too many comments



    // Ensure all comment IDs are in the form of a string
    commentItems = (commentItems || []).map(item => {
        item._id = item._id.toString();
        return item
    })

    return commentItems
};