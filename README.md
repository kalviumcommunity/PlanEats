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

PlanEats AI is built using the **MERN** stack:

- **MongoDB:** For storing recipes, user data, and meal plans in a flexible NoSQL database.
- **Express.js:** Backend framework to handle API requests and business logic.
- **React.js:** Frontend library to build a dynamic and responsive user interface.
- **Node.js:** Runtime environment to run the backend server.
- **AI API:** Gemini Open AI API to implement meal planning.

---





