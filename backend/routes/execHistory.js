const express = require('express');
const router = express.Router();
const { saveExecution, getHistory, deleteExecution } = require('../controllers/execHistoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.post("/", authMiddleware, saveExecution);
router.get("/", authMiddleware, getHistory);
router.delete("/:id", authMiddleware, deleteExecution);

module.exports = router;