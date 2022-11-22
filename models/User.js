const mongoose = require('mongoose');

//create user schema
const UserSchema = new mongoose.Schema({
    name: {
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
    }
});

//generate random account number
UserSchema.pre('save', async function (next) {
    try {
        const
            user = this,
            accountnumber = Math.floor(Math.random() * 1000000000);
            Math.floor(100000 + Math.random() * 900000)
        user.accountnumber = accountnumber;
        next();
    } catch (error) {
        next(error);
    }
});

//export user model
//module.exports = User = mongoose.model('user', UserSchema);
module.exports = mongoose.model('user', UserSchema);