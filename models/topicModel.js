const mongoose = require('mongoose');

// Topic Schema Layout
const topicSchema = new mongoose.Schema({
    topicName: {
        type: String,
        required: [true, 'Topic Name Required!'],
        minlength: 10,
        uppercase: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User Not Provided!']
    },
    totalComments: {
        type: Number,
        default: 0
    },
    Date: {
        type: Date,
        default: Date.now()
    },
    topicCode: {
        type: String,
        required: [true, 'UUID Not Porvided!']
    }
});

// Add Topic Schmea to mongoDB data base
const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;