/*const mongoose = require('mongoose');
const { getConn } = require('../connectDB');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// connection already open by the time this model is used
const { usersConn } = getConn();
const User = usersConn.model('User', userSchema);

module.exports = User;*/

const mongoose = require('mongoose');
const { getConn } = require('../connectDB');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// lazy initialization - only gets connection when first called
let User = null;

const getModel = () => {
    if (!User) {
        const { usersConn } = getConn();
        User = usersConn.model('User', userSchema);
    }
    return User;
}

module.exports = getModel;