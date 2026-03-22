const express= require('express');
const router= express.Router();
const {saveFile, findFile, editFile, deleteFile, showAllFile}= require('../controllers/saveFileController');
const authMiddleware= require('../middleware/authMiddleware');

router.post("/", authMiddleware, saveFile);
router.get("/", authMiddleware, showAllFile);
router.get("/search", authMiddleware, findFile);
router.put("/:id", authMiddleware, editFile);
router.delete("/:id", authMiddleware, deleteFile);


module.exports = router;