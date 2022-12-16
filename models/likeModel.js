const mongoose = require("mongoose");

// Like Schema Layout
const likeSchema = new mongoose.Schema({
    coinName: {
        type: String,
        required: [true, 'Coin Name Not Provided!'],
        lowercase: true
    },
    coinSymbol: {
        type: String,
        required: [true, 'Coin Symbol Not Provided!'],
        lowercase: true
    },
    coinID: {
        type: String,
        required: [true, 'Coin ID Not Provided!'],
        lowercase: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User Not Provided!']
    }
});


// Add Like Schmea to mongoDB data base
const Like = mongoose.model('Like', likeSchema);

module.exports = Like;