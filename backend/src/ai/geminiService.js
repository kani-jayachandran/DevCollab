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

/**
 * Use the fully-qualified model path "models/gemini-pro".
 * The @google/generative-ai SDK requires the "models/" prefix when calling
 * the stable v1 API endpoint. Short names like "gemini-1.0-pro" or
 * "gemini-1.5-flash" resolve only on v1beta and return "model not found"
 * errors on the stable endpoint used by SDK v0.x.
 */
const MODEL_NAME = 'models/gemini-pro';

/**
 * Sends a prompt to Gemini and returns the text response.
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function generateText(prompt) {
  try {
    const client = getClient();
    const model  = client.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    // Surface a friendly message for common failure modes
    if (err.message?.includes('GEMINI_API_KEY')) throw err;
    if (err.status === 404 || err.message?.includes('404')) {
      throw new Error(
        `Gemini model "${MODEL_NAME}" not found. Verify your GEMINI_API_KEY is valid and has access to the Gemini API.`
      );
    }
    if (err.status === 429 || err.message?.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please try again later.');
    }
    throw new Error(`Gemini request failed: ${err.message ?? 'unknown error'}`);
  }
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

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returned a response that could not be parsed as JSON.');
  }
}
