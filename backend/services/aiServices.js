// services/aiServices.js

const axios = require("axios");

const generateAIResponse = async (code, prompt) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional coding assistant."
        },
        {
          role: "user",
          content: `
Code:
${code}

Request:
${prompt}
`
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", // match your frontend port
        "X-Title": "Online Compiler AI"
      }
    }
  );

  return response.data.choices[0].message.content;
};

module.exports = {
  generateAIResponse
};