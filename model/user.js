const mongoose = require('mongoose');

//create user schema
const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    accountnumber: {
        type: Number,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    transactions: {
        type: Array,
        //required: true,
        default: []
    },token: {
        type: String,
    }
});

module.exports = mongoose.model('user', UserSchema);