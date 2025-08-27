# PlanEats AI

*Smart meal planning powered by your ingredients and diet preferences.*

## Overview

PlanEats AI is a smart meal planning application that allows users to input their available ingredients and dietary preferences. Leveraging Retrieval-Augmented Generation (RAG), it retrieves matching recipes from a curated dataset and generates a structured meal plan tailored to the user's needs.

This tool helps users efficiently use their ingredients, stick to their dietary goals, and discover new recipes effortlessly.

---

## Features

- **Ingredient-Based Search:** Input any combination of ingredients you have on hand.
- **Dietary Preferences:** Specify dietary needs such as vegan, vegetarian, gluten-free, keto, etc.
- **Retrieval-Augmented Generation (RAG):** Combines a retrieval system with AI generation to find relevant recipes and create personalized meal plans.
- **Structured Meal Plans:** Outputs clear, day-wise or meal-wise plans including breakfast, lunch, dinner, and snacks.
- **Recipe Details:** Provides step-by-step cooking instructions and nutritional information (if available).
- **Flexible & Customizable:** Easily adapt to different cuisines, meal types, or ingredient constraints.

---

## Key Concepts

### System and User Prompt

**System prompt:** Sets the overall behavior or role of the AI before any user input.

**User prompt:** The actual input or question provided by the user during interaction.

### Zero-Shot Prompting

Asking the AI to perform a task without providing any examples. The model relies purely on its pre-trained knowledge.

### One-Shot Prompting

Providing the AI with a single example of the desired output format or task before asking it to generate a response.

### Multi-Shot Prompting

Giving multiple examples in the prompt to better demonstrate the task, improving the AI’s understanding and output quality.

### Dynamic Prompting

Adjusting prompts on-the-fly based on context, previous responses, or user inputs to create more relevant and adaptive interactions.

### Chain of Thought Prompting

Encouraging the AI to break down reasoning step-by-step within the prompt, which helps with complex problem-solving or multi-step tasks.

### Evaluation Dataset and Testing Framework

A curated set of examples used to assess and benchmark the AI’s performance, along with tools and scripts to run automated testing.

### Tokens and Tokenization

**Tokens:** The smallest units (words, subwords, or characters) the model processes.

**Tokenization:** The process of breaking text into tokens for the AI to understand and generate language effectively.

---

## Tech Stack



- **MongoDB:** For storing recipes, user data, and meal plans in a flexible NoSQL database.
- **Express.js:** Backend framework to handle API requests and business logic.
- **React.js:** Frontend library to build a dynamic and responsive user interface.
- **Node.js:** Runtime environment to run the backend server.
- **AI API:** Gemini Open AI API to implement meal planning.

  
---

## Backend Server (JavaScript)

This backend server is built with Node.js and Express. It demonstrates the use of system and user prompts for managing meal plans, applying the RTFC framework.

### RTFC Framework in Prompts
- **Role:** The system prompt defines the assistant's function for PlanEats.
- **Task:** Prompts specify what the assistant should do (e.g., add a meal plan).
- **Format:** Responses are structured and concise.
- **Constraints:** Prompts include privacy and guideline requirements.

### Example Prompts
**System Prompt:**
```
You are an AI assistant for PlanEats, helping users manage meal plans and tasks.
Role: Guide users in organizing, tracking, and updating their meal plans and related tasks.
Task: Provide clear, actionable responses and ask clarifying questions if needed.
Format: Respond in concise, structured text.
Constraints: Ensure user privacy and follow PlanEats guidelines.
```

**User Prompt:**
```
Add a new meal plan: "High Protein Diet" starting September 1, 2025.
```

### How to Run
1. Install dependencies:
	```
	npm install express
	```
2. Start the server:
	```
	node backend/server.js
	```
3. Access prompts at [http://localhost:3000/prompts](http://localhost:3000/prompts)

### Endpoints
- `GET /prompts`: Returns system/user prompts and RTFC explanation.
- `POST /mealplans`: Simulates adding a meal plan.






