import { ObjectId } from 'mongodb';
import { checkId } from "../helpers.js";

/**
 * Note:
 * Client side validation functions that utilizes libraries not available to client side JS
 * Can modify helper.js functions here for further validation
 * Also contains some analytics functions
 */

export const validateId = (id, name, errorSource) => {
    const parsed_id = checkId(id);
    if (!ObjectId.isValid(parsed_id)) throw `Error {${errorSource}}: ${name} is not a valid objectId`;
};

