// l2_distance_demo.js
// Demonstrates L2 (Euclidean) distance between two sample embeddings using vectordb.js

const { l2Distance } = require('./vectordb');

// Example embeddings (mocked vectors)
const embeddingA = [0.1, 0.2, 0.3, 0.4, 0.5];
const embeddingB = [0.1, 0.2, 0.3, 0.4, 0.5];
const embeddingC = [0.5, 0.4, 0.3, 0.2, 0.1];

console.log('L2 distance (A, B):', l2Distance(embeddingA, embeddingB)); // Should be 0
console.log('L2 distance (A, C):', l2Distance(embeddingA, embeddingC)); // Should be > 0
