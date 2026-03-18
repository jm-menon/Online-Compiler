const mongoose = require('mongoose');

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

module.exports= mongoose.model('SavedFiles', saveFileSchema)