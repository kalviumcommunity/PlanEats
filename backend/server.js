
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

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
