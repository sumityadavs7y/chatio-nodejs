const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const io = require('../socket');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error('Validation error');
        err.statusCode = 422;
        err.data = errors.array();
        return next(err);
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        const err = new Error('Email already exists');
        err.statusCode = 400;
        return next(err);
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
        name: name,
        email: email,
        password: hashedPassword
    });
    const createdUser = await user.save();
    return res.status(201).json({
        message: 'User signed up'
    });
};

exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (!user) {
        const err = new Error('Validation error');
        err.statusCode = 422;
        err.data = errors.array();
        return next(err);
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
        const err = new Error('Username or Password incorrect');
        err.statusCode = 401;
        return next(err);
    }
    const accessToken = jwt.sign({ userId: user._id.toString() }, process.env.SECRET_KEY, { expiresIn: '1h' });
    const userAgent = req.headers['user-agent'];
    const tokenCount = user.refreshTokens.length;
    if (tokenCount > 5) {
        user.refreshTokens = [];
    }
    const refreshToken = jwt.sign({ userId: user._id.toString() }, process.env.SECRET_KEY, { expiresIn: '30d' });
    const date = new Date();
    date.setDate(date.getDate() + 30);
    user.refreshTokens.push({
        expireTime: date,
        token: refreshToken,
        device: userAgent
    });
    await user.save();
    return res.status(200).json({
        userId: user._id.toString(),
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: 60,
        email: user.email
    });
};

exports.check = async (req, res, next) => {

    io.getIO().emit('mychannel', 'hi, there!');

    return res.status(200).json({
        message: "ACCESSED WITH TOKEN"
    });
}