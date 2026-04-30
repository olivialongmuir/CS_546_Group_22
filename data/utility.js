import { ObjectId } from 'mongodb';
import { checkId } from "../helpers.js";
<<<<<<< HEAD
import { users, rodentReports, restaurants } from '../config/mongoCollections.js';
=======
>>>>>>> ff17a18f64d3541a758b3910ddaada1d78ac67bb

/**
 * Note:
 * Client side validation functions that utilizes libraries not available to client side JS
 * Can modify helper.js functions here for further validation
<<<<<<< HEAD
 * Also contains some analytics functions
=======
>>>>>>> ff17a18f64d3541a758b3910ddaada1d78ac67bb
 */

export const validateId = (id, name, errorSource) => {
    const parsed_id = checkId(id);
    if (!ObjectId.isValid(parsed_id)) throw `Error {${errorSource}}: ${name} is not a valid objectId`;
<<<<<<< HEAD
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
=======
>>>>>>> ff17a18f64d3541a758b3910ddaada1d78ac67bb
};