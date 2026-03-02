const express = require("express");
const verifyJWT = require("../middleware/authMiddleware");
const { handleAIRequest } = require("../controllers/aiController");

const router = express.Router();

console.log("AI routes file loaded inside");

router.post("/", verifyJWT, handleAIRequest);

module.exports = router;
