const User = require('./../models/userModel');
const Like = require('./../models/likeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const countryList = require('../utils/countryList');

// Update User Personal Info
exports.updatePersonal = catchAsync(async (req, res, next) => {

    if (!req.body.name || !req.body.age || !req.body.country) {
        return next(new AppError('Please Provide full information', 400));
    }

    const enteredCountry = countryList.countryIsValid(req.body.country)

    if (!enteredCountry) {
        return next(new AppError('Invalid County Name/Code Provided!', 400));
    }

    // Get User By ID
    const user = await User.findById(req.user.id);

    // Check if user exist
    if (!user) return next(new AppError('No User Found!', 400));

    user.name = req.body.name;
    user.age = req.body.age;
    user.country = enteredCountry[0];

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Info Updated',
        data: {
            user
        }
    });
});

// Get all the user's likes
exports.getLikes = catchAsync(async (req, res, _) => {
    const likes = await Like.find({ user: req.user._id }).select('-_id').select('-__v').select('-user');

    res.status(200).json({
        status: 'success',
        data: {
            likes
        }
    });
});

// Add Like (Coin) for user
exports.addLike = catchAsync(async (req, res, next) => {

    const coinName = req.body.coinName;
    const coinSymbol = req.body.coinSymbol;
    const coinID = req.params.coinID;

    const userLiked = await Like.findOne({ user: req.user._id, coinID: coinID });

    // Check user like (max 16)
    if (req.user.likes.length > 16) return next(new AppError('You can only like 16 coins', 401));

    // Check if the user already liked
    if (userLiked) return next(new AppError('Coin Already Liked', 400));

    // Create New Like
    const newLike = await Like.create({
        coinName,
        coinSymbol,
        coinID,
        user: req.user._id
    });

    // Push new like to user's likes array
    await User.findByIdAndUpdate(req.user._id, { $push: { likes: newLike._id } }).exec();

    res.status(200).json({
        status: 'success',
        data: {
            newLike
        }
    });
});


// Remove Like (coin) for user
exports.removeLike = catchAsync(async (req, res, next) => {
    const coinID = req.params.coinID.toString().toLowerCase()

    // Get like
    const userLiked = await Like.findOne({ user: req.user._id, coinID: coinID });

    // Check if it exists
    if (!userLiked) return next(new AppError('No like found!', 404));

    // Delete if found
    await Like.findByIdAndDelete(userLiked._id);

    // Delete Like from user's like array
    await User.findByIdAndUpdate(req.user._id, { $pull: { likes: userLiked._id } }).exec();

    res.status(200).json({
        status: 'success'
    });
});