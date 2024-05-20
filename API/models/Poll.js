const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const pollSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    },
    selectedAnswer: {
        type: String,
        enum: ['', 'firstAnswer', 'secondAnswer', 'thirdAnswer', 'fourthAnswer'],
        default: '',
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

pollSchema.plugin(AutoIncrement, { inc_field: 'answerNumber', start_seq: 1 });
module.exports = mongoose.model('Poll', pollSchema);
