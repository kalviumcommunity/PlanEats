// Example usage of vectordb.js with embeddings.js
const { saveEmbedding, searchEmbedding } = require('./vectordb');
const { getEmbedding } = require('./embeddings');

(async () => {
    // Generate and save embedding for a sample text
    const text = "Suggest a healthy breakfast recipe using oats and bananas.";
    const embedding = await getEmbedding(text);
    saveEmbedding('sample1', embedding);

    // Search for similar embeddings
    const results = searchEmbedding(embedding, 1);
    console.log('Top match:', results);
})();
