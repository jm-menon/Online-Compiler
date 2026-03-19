const express= require('express');
const router= express.Router();
const {saveFile, findFile, editFile, deleteFile, showAllFile}= require('../controllers/saveFileController');
const authMiddleware= require('../middleware/authMiddleware');

router.post("/", authMiddleware, saveFile);
router.get("/:id", authMiddleware, findFile);
router.put("/:id", authMiddleware, editFile);
router.delete("/:id", authMiddleware, deleteFile);
router.get("/", authMiddleware, showAllFile);

module.exports = router;