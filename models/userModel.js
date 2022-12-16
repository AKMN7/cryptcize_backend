const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// User Schema Layout
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please tell you your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!']
    },
    age: {
        type: String,
        default: '---'
    },
    country: {
        type: String,
        default: '---'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password!'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords provided are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Like',
        }
    ]
});


// Hash the passwrod before saving
userSchema.pre('save', async function (next) {
    // Only when password is modified
    if (!this.isModified('password')) return next();

    // Hash password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete Password Confirm
    this.passwordConfirm = undefined;

    next();
});


// Add Password Change At in when password is changed
userSchema.pre('save', function (next) {
    // Only when the password is modifed 
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});


// Validate Password of a current User
userSchema.methods.correctPassword = async function (candidatePassword, userPassowrd) {
    return bcrypt.compare(candidatePassword, userPassowrd)
};


// Check if the User Change his passwrd after the issue of an JWT
userSchema.methods.changedPasswordAfter = function (JWTtimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTtimestamp < changedTimestamp;
    }

    // Means Pasword Not Change After
    return false;
};


// Create a Password Reset Token for the user
userSchema.methods.createPasswordToken = function () {
    // Create Random String as Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash Reset String
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // Set an expiry of 10 MIN affter issuing reset token
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


// Add User Schmea to mongoDB data base
const User = mongoose.model('User', userSchema);

module.exports = User;