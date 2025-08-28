// dot_product_demo.js
// Demonstrates dot product similarity between two sample embeddings using vectordb.js

const { dotProduct } = require('./vectordb');

// Example embeddings (mocked vectors)
const embeddingA = [0.1, 0.2, 0.3, 0.4, 0.5];
const embeddingB = [0.1, 0.2, 0.3, 0.4, 0.5];
const embeddingC = [0.5, 0.4, 0.3, 0.2, 0.1];

console.log('Dot product (A, B):', dotProduct(embeddingA, embeddingB));
console.log('Dot product (A, C):', dotProduct(embeddingA, embeddingC));
