const mongoose = require('mongoose');
const { getConn } = require('../connectDB');

const userSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    language: { type: String, enum: ['cpp', 'python', 'java'], required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// lazy initialization - only gets connection when first called
let SavedFile = null;

const getModel = () => {
    if (!SavedFile) {
        const { usersConn } = getConn();
        SavedFile = usersConn.model('SavedFile', userSchema);
    }
    return SavedFile;
}

module.exports = getModel;