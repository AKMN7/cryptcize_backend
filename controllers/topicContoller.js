const Topic = require('./../models/topicModel');
const Comment = require('./../models/commentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { nanoid } = require('nanoid');
const slugify = require('slugify');

// Add new Topic
exports.createTopic = catchAsync(async (req, res, _) => {

    if (!req.body.topicName || req.body.topicName.split('').length < 10) return next(new AppError('Invalid Topic Name Provided. Pleae Try to be specic with your topic names.'));

    // Generate short unique uuid
    let uuid = nanoid(10);

    // Create Post
    const topic = await Topic.create({
        user: req.user._id,
        topicName: slugify(req.body.topicName),
        topicCode: uuid
    });

    res.status(200).json({
        status: 'success',
        data: {
            topic
        }
    });
});


// Add new Comment on a specific topic 
exports.addComment = catchAsync(async (req, res, next) => {

    const topic = await Topic.findById(req.params.topicId);

    if (!topic) return next(new AppError('Invalid Topic ID', 404));

    // Create Comment
    const comment = await Comment.create({
        user: req.user._id,
        userName: req.user.name,
        topic: req.params.topicId,
        text: req.body.text,
    });


    await Topic.findByIdAndUpdate(req.params.topicId, { $inc: { totalComments: 1 } })

    res.status(200).json({
        status: 'success',
        data: {
            comment
        }
    });
});


// Get All Comments on a specific topic
exports.getAllComments = catchAsync(async (req, res, _1) => {
    const comments = await Comment.find({ topic: req.params.topicId });

    res.status(200).json({
        status: 'success',
        data: {
            comments
        }
    });
});


// Search for a specific topic by name or topic code
exports.searchTopic = catchAsync(async (req, res, next) => {

    let topic;
    let comments;

    if (req.body.toSearchForm) {
        topic = await Topic.findOne({
            $or: [{ topicCode: slugify(req.body.toSearchForm) },
            { topicName: slugify(req.body.toSearchForm).toUpperCase() }]
        });
    } else {
        return next(new AppError('No Valid Approach to Search Provided!', 404));
    }

    if (topic) {
        comments = await Comment.find({ topic: topic._id });
    } else {
        return next(new AppError('Unable to find a topic with the same name or code.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            topic,
            comments
        }
    });
});


// Get Top Topics
exports.getTopTopics = catchAsync(async (_, res, _1) => {
    const topics = await Topic.find({}).sort({ totalComments: -1 });

    res.status(200).json({
        status: 'success',
        data: {
            topics
        }
    });
});