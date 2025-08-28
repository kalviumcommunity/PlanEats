// cosine_similarity_demo.js
// Demonstrates cosine similarity between two sample embeddings using vectordb.js

const { cosineSimilarity } = require('./vectordb');

// Example embeddings (mocked vectors)
const embeddingA = [0.1, 0.2, 0.3, 0.4, 0.5];
const embeddingB = [0.1, 0.2, 0.3, 0.4, 0.5];
const embeddingC = [0.5, 0.4, 0.3, 0.2, 0.1];

console.log('Cosine similarity (A, B):', cosineSimilarity(embeddingA, embeddingB)); // Should be 1
console.log('Cosine similarity (A, C):', cosineSimilarity(embeddingA, embeddingC)); // Should be less than 1
