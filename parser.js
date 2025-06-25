// parser.js (new and improved)
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Extracts a JSON string from a text that might contain markdown fences.
 * @param {string} text - The text from the LLM.
 * @returns {string | null} - The extracted JSON string or null.
 */
function extractJson(text) {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    return match[1];
  }
  // If no markdown, assume the whole string might be JSON
  return text;
}

/**
 * Sends a prompt to Gemini and returns a parsed JSON object.
 * @param {string} prompt - The prompt to send to Gemini.
 * @returns {Promise<object | null>} - The parsed JSON object or null if parsing fails.
 */
async function parseWithGemini(prompt) {
  try {
    console.log('🤖 Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    console.log('🤖 Generating content with Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    console.log('📄 Raw Gemini response:', rawText);

    const jsonString = extractJson(rawText);
    console.log('🔍 Extracted JSON string:', jsonString);

    if (!jsonString) {
      console.error('❌ Could not find any content to parse.');
      return null;
    }
    
    // The final parse is still in a try-catch in case the JSON is malformed
    const parsedJson = JSON.parse(jsonString);
    console.log('✅ Successfully parsed JSON:', parsedJson);
    return parsedJson;

  } catch (error) {
    console.error('❌ Error in parseWithGemini or JSON parsing:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return null; // Return null on any error
  }
}

module.exports = { parseWithGemini };