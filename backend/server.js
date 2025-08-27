// Dynamic prompting endpoint
// Dynamic prompting means adjusting the prompt on-the-fly based on user input or context.
app.post('/dynamic-prompt', async (req, res) => {
    const { ingredient, preference } = req.body;
    // Build the prompt dynamically based on user input
    let dynamicPrompt = `Suggest a healthy breakfast recipe using ${ingredient}`;
    if (preference) {
        dynamicPrompt += ` that is ${preference}`;
    }
    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                { role: "user", parts: [{ text: dynamicPrompt }] }
            ]
        };
        const response = await axios.post(geminiUrl, payload);
        res.json({
            dynamicPrompt,
            geminiResponse: response.data,
            explanation: "Dynamic prompting adjusts the prompt based on user input or context. This endpoint demonstrates the concept by building a recipe prompt using ingredients and preferences provided in the request body."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Dynamic prompting endpoint
// Dynamic prompting means adjusting the prompt on-the-fly based on user input or context.
app.post('/dynamic-prompt', async (req, res) => {
    const { ingredient, preference } = req.body;
    // Build the prompt dynamically based on user input
    let dynamicPrompt = `Suggest a healthy breakfast recipe using ${ingredient}`;
    if (preference) {
        dynamicPrompt += ` that is ${preference}`;
    }
    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                { role: "user", parts: [{ text: dynamicPrompt }] }
            ]
        };
        const response = await axios.post(geminiUrl, payload);
        res.json({
            dynamicPrompt,
            geminiResponse: response.data,
            explanation: "Dynamic prompting adjusts the prompt based on user input or context. This endpoint demonstrates the concept by building a recipe prompt using ingredients and preferences provided in the request body."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Multi-shot prompting endpoint
// Multi-shot prompting means asking the AI to perform a task and providing multiple examples to guide its response.
const multiShotPrompt = "Suggest a healthy breakfast recipe using oats and bananas.";
const multiShotExamples = [
    "Example 1: For oats and apples, a healthy breakfast could be overnight oats with diced apples, cinnamon, and honey.",
    "Example 2: For oats and berries, a healthy breakfast could be berry oatmeal with mixed berries, chia seeds, and almond milk."
];

app.get('/multi-shot', async (req, res) => {
    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                { role: "user", parts: [{ text: multiShotExamples[0] }] },
                { role: "user", parts: [{ text: multiShotExamples[1] }] },
                { role: "user", parts: [{ text: multiShotPrompt }] }
            ]
        };
        const response = await axios.post(geminiUrl, payload);
        res.json({
            multiShotPrompt,
            multiShotExamples,
            geminiResponse: response.data,
            explanation: "Multi-shot prompting provides the AI with multiple examples to guide its response. This endpoint demonstrates the concept by giving Gemini two examples of healthy breakfasts using oats and apples/berries, then asking for a recipe using oats and bananas."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// One-shot prompting endpoint
// One-shot prompting means asking the AI to perform a task and providing a single example to guide its response.
const oneShotPrompt = "Suggest a healthy breakfast recipe using oats and bananas.";
const oneShotExample = "Example: For oats and apples, a healthy breakfast could be overnight oats with diced apples, cinnamon, and honey.";

app.get('/one-shot', async (req, res) => {
    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                { role: "user", parts: [{ text: oneShotExample }] },
                { role: "user", parts: [{ text: oneShotPrompt }] }
            ]
        };
        const response = await axios.post(geminiUrl, payload);
        res.json({
            oneShotPrompt,
            oneShotExample,
            geminiResponse: response.data,
            explanation: "One-shot prompting provides the AI with a single example to guide its response. This endpoint demonstrates the concept by giving Gemini an example of a healthy breakfast using oats and apples, then asking for a recipe using oats and bananas."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const app = express();
app.use(express.json());
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// System prompt (RTFC: Role, Task, Format, Constraints)
const systemPrompt = `
You are an AI assistant for PlanEats, helping users manage meal plans and tasks.
Role: Guide users in organizing, tracking, and updating their meal plans and related tasks.
Task: Provide clear, actionable responses and ask clarifying questions if needed.
Format: Respond in concise, structured text.
Constraints: Ensure user privacy and follow PlanEats guidelines.
`;

// Example user prompt
const userPrompt = `Add a new meal plan: "High Protein Diet" starting September 1, 2025.`;

// Endpoint to get prompts and RTFC explanation

// Endpoint to send prompts to Gemini API and get response
app.get('/prompts', async (req, res) => {
    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                { role: "system", parts: [{ text: systemPrompt }] },
                { role: "user", parts: [{ text: userPrompt }] }
            ]
        };
        const response = await axios.post(geminiUrl, payload);
        res.json({
            systemPrompt,
            userPrompt,
            geminiResponse: response.data,
            rtfcExplanation: {
                Role: "Defines the assistant's function for PlanEats.",
                Task: "Specifies what the assistant should do for the user.",
                Format: "Indicates how responses should be structured.",
                Constraints: "Lists rules and limitations for privacy and guidelines."
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Simple endpoint to add a meal plan (simulated)
app.post('/mealplans', (req, res) => {
    const { plan, startDate } = req.body;
    // Here you would normally save to a database
    res.json({
        message: `Meal plan "${plan}" starting on "${startDate}" added successfully.`,
        systemPrompt,
        userPrompt: `Add a new meal plan: "${plan}" starting ${startDate}.`
    });
});



// Zero-shot prompting endpoint
// Zero-shot prompting means asking the AI to perform a task without providing any examples.
// The model relies purely on its pre-trained knowledge.

app.get('/zero-shot', async (req, res) => {
    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                { role: "user", parts: [{ text: zeroShotPrompt }] }
            ]
        };
        const response = await axios.post(geminiUrl, payload);
        res.json({
            zeroShotPrompt,
            geminiResponse: response.data,
            explanation: "Zero-shot prompting asks the AI to perform a task without examples, relying on its general knowledge. This endpoint demonstrates that by requesting a recipe suggestion with no prior context or examples."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Zero-shot prompting endpoint
// Zero-shot prompting means asking the AI to perform a task without providing any examples.
// The model relies purely on its pre-trained knowledge.
const zeroShotPrompt = "Suggest a healthy breakfast recipe using oats and bananas.";

app.get('/zero-shot', async (req, res) => {
    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                { role: "user", parts: [{ text: zeroShotPrompt }] }
            ]
        };
        const response = await axios.post(geminiUrl, payload);
        res.json({
            zeroShotPrompt,
            geminiResponse: response.data,
            explanation: "Zero-shot prompting asks the AI to perform a task without examples, relying on its general knowledge. This endpoint demonstrates that by requesting a recipe suggestion with no prior context or examples."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
