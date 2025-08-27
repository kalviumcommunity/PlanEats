// judgePrompt.js
// This script defines the judge prompt and a function to compare model output with expected results.

const judgePrompt = `You are an impartial judge. Compare the model's output to the expected result for a given prompt. Consider relevance, completeness, and correctness. Score 1 for a good match, 0 for a poor match. Return only the score.`;

function judge(modelOutput, expected) {
    // Simple string similarity and keyword matching for demonstration
    const output = modelOutput.toLowerCase();
    const exp = expected.toLowerCase();
    if (output.includes(exp) || exp.includes(output)) {
        return 1;
    }
    // Check for key ingredient and meal type
    const ingredients = exp.match(/\b\w+\b/g);
    let matchCount = 0;
    ingredients.forEach(word => {
        if (output.includes(word)) matchCount++;
    });
    return matchCount / ingredients.length > 0.5 ? 1 : 0;
}

module.exports = { judgePrompt, judge };
