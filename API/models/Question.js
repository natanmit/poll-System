const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    firstAnswer: {
        type: String,
        required: true,
    },
    secondAnswer: {
        type: String,
        required: true,
    },
    thirdAnswer: {
        type: String,
        required: true,
    },
    fourthAnswer: {
        type: String,
        required: true,
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

module.exports = mongoose.model('Question', questionSchema);
