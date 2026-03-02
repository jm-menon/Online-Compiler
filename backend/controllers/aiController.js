// controllers/aiController.js

const { generateAIResponse } = require("../services/aiServices");

const handleAIRequest = async (req, res) => {
  try {
    const { code, prompt } = req.body;

    if (!code || !prompt) {
      return res.status(400).json({
        error: "Code and prompt are required"
      });
    }

    const reply = await generateAIResponse(code, prompt);

    res.json({ reply });

  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "AI failed"
    });
  }
};

module.exports = {
  handleAIRequest
};