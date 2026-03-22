const mongoose = require('mongoose');
const { getConn } = require('../connectDB');

const executionHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    output: { type: String },
    status: { type: String, enum: ['success', 'error'] },
    executedAt: { type: Date, default: Date.now }
});

// auto delete documents after 7 days — MongoDB handles this natively
executionHistorySchema.index({ executedAt: 1 }, { expireAfterSeconds: 604800 });

let ExecutionHistory = null;

const getModel = () => {
    if (!ExecutionHistory) {
        const { saveFilesConn } = getConn(); // same connection as saveFile
        ExecutionHistory = saveFilesConn.model('ExecutionHistory', executionHistorySchema);
    }
    return ExecutionHistory;
}

module.exports = getModel;