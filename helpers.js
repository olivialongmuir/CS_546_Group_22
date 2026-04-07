export const checkId = (id) => {
    if (!id) throw 'Error: You must provide an ID';
    if (typeof id !== 'string') throw 'Error: ID must be a string';
    id = id.trim();
    if (id.length === 0) throw 'Error: ID cannot be an empty string';
    if (!ObjectId.isValid(id)) throw 'Error: ID is not a valid ObjectId';
    return id;
};

export const checkString = (str, fieldName) => {
    if (!str) throw `Error: You must provide a value for ${fieldName}`;
    if (typeof str !== 'string') throw `Error: ${fieldName} must be a string`;
    str = str.trim();
    if (str.length === 0) throw `Error: ${fieldName} cannot be an empty string`;
    return str;
};

export const checkComment = (comment) => {
    if (!comment) throw 'Error: You must provide a comment';
    if (typeof comment !== 'string') throw 'Error: Comment must be a string';
    comment = comment.trim();
    if (comment.length === 0) throw 'Error: Comment cannot be an empty string';
    if (comment.length > 500) throw 'Error: Comment cannot exceed 500 characters';
    return comment;
};

export const checkUsername = (username) => {
    if (!username) throw 'Error: You must provide a username';
    if (typeof username !== 'string') throw 'Error: Username must be a string';
    username = username.trim();
    if (username.length === 0) throw 'Error: Username cannot be an empty string';
    if (username.length < 3) throw 'Error: Username must be at least 3 characters';
    if (username.length > 20) throw 'Error: Username cannot exceed 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) throw 'Error: Username can only contain letters, numbers, and underscores';
    return username;
};

export const checkEmail = (email) => {
    if (!email) throw 'Error: You must provide an email address';
    if (typeof email !== 'string') throw 'Error: Email must be a string';
    email = email.trim();
    if (email.length === 0) throw 'Error: Email cannot be an empty string';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw 'Error: Email address is not valid';
    return email;
};

export const checkPassword = (password) => {
    if (!password) throw 'Error: You must provide a password';
    if (typeof password !== 'string') throw 'Error: Password must be a string';
    if (password.length < 8) throw 'Error: Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) throw 'Error: Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(password)) throw 'Error: Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(password)) throw 'Error: Password must contain at least one special character (!@#$%^&*)';
    return password;
};

export const checkRatSizeRating = (rating) => {
    if (rating === undefined || rating === null) throw 'Error: You must provide a rat size rating';
    if (typeof rating !== 'number') throw 'Error: Rat size rating must be a number';
    if (!Number.isInteger(rating)) throw 'Error: Rat size rating must be a whole number';
    if (rating < 1 || rating > 5) throw 'Error: Rat size rating must be between 1 and 5';
    return rating;
};

export const checkReactionType = (reactionType) => {
    if (!reactionType) throw 'Error: You must provide a reaction type';
    if (typeof reactionType !== 'string') throw 'Error: Reaction type must be a string';
    reactionType = reactionType.trim().toLowerCase();
    const validReactions = ['like', 'dislike', 'confirm', 'dispute', 'flag'];
    if (!validReactions.includes(reactionType)) throw `Error: Reaction type must be one of the following: ${validReactions.join(', ')}`;
    return reactionType;
};