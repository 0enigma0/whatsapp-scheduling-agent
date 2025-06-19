require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Sends a prompt to Gemini and returns the response.
 * @param {string} prompt - The prompt to send to Gemini.
 * @returns {Promise<string>} - The response from Gemini.
 */
async function parseWithGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = { parseWithGemini };
