const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        minlength: 6, // Changed min to minlength for validation
        maxlength: 255, // Changed max to maxlength for validation
        unique: true, // To ensure email uniqueness across the collection
    },
    birthday: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        maxlength: 1024, // Changed max to maxlength for validation
        minlength: 6, // Changed min to minlength for validation
    },
    lastLogin: {
        type: Date,
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

module.exports = mongoose.model('User', userSchema);
