/**
 * Note:
 * Avoid using any special library calls in this helper file.
 * By utilizing only native javascript, the functions in this file can be used for both server-side and client-side calls.
 * If further validation is required, perform it at the point of use.
 */

//General parsing and validation
export const checkString = (str, fieldName) => {
    if (!str) throw `Error: You must provide a value for ${fieldName}`;
    if (str == null) throw `Error: ${fieldName} is null or undefined`
    if (typeof str !== 'string') throw `Error: ${fieldName} must be a string`;
    str = str.trim();
    if (str.length === 0) throw `Error: ${fieldName} cannot be an empty string`;
    return str;
};

export const checkNumber = (num, fieldName) => {
    if (!num) throw `Error: You must provide a value for ${fieldName}`;
    if (num == null) `Error: ${fieldName} is null or undefined`;
    const conv_num = Number(num);
    if (isNaN(conv_num)) throw `Error: ${fieldName} must be a number`;
    if (!Number.isFinite(conv_num)) throw `${fieldName} must be finite`
    return conv_num;
}

//Specific parsing and validation
export const checkId = (id) => {
    const parsed_id = checkString(id, "id");
    return parsed_id; //Moved check objectId out of here for client side compatibility
};

export const checkJobId = (jobId) => {
    const parsed_jobId = checkString(jobId, "jobId");
    if (/^[A-Z]{2}\d{7}$/.test(parsed_jobId)) throw 'Error: jobId must be 2 capital letters followed by 7 numbers'
    return parsed_jobId;
}

export const checkDate = (date) => {
    const parsed_date = checkString(date, "date");
    if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4} (0[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9] (AM|PM)$/.test(parsed_date)) throw 'Error: Date format must match MM/DD/YYYY HH:MM:SS AM|PM'
    return parsed_date;
}

export const checkComment = (comment) => {
    const parsed_comment = checkString(comment, "comment");
    if (parsed_comment.length > 500) throw 'Error: Comment cannot exceed 500 characters';
    return parsed_comment;
};

export const checkDescription = (description) => {
    const parsed_description = checkString(description, "description");
    if (parsed_description.length > 500) throw 'Error: Description cannot exeed 500 characters';
    return parsed_description;
}

export const checkNote = (note) => {
    const parsed_note = checkString(note, "note");
    if (parsed_note.length > 500) throw 'Error: Note cannot exeed 500 characters';
    return parsed_note;
}

export const checkUsername = (username) => {
    const parsed_username = checkString(username, "username");
    if (parsed_username.length < 3) throw 'Error: Username must be at least 3 characters';
    if (parsed_username.length > 20) throw 'Error: Username cannot exceed 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(parsed_username)) throw 'Error: Username can only contain letters, numbers, and underscores';
    return parsed_username;
};

export const checkRodentName = (rodentName) => {
    const parsed_rodentName = checkString(rodentName, "rodentName");
    if (parsed_rodentName.length < 3) throw 'Error: rodentName must be at least 3 characters';
    if (parsed_rodentName.length > 20) throw 'Error: rodentName cannot exceed 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(parsed_rodentName)) throw 'Error: rodentName can only contain letters, numbers, and underscores';
    return parsed_rodentName;
}

export const checkFirstName = (firstName) => {
    const parsed_name = checkString(firstName, "firstName");
    if (!/^[\p{L}\s'-]+$/u.test(parsed_name)) throw 'Error: First name can only '; //Only alphabetic and accented characters. Apostrophes and hyphens are fine
    return parsed_name
}

export const checkLastName = (lastName) => {
    const parsed_name = checkString(lastName, "lastName");
    if (!/^[\p{L}\s'-]+$/u.test(parsed_name)) throw 'Error: Last name can only '; //Only alphabetic and accented characters. Apostrophes and hyphens are fine
    return parsed_name
}

export const checkEmail = (email) => {
    const parsed_email = checkString(email, "email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed_email)) throw 'Error: Email address is not valid';
    return parsed_email;
};

export const checkPhotoUrl = (photoUrl) => {
    const parsed_url = checkString(photoUrl, "photo Url");
    if (!/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(parsed_url)) throw 'Error: Photo URL is not valid';
    return parsed_url;
};

export const checkPassword = (password) => {
    const parsed_password = checkString(password, "password");
    if (parsed_password.length < 8) throw 'Error: Password must be at least 8 characters';
    if (parsed_password.length > 16) throw 'Error: Password can at most be 16 characters';
    if (!/[A-Z]/.test(parsed_password)) throw 'Error: Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(parsed_password)) throw 'Error: Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(parsed_password)) throw 'Error: Password must contain at least one special character (!@#$%^&*)';
    return parsed_password;
};

export const checkZipcode = (zipcode) => {
    const parsed_zipcode = checkString(zipcode, "zipcode"); //zipcode can be 00502
    if (/^\d{5}$/.test(parsed_zipcode)) throw 'Error: Zipcode must contain exactly 5 integers';
    return parsed_zipcode;
};

export const checkRatSizeRating = (rating) => {
    const parsed_rating = checkNumber(rating, "ratSizeRating");
    if (!Number.isInteger(parsed_rating)) throw 'Error: Rat size rating must be an integer';
    if (parsed_rating < 1 || parsed_rating > 10) throw 'Error: Rat size rating must be between 1 and 10';
    return parsed_rating;
};

export const checkReactionType = (reactionType) => {
    const parsed_reaction = checkString(reactionType, "reactionType").toLowerCase();
    const validReactions = ['like', 'dislike', 'confirm', 'dispute', 'flag'];
    if (!validReactions.includes(parsed_reaction)) throw `Error: Reaction type must be one of the following: ${validReactions.join(', ')}`;
    return parsed_reaction;
};

export const checkRestaurantStatus = (restaurantStatus) => {
    const parsed_restaurantStatus = checkString(restaurantStatus, "restaurantStatus").toLowerCase();
    const validStatus = ['sanitary', 'unsanitary', 'inspecting'];
    if (!validStatus.includes(parsed_restaurantStatus)) throw `Error: Report status must be one of the following: ${validStatus.join(', ')}`;
    return parsed_restaurantStatus;
};

export const checkRodentStatus = (rodentStatus) => {
    const parsed_rodentStatus = checkString(rodentStatus, "rodentStatus").toLowerCase();
    const validStatus = ['pending', 'verified', 'disputed', 'removed', 'unverified'];
    if (!validStatus.includes(parsed_rodentStatus)) throw `Error: Report status must be one of the following: ${validStatus.join(', ')}`;
    return parsed_rodentStatus;
};

export const checkUserType = (userType) => {
    const parsed_user = checkString(userType, "userType").toLowerCase();
    const validUsers = ['member', 'exterminator', 'inspector', 'admin'];
    if (!validUsers.includes(parsed_user)) throw `Error: User must be one of the following: ${validUsers.join(', ')}`;
    return parsed_user;
};

export const checkRodentType = (rodentType) => {
    const parsed_type = checkString(rodentType, "rodentType").toLowerCase();
    const validTypes = ["rat", "mouse"];
    if (!validTypes.includes(parsed_type)) throw `Error: rodentType must be one of the following: ${validTypes.join(', ')}`;
    return parsed_type;
};

export const checkWebsite = (website) => {
    const parsed_website = checkString(website, "website");
    if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(parsed_website)) throw 'Error: Website URL is not valid';
    return parsed_website;
};

export const checkPhone = (phone) => {
    const parsed_phone = checkString(phone, "phone");
    if (!/^\d{3}-\d{3}-\d{4}$/.test(parsed_phone)) throw 'Error: Phone number must be in the format XXX-XXX-XXXX';
    return parsed_phone;
}