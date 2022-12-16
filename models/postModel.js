const mongoose = require('mongoose');

// Post Schema Layout
const postSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'User Name Required!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User Not Provided!']
    },
    coinName: {
        type: String,
        required: [true, 'Post coin Not Provided!'],
        lowercase: true
    },
    postType: {
        type: String,
        required: [true, 'Post Type Not Provided!'],
        enum: ['bullish', 'bearish']
    },
    Date: {
        type: Date,
        default: Date.now()
    },
    text: {
        type: String,
        required: [true, 'Post Text Not Provided!']
    },
    upVotes: {
        type: Number,
        default: 0
    },
    downVotes: {
        type: Number,
        default: 0
    }
});

// Add Post Schmea to mongoDB data base
const Post = mongoose.model('Post', postSchema);

module.exports = Post;