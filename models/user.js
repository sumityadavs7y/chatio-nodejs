const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    refreshTokens: [{
        expireTime: {
            type: Date,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        device: {
            type: String
        }
    }]
});

module.exports = mongoose.model('User', userSchema);