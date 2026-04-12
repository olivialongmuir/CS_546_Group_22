import { ObjectId } from 'mongodb';
import { rodentReports } from "../config/mongoCollections.js";
import { checkDate, checkDescription, checkId, checkJobId, checkNote, checkNumber, checkPhotoUrl, checkRatSizeRating, checkRatType, checkReportStatus, checkVerifiedBy, checkZipcode } from "../helpers.js";

/**
 * Gets all rodent reports from database as a list of objects
 * @returns reportsList
 */
export const getAllReports = async() => {
    //Get rodentReports collection from database
    const reportsCollection = await rodentReports();
    let reportsList = await reportsCollection.find({}).toArray();

    //Check if database returned anything
    if (!reportsList) throw "Error {getAllReports}: No rodent reports in database";

    //Convert all object ids to string ids
    reportsList = reportsList.map(report => {
        report.__id = report.__id.toString();
        return report
    })

    return reportsList
};

/**
 * Gets rodent report from database by object id
 * @param {string} id 
 * @returns reportItem
 */
export const getReportById = async(id) => {
    //Perform validation on id
    const parsed_id = checkId(id);

    //Get rodentReports collection from database
    const reportsCollection = await rodentReports();
    const reportItem = await reportsCollection.findOne({__id: new ObjectId(parsed_id)});

    //Check if database returned anything
    if (reportItem == null) throw `Error {getReportById}: No report associated with this id ${parsed_id}`;

    //Convert object id to regular string id
    reportItem.__id = reportItem.__id.toString();
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
    const parsed_jobId = checkJobId(jobId);
    const parsed_zipcode = checkZipcode(zipcode);
    const parsed_latitude = checkNumber(latitude, "latitude");
    const parsed_longitude = checkNumber(longitude, "longitude");
    const parsed_inspectionDate = checkDate(inspectionDate);
    const parsed_status = checkReportStatus(status);
    const parsed_approvedDate = checkDate(approvedDate);
    const parsed_restaurantId =  checkId(restaurantId);
    const parsed_userId = checkId(userId);
    const parsed_description = checkDescription(description);

    //Make sure no duplicate report exists
    const reportList = await getAllReports();
    if (reportList.some(report => report.jobId === parsed_jobId)) throw 'Error {createReport}: Report with this jobId already exists';

    //Timestamp request
    const now = new Date();
    const timestamp = now.toISOString();

    //Template for new report
    const newReport = {
        jobId: parsed_jobId,
        zipcode: parsed_zipcode,
        latitude: parsed_latitude,
        longitude: parsed_longitude,
        inspectionDate: parsed_inspectionDate,
        status: parsed_status,
        approvedDate: parsed_approvedDate,
        restaurantId: parsed_restaurantId,
        userId: parsed_userId,
        description: parsed_description,
        rodent: [],
        timestamp: timestamp,
        updatedAt: null,
        verifiedBy: null
    }

    //Insert new report into database
    const reportCollection = await rodentReports();
    const insertInfo = await reportCollection.insertOne(newReport);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Error {createReport}: Unable to add new report';

    //Return newly created report
    const newId = insertInfo.insertedId.toString();
    return await getReportById(newId);
};

/**
 * Updates rodent report by object id
 * Null inputs are skipped to allow patching
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
 * @returns foundReport
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
    const parsed_id = checkId(id);

    //Template for partial update
    const updateReport = {};
    if (jobId !== null) updateReport["jobId"] = checkJobId(jobId);
    if (zipcode !== null) updateReport["zipcode"] = checkZipcode(jobId);
    if (latitude !== null) updateReport["latitude"] = checkNumber(latitude, "latitude");
    if (longitude !== null) updateReport["longitude"] = checkNumber(longitude, "longitude");
    if (inspectionDate !== null) updateReport["inspectionDate"] = checkDate(inspectionDate);
    if (status !== null)  updateReport["status"] = checkReportStatus(status);
    if (approvedDate !== null) updateReport["approvedDate"] = checkDate(approvedDate);
    if (restaurantId !== null) updateReport["restaurantId"] = checkId(restaurantId);
    if (userId !== null) updateReport["userId"] = checkId(userId);
    if (description !== null) updateReport["description"] = checkDescription(description);
    if (verifiedBy !== null) updateReport["verifiedBy"] = checkVerifiedBy(verifiedBy);

    //Find report matching Id and update it
    const reportCollection = await rodentReports();
    const foundReport = await reportCollection.findOneAndUpdate(
        {__id: new ObjectId(parsed_id)},
        {$set: {...updateReport}},
        {ReturnDocument: "after"}
    );
    if (!foundReport) throw `Error {updateReport}: Could not find and update id ${parsed_id}`;

    return foundReport
};

/**
 * Appends new rodent to sub-field of rodent report by object id
 * @param {*} id 
 * @param {*} name 
 * @param {*} type 
 * @param {*} rating 
 * @param {*} note 
 * @param {*} photoUrl 
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
    const parsed_id = checkId(id);
    const parsed_name = checkName(name);
    const parsed_type = checkRatType(type);
    const parsed_rating = checkRatSizeRating(rating);
    const parsed_note = checkNote(note);
    const parsed_photoUrl = checkPhotoUrl(photoUrl);

    //Template for new rodent comment
    const newRodent = {
        name: parsed_name,
        type: parsed_type,
        rating: parsed_rating,
        note: parsed_note,
        photoUrl: parsed_photoUrl
    }
    
    //Insert new rodent into database
    const reportCollection = await rodentReports();
    const insertInfo = await reportCollection.findOneAndUpdate(
        {__id: new ObjectId(parsed_id)},
        {$push: {rodent: newRodent}},
        {ReturnDocument: "after"}
    );
    if (!insertInfo) throw `Error {createRodent}: Could not find and push rodent to id ${parsed_id}`;

    //Return newly created report
    const newId = insertInfo.insertedId.toString();
    return await getReportById(newId);
};

/**
 * Deletes rodent report from database by object id
 * @param {*} id 
 * @returns deletionInfo
 */
export const deleteReport = async(id) => {
    const parsed_id = checkId(id);

    //Delete report from database
    const reportCollection = await rodentReports();
    const deletionInfo = await reportCollection.findOneAndDelete({__id: new ObjectId(parsed_id)});
    if (!deletionInfo) throw `Error {deleteReport}: Could not delete id ${parsed_id}`;

    return deletionInfo
};