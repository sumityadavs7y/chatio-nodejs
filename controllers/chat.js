const { validationResult } = require('express-validator');

const User = require('../models/user');
const Message = require('../models/message');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

exports.getContacts = async (req, res, next) => {
    const user = await User.findById(req.userId).populate('contacts', '_id email');
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        return next(err);
    }
    const contacts = user.contacts.map(c => {
        return {
            id: c._id,
            email: c.email
        }
    });
    return res.status(200).json({
        contacts: contacts
    });
}

exports.postContact = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error('Validation error');
        err.statusCode = 422;
        err.data = errors.array();
        return next(err);
    }

    const contactEmail = req.body.email;
    const contactUser = await User.findOne({ email: contactEmail });

    if (!contactUser) {
        const err = new Error('User not found');
        err.statusCode = 404;
        return next(err);
    }

    const checkUser = await User.findOne({ _id: req.userId, contacts: contactUser._id });

    if (checkUser) {
        const err = new Error('Already in contacts');
        err.statusCode = 400;
        return next(err);
    }

    const user = await User.findById(req.userId);
    user.contacts.push(contactUser._id)
    await user.save();
    return res.status(200).json({
        message: 'Added to contacts'
    });
};

exports.postMessage = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error('Validation error');
        err.statusCode = 422;
        err.data = errors.array();
        return next(err);
    }

    const contactUser = await User.findOne({ email: req.body.contact });

    if (!contactUser) {
        const err = new Error('User not found');
        err.statusCode = 404;
        return next(err);
    }

    if (contactUser._id.toString() === req.userId) {
        const err = new Error('Can\'t send message to yourself');
        err.statusCode = 400;
        return next(err);
    }

    const chatMessage = new Message({
        sender: req.userId,
        reciever: contactUser._id,
        message: req.body.message
    });

    const savedMessage = await chatMessage.save();

    return res.status(200).json({
        message: 'Successfuly sent',
        data: savedMessage
    });
};

exports.getMessages = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error('Validation error');
        err.statusCode = 422;
        err.data = errors.array();
        return next(err);
    }

    const contactUser = await User.findOne({ email: req.body.contact });
    const user = await User.findById(req.userId);

    await User.updateOne({ _id: user._id }, { "$addToSet": { "contacts": contactUser._id } });
    await User.updateOne({ _id: contactUser._id }, { "$addToSet": { "contacts": user._id } });

    if (!contactUser || contactUser._id.toString() === req.userId) {
        const message = !contactUser ? 'User not found' : 'Can\'t find chat with yourself';
        const err = new Error(message);
        err.statusCode = !contactUser ? 404 : 400;
        return next(err);
    }

    const messages = await Message.aggregate([
        {
            $match: {
                $or: [
                    { sender: user._id, reciever: contactUser._id },
                    { sender: contactUser._id, reciever: user._id }
                ]
            },
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                message: 1,
                time: "$createdAt",
                sent: {
                    $cond: {
                        if: { $eq: ["$sender", ObjectId(req.userId)] },
                        then: true,
                        else: false
                    }
                }
            }
        }
    ]);
    return res.status(200).json({
        message: "All OK",
        messages: messages
    });
}