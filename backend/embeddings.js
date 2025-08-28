// embeddings.js
// This script demonstrates generating text embeddings using Gemini API (mocked for demo).

const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getEmbedding(text) {
    // Gemini API endpoint for embeddings (replace with actual endpoint if available)
    const url = `https://generativelanguage.googleapis.com/v1beta2/models/embedding-001:embedText?key=${GEMINI_API_KEY}`;
    const payload = {
        text,
        model: "embedding-001"
    };
    try {
        const response = await axios.post(url, payload);
        // Return the embedding vector
        return response.data.embedding;
    } catch (error) {
        console.error('Error generating embedding:', error.message);
        return null;
    }
}

// Example usage
(async () => {
    const sampleText = "Suggest a healthy breakfast recipe using oats and bananas.";
    const embedding = await getEmbedding(sampleText);
    console.log('Embedding for sample text:', embedding);
})();
