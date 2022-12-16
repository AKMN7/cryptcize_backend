const mongoose = require('mongoose');

// React Schema Layout
const reactSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User Not Provided!']
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: [true, 'Post Not Provided!']
    },
    reactType: {
        type: String,
        required: [true, 'React Type Not Provided!'],
        enum: ['upvote', 'downvote']
    },
    Date: {
        type: Date,
        default: Date.now()
    },
});

// Add React Schmea to mongoDB data base
const React = mongoose.model('React', reactSchema);

module.exports = React;