// testFramework.js
// This script loads the evaluation dataset, runs each sample through the model (mocked), and uses the judge to score results.

const fs = require('fs');
const { judgePrompt, judge } = require('./judgePrompt');

// Load dataset
const dataset = JSON.parse(fs.readFileSync('c:/Users/admin/Desktop/Fiba\'s project/PlanEats/backend/evaluation_dataset.json', 'utf8'));

// Mock model output (replace with actual Gemini API call in production)
function mockModel(input) {
    // For demo, return expected output or a slight variation
    if (input.includes('oats and bananas')) return 'Banana oat pancakes with honey and cinnamon.';
    if (input.includes('chickpeas')) return 'Chickpea salad with tomatoes, cucumber, and lemon.';
    if (input.includes('rice and vegetables')) return 'Vegetable stir-fry with rice and tofu.';
    if (input.includes('Greek yogurt')) return 'Greek yogurt parfait with berries and nuts.';
    if (input.includes('eggs')) return 'Scrambled eggs with spinach and feta.';
    return 'No answer.';
}

// Run evaluation
let results = [];
dataset.forEach(sample => {
    const modelOutput = mockModel(sample.input);
    const score = judge(modelOutput, sample.expected);
    results.push({
        input: sample.input,
        expected: sample.expected,
        modelOutput,
        score
    });
});

console.log('Evaluation Results:');
console.table(results);

// Summary
const total = results.length;
const passed = results.filter(r => r.score === 1).length;
console.log(`Passed: ${passed}/${total}`);
