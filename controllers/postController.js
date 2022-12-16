const Post = require('./../models/postModel');
const React = require('./../models/reactModel');
const supportedCoins = require('../utils/supportedCoins');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Add new User Post
exports.addPost = catchAsync(async (req, res, next) => {

    // Check if the coin is available
    const coinIsAvailable = await supportedCoins.coinSupported((req.body.coinName).toLowerCase());

    if (!coinIsAvailable) return next(new AppError('Coin with same symbol not found.', 404));

    // Create Post
    const post = await Post.create({
        user: req.user._id,
        userName: req.user.name,
        coinName: req.body.coinName,
        postType: req.body.postType,
        text: req.body.text,
    });

    res.status(200).json({
        status: 'success',
        data: {
            post
        }
    });
});


// Delete Post by ID
exports.deletePost = catchAsync(async (req, res, next) => {
    // Check and Delete if post if found
    const deleted = await Post.findOneAndDelete({ _id: req.params.postId, user: req.user._id });

    if (!deleted) return next(new AppError('No Post found with that id', 404));

    res.status(204).json({
        status: 'success',
        data: null
    });
});


// Get current user posts
exports.getUserPosts = catchAsync(async (req, res, _) => {
    const posts = await Post.find({ user: req.user._id });

    res.status(200).json({
        status: 'success',
        data: {
            posts
        }
    });
});


// Get All Posts
exports.getAllPosts = catchAsync(async (_, res, _1) => {
    const posts = await Post.find({}).limit(50);

    res.status(200).json({
        status: 'success',
        data: {
            posts
        }
    });
});


// Get All Posts for specific coin
exports.getCoinPosts = catchAsync(async (req, res, _) => {
    const coinPosts = await Post.find({ coinName: req.params.coinName.toString().toLowerCase() });

    res.status(200).json({
        status: 'success',
        data: {
            coinPosts
        }
    });
});



// Add Post React (upVote || downVote)
exports.addReact = catchAsync(async (req, res, _) => {

    // Check if a reach alrady exist
    let previousReact = await React.find({ user: req.user._id, post: req.params.postId });

    if (!previousReact[0]) {
        // create Post
        await React.create({
            user: req.user._id,
            post: req.params.postId,
            reactType: req.body.reactType,
        });

        // New First Time
        if (req.body.reactType == 'upvote') {
            await Post.findByIdAndUpdate(req.params.postId, { $inc: { upVotes: 1 } });
        } else if (req.body.reactType == 'downvote') {
            await Post.findByIdAndUpdate(req.params.postId, { $inc: { downVotes: 1 } });
        }
    } else {
        if (previousReact[0].reactType == 'upvote' && req.body.reactType == 'upvote') {
            await Post.findByIdAndUpdate(req.params.postId, { $inc: { upVotes: -1 } });
            await React.findByIdAndDelete(previousReact[0]._id);
        } else if (previousReact[0].reactType == 'downvote' && req.body.reactType == 'downvote') {
            await Post.findByIdAndUpdate(req.params.postId, { $inc: { downVotes: -1 } });
            await React.findByIdAndDelete(previousReact[0]._id);
        } else if (previousReact[0].reactType == 'upvote' && req.body.reactType == 'downvote') {
            await Post.findByIdAndUpdate(req.params.postId, { $inc: { upVotes: -1, downVotes: 1 } });
            await React.findByIdAndUpdate(previousReact[0]._id, { reactType: 'downvote' });
        } else if (previousReact[0].reactType == 'downvote' && req.body.reactType == 'upvote') {
            await Post.findByIdAndUpdate(req.params.postId, { $inc: { upVotes: 1, downVotes: -1 } });
            await React.findByIdAndUpdate(previousReact[0]._id, { reactType: 'upvote' });
        }
    }

    res.status(200).json({
        status: 'success'
    });
});


// Get All Posts
exports.getAllUserReacts = catchAsync(async (req, res, _1) => {
    const reacts = await React.find({ user: req.user._id });

    res.status(200).json({
        status: 'success',
        data: {
            reacts
        }
    });
});