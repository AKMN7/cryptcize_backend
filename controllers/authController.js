const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('../utils/email');

// Sign A Json Web Token (JWT)
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};


// Create A Json Web Token (JWT)
const createToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove Password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};


// Sign Up a new User
exports.signup = catchAsync(async (req, res, _) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createToken(newUser, 201, res);
});


// Login User
exports.singin = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;

    // Check if Email and Passwrod is Provided
    if (!email || !password) return next(new AppError('Please Provide Email and Password!', 400));
    // Check if the User exists
    const user = await User.findOne({ email }).select('+password');
    // Check Password
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Invalid Credentials', 401));
    }

    createToken(user, 201, res);
});


// Protect Routes (Only available for signed in users)
exports.protect = catchAsync(async (req, _, next) => {
    // Grab Token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // No Token Provided
    if (!token) return next(new AppError('Sign In Please!', 401));

    // Verify Token
    let decoded;
    try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (error) {
        return next(new AppError('Token Unauthorized!', 401));
    }

    const currentUser = await User.findById(decoded.id);

    // Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) return next(new AppError('Password Change, Log In Again!', 401));

    // Grant Access if all conditions are met
    req.user = currentUser;
    next();
});


// Forgot Password (send email with reset link)
exports.forgotPassword = catchAsync(async (req, res, next) => {

    // console.log(req.headers);

    // Get User email
    const user = await User.findOne({ email: req.body.email });

    // Check user
    if (!user) return next(new AppError('Invalide E-mail address!', 404));

    // Generate Reset Token
    const resetToken = user.createPasswordToken();
    await user.save({ validateBeforeSave: false });

    // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const resetURL = `http://localhost:8080/reset/${resetToken}`;

    const message = `Forgot your password? Please Enter your new password in the following link. \n
    ${resetURL} \n\n If you didn't forget your password, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Link',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Reset Password Link sent to your email!'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        console.log(error);

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});


// Reset Password from reset token
exports.resetPassword = catchAsync(async (req, res, next) => {
    // Get User based on the reset token (note: rehash)
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // Check if the token is available and not expired (10min)
    if (!user) return next(new AppError('Invalid Token!!', 400));

    // Update Password + Remove RestToken 
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createToken(user, 200, res);
});


// Update Password (while logged in)
exports.updatePassword = catchAsync(async (req, res, next) => {
    // Get uer (using the protect middleware)
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Incorrect Current Password!', 401));
    }

    // Update Password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createToken(user, 200, res);
});