import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

/**
 * Lazily initialises the Gemini client.
 * Throws a clear error if the API key is missing so the developer knows
 * exactly what to add to .env.
 */
function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to backend/.env to enable AI features.'
    );
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

const MODEL_NAME = 'gemini-1.5-flash-latest';

/**
 * Sends a prompt to Gemini and returns the text response.
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function generateText(prompt) {
  const client = getClient();
  const model  = client.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Sends a prompt and parses the response as JSON.
 * Strips markdown code fences if the model wraps the JSON in them.
 *
 * @param {string} prompt
 * @returns {Promise<any>}
 */
export async function generateJSON(prompt) {
  const raw = await generateText(prompt);

  // Strip ```json ... ``` or ``` ... ``` wrappers the model sometimes adds
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  return JSON.parse(cleaned);
}
