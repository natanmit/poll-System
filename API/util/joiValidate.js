const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

// Register Validation
const registerValidation = (data) => {
    const schema = Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string()
            .email()
            .min(6) // Ensures the minimum number of characters in the email
            .max(255) // Ensures the email does not exceed 255 characters
            .required(),
        birthday: Joi.date().less('now').required(), // Date must be before the current date
        address: Joi.string().required(),
        password: Joi.string().min(6).max(1024).required(), // Password length must be between 6 and 1024 characters
    });

    return schema.validate(data);
};

// Login Validation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .min(6) // Ensures the minimum number of characters in the email
            .max(255) // Ensures the email does not exceed 255 characters
            .required(),
        password: Joi.string().min(6).max(1024).required(), // Password length must be between 6 and 1024 characters
    });

    return schema.validate(data);
};

// Create Question Validation
const createQuestionValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().required(), // Title is required
        firstAnswer: Joi.string().required(), // First answer is required
        secondAnswer: Joi.string().required(), // Second answer is required
        thirdAnswer: Joi.string().required(), // Third answer is required
        fourthAnswer: Joi.string().required(), // Fourth answer is required
    });

    return schema.validate(data);
};

// Update Question Validation
const updateQuestionValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string(), // Title is optional
        firstAnswer: Joi.string(), // First answer is optional
        secondAnswer: Joi.string(), // Second answer is optional
        thirdAnswer: Joi.string(), // Third answer is optional
        fourthAnswer: Joi.string(), // Fourth answer is optional
    }).min(1);  // At least one field must be provided for the update

    return schema.validate(data);
};

// Create User Validation
const createUserValidation = (data) => {
    const schema = Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string()
            .email()
            .min(6) // Ensures the minimum number of characters in the email
            .max(255) // Ensures the email does not exceed 255 characters
            .required(),
        birthday: Joi.date().less('now').required(), // Date must be before the current date
        address: Joi.string().required(),
        password: Joi.string().min(6).max(1024).required(), // Password length must be between 6 and 1024 characters
    });

    return schema.validate(data);
};

const updateUserValidation = (data) => {
    const schema = Joi.object({
        firstname: Joi.string(),
        lastname: Joi.string(),
        email: Joi.string()
            .email()
            .min(6) // Ensures the minimum number of characters in the email
            .max(255), // Ensures the email does not exceed 255 characters
        birthday: Joi.date().less('now'), // Date must be before the current date
        address: Joi.string(),
        password: Joi.string().min(6).max(1024), // Password length must be between 6 and 1024 characters
    }).min(1); // Require at least one of the fields to be provided for the update

    return schema.validate(data);
};

const createPollValidation = (data) => {
    const schema = Joi.object({
        question: Joi.objectId().required(),
        selectedAnswer: Joi.string()
            .valid('', 'firstAnswer', 'secondAnswer', 'thirdAnswer', 'fourthAnswer')
            .default(''),
    });

    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.createUserValidation = createUserValidation;
module.exports.updateUserValidation = updateUserValidation;
module.exports.createPollValidation = createPollValidation;
module.exports.createQuestionValidation = createQuestionValidation;
module.exports.updateQuestionValidation = updateQuestionValidation;
