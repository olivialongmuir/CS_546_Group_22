/**
 * Note:
 * Avoid using any special library calls in this helper file.
 * By utilizing only native javascript, the functions in this file can be used for both server-side and client-side calls.
 * If further validation is required, perform it at the point of use.
 */

// General parsing and validation
export const checkString = (str, name) => {
    if (!str) throw `Error: You must provide a value for ${name}`;
    if (str == null) throw `Error: ${name} is null or undefined`
    if (typeof str !== 'string') throw `Error: ${name} must be a string`;
    str = str.trim();
    if (str.length === 0) throw `Error: ${name} cannot be an empty string`;
    return str;
};

export const checkNumber = (num, name) => {
    if (!num) throw `Error: You must provide a value for ${name}`;
    if (num == null) `Error: ${name} is null or undefined`;
    const conv_num = Number(num);
    if (isNaN(conv_num)) throw `Error: ${name} must be a number`;
    if (!Number.isFinite(conv_num)) throw `${name} must be finite`
    return conv_num;
}

// Specific parsing and validation
export const checkId = (id) => {
    const parsed_id = checkString(id, 'id');
    return parsed_id; //Moved check objectId out of here for client side compatibility
};

export const checkJobId = (jobId) => {
    const parsed_jobId = checkString(jobId, 'jobId');
    if (!(/^[A-Z]{2}\d{7}$/.test(parsed_jobId))) throw 'Error: jobId must be 2 capital letters followed by 7 numbers'
    return parsed_jobId;
}

export const checkDate = (date) => {
    const parsed_date = checkString(date, 'date');
    if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4} (0[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9] (AM|PM)$/.test(parsed_date)) throw 'Error: Date format must match MM/DD/YYYY HH:MM:SS AM|PM'
    return parsed_date;
}

export const checkComment = (comment) => {
    const parsed_comment = checkString(comment, 'comment');
    if (parsed_comment.length > 500) throw 'Error: Comment cannot exceed 500 characters';
    return parsed_comment;
};

export const checkDescription = (description) => {
    const parsed_description = checkString(description, 'description');
    if (parsed_description.length > 500) throw 'Error: Description cannot exeed 500 characters';
    return parsed_description;
}

export const checkNote = (note) => {
    const parsed_note = checkString(note, 'note');
    if (parsed_note.length > 500) throw 'Error: Note cannot exeed 500 characters';
    return parsed_note;
}

export const checkUsername = (username) => {
    const parsed_username = checkString(username, 'username');
    if (parsed_username.length < 3) throw 'Error: Username must be at least 3 characters';
    if (parsed_username.length > 20) throw 'Error: Username cannot exceed 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(parsed_username)) throw 'Error: Username can only contain letters, numbers, and underscores';
    return parsed_username;
};

export const checkRodentName = (rodentName) => {
    const parsed_rodentName = checkString(rodentName, 'rodentName');
    if (parsed_rodentName.length < 3) throw 'Error: rodentName must be at least 3 characters';
    if (parsed_rodentName.length > 20) throw 'Error: rodentName cannot exceed 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(parsed_rodentName)) throw 'Error: rodentName can only contain letters, numbers, and underscores';
    return parsed_rodentName;
}

export const checkRestaurantName = (restaurantName) => {
    const parsed_restaurantName = checkString(restaurantName, 'restaurantName');
    if (parsed_restaurantName.length < 1) throw 'Error: restaurantName must be at least 1 character';
    if (parsed_restaurantName.length > 100) throw 'Error: restaurantName cannot exceed 20 characters';
    if (!/^[a-zA-Z0-9_'&-]+$/.test(parsed_restaurantName)) throw 'Error: rodentName can only contain letters, numbers, underscores, apostrophes, ampersands, and hyphens';
    return parsed_restaurantName;
}

export const checkFirstName = (firstName) => {
    const parsed_name = checkString(firstName, 'firstName');
    if (!/^[\p{L}\s'-]+$/u.test(parsed_name)) throw 'Error: First name can only '; //Only alphabetic and accented characters. Apostrophes and hyphens are fine
    return parsed_name
}

export const checkLastName = (lastName) => {
    const parsed_name = checkString(lastName, 'lastName');
    if (!/^[\p{L}\s'-]+$/u.test(parsed_name)) throw 'Error: Last name can only '; //Only alphabetic and accented characters. Apostrophes and hyphens are fine
    return parsed_name
}

export const checkEmail = (email) => {
    const parsed_email = checkString(email, 'email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed_email)) throw 'Error: Email address is not valid';
    return parsed_email;
};

export const checkPhotoUrl = (photoUrl) => {
    const parsed_url = checkString(photoUrl, 'photo Url');
    if (!/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(parsed_url)) throw 'Error: Photo URL is not valid';
    return parsed_url;
};

export const checkPassword = (password) => {
    const parsed_password = checkString(password, 'password');
    if (parsed_password.length < 8) throw 'Error: Password must be at least 8 characters';
    if (parsed_password.length > 16) throw 'Error: Password can at most be 16 characters';
    if (!/[A-Z]/.test(parsed_password)) throw 'Error: Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(parsed_password)) throw 'Error: Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(parsed_password)) throw 'Error: Password must contain at least one special character (!@#$%^&*)';
    return parsed_password;
};

export const checkZipcode = (zipcode) => {


    const parsed_zipcode = checkString(zipcode, 'zipcode'); //zipcode can be 00502

    if (!(/^\d{5}$/.test(parsed_zipcode))) throw 'Error: Zipcode must contain exactly 5 integers';
    return parsed_zipcode;
};

export const checkLatitude = (latitude) => {
    const parsed_latitude = checkNumber(latitude, 'latitude');
    return parsed_latitude;
}

export const checkLongitude = (longitude) => {
    const parsed_longitude = checkNumber(longitude, 'longitude');
    return parsed_longitude;
}

export const checkRatSizeRating = (rating) => {
    const parsed_rating = checkNumber(rating, 'ratSizeRating');
    if (!Number.isInteger(parsed_rating)) throw 'Error: Rat size rating must be an integer';
    if (parsed_rating < 1 || parsed_rating > 10) throw 'Error: Rat size rating must be between 1 and 10';
    return parsed_rating;
};

export const checkReactionType = (reactionType) => {
    const parsed_reaction = checkString(reactionType, 'reactionType').toLowerCase();
    const validReactions = ['like', 'dislike'];
    if (!validReactions.includes(parsed_reaction)) throw `Error: Reaction type must be one of the following: ${validReactions.join(', ')}`;
    return parsed_reaction;
};

export const checkRestaurantStatus = (restaurantStatus) => {
    const parsed_restaurantStatus = checkString(restaurantStatus, 'restaurantStatus').toLowerCase();
    const validStatus = ['sanitary', 'unsanitary', 'inspecting', 'pending'];
    if (!validStatus.includes(parsed_restaurantStatus)) throw `Error: Report status must be one of the following: ${validStatus.join(', ')}`;
    return parsed_restaurantStatus;
};

export const checkRodentStatus = (rodentStatus) => {
    const parsed_rodentStatus = checkString(rodentStatus, 'rodentStatus').toLowerCase();
    const validStatus = ['pending', 'verified', 'disputed', 'removed', 'unverified'];
    if (!validStatus.includes(parsed_rodentStatus)) throw `Error: Rodent status must be one of the following: ${validStatus.join(', ')}`;
    return parsed_rodentStatus;
};

export const checkTargetKeyType = (targetKey) => {
    const parsed_keyType = checkString(targetKey, 'rodentStatus').toLowerCase();
    const validTypes = Object.values(COLLECTION_IDS);
    if (!validTypes.includes(parsed_keyType)) throw `Error: Target type must be one of the following: ${validTypes.join(', ')}`;
    return parsed_keyType;
};

export const checkUserType = (userType) => {
    const parsed_user = checkString(userType, "userType").toLowerCase();
    const validUsers = ['consumer', 'restaurant', 'exterminator', 'inspector', 'admin'];
    if (!validUsers.includes(parsed_user)) throw `Error: User must be one of the following: ${validUsers.join(', ')}`;
    return parsed_user;
};

export const checkRodentType = (rodentType) => {
    const parsed_type = checkString(rodentType, 'rodentType').toLowerCase();
    const validTypes = ['rat', 'mouse'];
    if (!validTypes.includes(parsed_type)) throw `Error: rodentType must be one of the following: ${validTypes.join(', ')}`;
    return parsed_type;
};

export const checkWebsite = (website) => {
    const parsed_website = checkString(website, 'website');
    if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(parsed_website)) throw 'Error: Website URL is not valid';
    return parsed_website;
};

export const checkPhone = (phone) => {
    const parsed_phone = checkString(phone, 'phone');
    if (!/^\d{3}-\d{3}-\d{4}$/.test(parsed_phone)) throw 'Error: Phone number must be in the format XXX-XXX-XXXX';
    return parsed_phone;
};

export const COLLECTION_IDS = Object.freeze({
    RESTAURANT: 'restaurantId',
    COMMENT: 'commentId',
    REPORT: 'reportId'
});

const zipPrefixToBorough = {
    "100": "Manhattan",
    "101": "Manhattan",
    "102": "Manhattan",
    "112": "Brooklyn",
    "104": "Bronx",
    "103": "Staten Island",
    "111": "Queens",
    "113": "Queens",
    "114": "Queens",
    "116": "Queens"
};

const zipToNeighborhood = {
    // MANHATTAN
    "10001": "Chelsea / Midtown South",
    "10002": "Lower East Side",
    "10003": "East Village",
    "10004": "Financial District",
    "10005": "Financial District",
    "10006": "World Trade Center",
    "10007": "Tribeca",
    "10009": "East Village",
    "10010": "Flatiron District",
    "10011": "Chelsea",
    "10012": "SoHo / Greenwich Village",
    "10013": "SoHo / Tribeca",
    "10014": "West Village",
    "10016": "Murray Hill",
    "10017": "Midtown East",
    "10018": "Garment District",
    "10019": "Midtown West",
    "10021": "Upper East Side",
    "10022": "Midtown East",
    "10023": "Upper West Side",
    "10024": "Upper West Side",
    "10025": "Upper West Side / Morningside Heights",
    "10026": "Harlem",
    "10027": "Harlem",
    "10028": "Upper East Side",
    "10029": "East Harlem",
    "10030": "Harlem",
    "10031": "Washington Heights",
    "10032": "Washington Heights",
    "10033": "Washington Heights",
    "10034": "Inwood",
    "10035": "East Harlem",
    "10036": "Times Square / Midtown",
    "10037": "Harlem",
    "10038": "Financial District",
    "10039": "Harlem",
    "10040": "Inwood",
    "10044": "Roosevelt Island",
    "10065": "Upper East Side",
    "10075": "Upper East Side",
    "10128": "Upper East Side",

    // BROOKLYN
    "11201": "Brooklyn Heights / Downtown Brooklyn",
    "11203": "East Flatbush",
    "11204": "Bensonhurst",
    "11205": "Clinton Hill",
    "11206": "Bedford-Stuyvesant",
    "11207": "East New York",
    "11208": "Cypress Hills",
    "11209": "Bay Ridge",
    "11210": "Flatlands / Midwood",
    "11211": "Williamsburg",
    "11212": "Brownsville",
    "11213": "Crown Heights",
    "11214": "Bensonhurst / Bath Beach",
    "11215": "Park Slope",
    "11216": "Bed-Stuy / Crown Heights",
    "11217": "Boerum Hill / Gowanus",
    "11218": "Kensington",
    "11219": "Borough Park",
    "11220": "Sunset Park",
    "11221": "Bushwick",
    "11222": "Greenpoint",
    "11223": "Gravesend",
    "11224": "Coney Island",
    "11225": "Crown Heights",
    "11226": "Flatbush",
    "11228": "Dyker Heights",
    "11229": "Sheepshead Bay",
    "11230": "Midwood",
    "11231": "Red Hook",
    "11232": "Sunset Park",
    "11233": "Bed-Stuy",
    "11234": "Marine Park",
    "11235": "Brighton Beach / Sheepshead Bay",
    "11236": "Canarsie",
    "11237": "Bushwick",
    "11238": "Prospect Heights",
    "11249": "Williamsburg (North Edge)",

    // QUEENS
    "11101": "Long Island City",
    "11102": "Astoria",
    "11103": "Astoria",
    "11104": "Sunnyside",
    "11105": "Astoria",
    "11106": "Astoria",
    "11354": "Flushing",
    "11355": "Flushing",
    "11356": "College Point",
    "11357": "Whitestone",
    "11358": "Flushing / Bayside",
    "11360": "Bayside",
    "11361": "Bayside",
    "11362": "Little Neck",
    "11363": "Little Neck",
    "11364": "Oakland Gardens",
    "11365": "Fresh Meadows",
    "11366": "Fresh Meadows",
    "11367": "Kew Gardens Hills",
    "11368": "Corona",
    "11369": "East Elmhurst",
    "11370": "Astoria / East Elmhurst",
    "11372": "Jackson Heights",
    "11373": "Elmhurst",
    "11374": "Rego Park",
    "11375": "Forest Hills",
    "11377": "Woodside",
    "11378": "Maspeth",
    "11379": "Middle Village",
    "11385": "Ridgewood / Glendale",
    "11411": "Cambria Heights",
    "11412": "St. Albans",
    "11413": "Springfield Gardens",
    "11414": "Howard Beach",
    "11415": "Kew Gardens",
    "11416": "Ozone Park",
    "11417": "Ozone Park",
    "11418": "Richmond Hill",
    "11419": "South Richmond Hill",
    "11420": "South Jamaica",
    "11421": "Woodhaven",
    "11422": "Rosedale",
    "11423": "Queens Village",
    "11426": "Bellerose",
    "11427": "Queens Village",
    "11428": "Queens Village",
    "11429": "Queens Village",
    "11432": "Jamaica",
    "11433": "Jamaica",
    "11434": "Jamaica",
    "11435": "Jamaica",
    "11436": "Jamaica",

    // BRONX
    "10451": "Mott Haven",
    "10452": "Highbridge",
    "10453": "University Heights",
    "10454": "Mott Haven",
    "10455": "Mott Haven",
    "10456": "Morrisania",
    "10457": "Fordham",
    "10458": "Belmont",
    "10459": "Longwood",
    "10460": "West Farms",
    "10461": "Throggs Neck",
    "10462": "Parkchester",
    "10463": "Riverdale",
    "10464": "City Island",
    "10465": "Throggs Neck",
    "10466": "Wakefield",
    "10467": "Norwood",
    "10468": "Fordham / Kingsbridge",
    "10469": "Baychester",
    "10470": "Riverdale",
    "10471": "Riverdale",
    "10472": "Soundview",
    "10473": "Soundview",
    "10474": "Hunts Point",
    "10475": "Co-op City",

    // STATEN ISLAND
    "10301": "St. George",
    "10302": "Port Richmond",
    "10303": "Mariners Harbor",
    "10304": "Stapleton",
    "10305": "New Dorp",
    "10306": "New Dorp Beach",
    "10307": "Tottenville",
    "10308": "Great Kills",
    "10309": "Richmond Valley",
    "10310": "West New Brighton",
    "10312": "Annadale",
    "10314": "New Springville"
};

export const getLocationFromZip = (zip) => {
    if (!zip) return { borough: "Unknown", neighborhood: "Unknown" };

    const zipStr = String(zip).trim();
    if (!/^\d{5}$/.test(zipStr)) {
        return { borough: "Unknown", neighborhood: "Unknown" };
    }

    const prefix = zipStr.slice(0, 3);

    const borough =
        zipPrefixToBorough[prefix] || "Unknown";

    // fallback to borough if neighborhood not found
    const neighborhood =
        zipToNeighborhood[zipStr] || borough; 

    return { borough, neighborhood };
};

export const countToStatus = (count) => {
  if (count >= 10) return { key: 'high', label: 'High Risk' };
  if (count >= 5) return { key: 'medium', label: 'Medium Risk' };
  return { key: 'low', label: 'Low Risk' };
};
