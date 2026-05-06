import { ObjectId } from 'mongodb';
import { checkId } from "../public/js/helpers.js";
import { users, rodentReports, restaurants } from '../config/mongoCollections.js';

/**
 * Note:
 * Client side validation functions that utilizes libraries not available to client side JS
 * Can modify helper.js functions here for further validation
 * Also contains some analytics functions
 */
export const validateId = (id, name, errorSource) => {
    const parsed_id = checkId(id);
    if (!ObjectId.isValid(parsed_id)) throw `Error {${errorSource}}: ${name} is not a valid objectId`;
    return parsed_id;
};

/**
 * Queries database for statistics
 * Used in homepage and AJAX polling
 * @returns 
 */
export const countStats = async () => {
    const [restaurantCollection, reportCollection, userCollection] = await Promise.all([
        restaurants(),
        rodentReports(),
        users()
    ]);

    const [totalRestaurants, totalReports, totalUsers, totalVerified] = await Promise.all([
        restaurantCollection.estimatedDocumentCount(),
        reportCollection.estimatedDocumentCount(),
        userCollection.estimatedDocumentCount(),
        reportCollection.countDocuments({status: 'verified'})
    ]);

    return {
        totalRestaurants: totalRestaurants,
        totalReports: totalReports,
        totalUsers: totalUsers,
        totalVerified: totalVerified
    };
};