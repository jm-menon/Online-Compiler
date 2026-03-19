const mongoose = require('mongoose');
const { getConn } = require('../connectDB');

const saveFileSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename:{
        type: String,
        required: true
    },
    language:{
        type: String,
        enum: ['cpp', 'python', 'java'],
        required: true
    },
    code:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const { saveFilesConn } = getConn();
const SaveFile = saveFilesConn.model('SavedFile', saveFileSchema);

module.exports = SaveFile;