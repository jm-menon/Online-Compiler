const getExecutionHistory = require('../models/executionHistorySchema');

// called every time user hits Run
exports.saveExecution = async (req, res) => {
    const ExecutionHistory = getExecutionHistory();
    try {
        const { code, language, output, status } = req.body;
        const entry = await ExecutionHistory.create({
            userId: req.user,
            code,
            language,
            output,
            status
        });
        res.status(201).json(entry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

// fetch last 20 executions for the panel
exports.getHistory = async (req, res) => {
    const ExecutionHistory = getExecutionHistory();
    try {
        const history = await ExecutionHistory.find({ userId: req.user })
            .sort({ executedAt: -1 }) // most recent first
            .limit(20);
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

// delete a single entry
exports.deleteExecution = async (req, res) => {
    const ExecutionHistory = getExecutionHistory();
    try {
        await ExecutionHistory.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user 
        });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}