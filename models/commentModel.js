const mongoose = require('mongoose');

// Comment Schema Layout
const commentSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'User Name Required!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User Not Provided!']
    },
    topic: {
        type: mongoose.Schema.ObjectId,
        ref: 'Topic',
        required: [true, 'Topic Not Provided'],
    },
    text: {
        type: String,
        required: [true, 'Comment Text Not Provided!']
    },
    Date: {
        type: Date,
        default: Date.now()
    },
});

// Add Comment Schmea to mongoDB data base
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;