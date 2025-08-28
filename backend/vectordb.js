// vectordb.js
// This script demonstrates integrating a simple vector database using 'vectordb' (mocked for demo).
// For real use, you can use libraries like 'pinecone-client', 'weaviate-client', or 'faiss'.

const fs = require('fs');
const path = require('path');

const VECTOR_DB_PATH = path.join(__dirname, 'vector_db.json');

// Save embedding to vector DB
function saveEmbedding(id, embedding) {
    let db = [];
    if (fs.existsSync(VECTOR_DB_PATH)) {
        db = JSON.parse(fs.readFileSync(VECTOR_DB_PATH, 'utf8'));
    }
    db.push({ id, embedding });
    fs.writeFileSync(VECTOR_DB_PATH, JSON.stringify(db, null, 2));
}

// Search for nearest vector (cosine similarity)
function searchEmbedding(queryEmbedding, topK = 1) {
    if (!fs.existsSync(VECTOR_DB_PATH)) return [];
    const db = JSON.parse(fs.readFileSync(VECTOR_DB_PATH, 'utf8'));
    db.forEach(item => {
        item.similarity = cosineSimilarity(queryEmbedding, item.embedding);
    });
    return db.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

// Cosine similarity function
function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
}

// L2 (Euclidean) distance function
function l2Distance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

module.exports = { saveEmbedding, searchEmbedding, cosineSimilarity, l2Distance };
