const axios = require('axios');
const Recipe = require('../models/Recipe');

// AI Service for generating meal plans using Gemini or OpenAI
class AIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.preferredModel = process.env.AI_MODEL || 'gemini'; // 'gemini' or 'openai'
  }

  // Generate system prompt for meal planning
  generateSystemPrompt() {
    return `You are PlanEats AI, a specialized meal planning assistant that creates personalized meal plans based on available ingredients and dietary preferences.

Role: Generate structured, practical meal plans that maximize ingredient usage while meeting dietary requirements and nutritional goals.

Task: Create detailed meal plans with specific recipes, cooking instructions, and nutritional information.

Format: Respond with a structured JSON object containing:
- title: Meal plan title
- description: Brief description
- meals: Array of daily meal objects with breakfast, lunch, dinner, and snacks
- totalNutrition: Estimated nutrition totals
- shoppingList: Additional ingredients needed

Constraints:
- Use provided ingredients as much as possible
- Respect all dietary restrictions and allergies
- Ensure nutritional balance
- Provide realistic cooking times and difficulty levels
- Include variety across days
- Suggest reasonable portion sizes`;
  }

  // Generate user prompt for meal plan creation
  generateUserPrompt(params) {
    const {
      ingredients,
      duration,
      dietaryPreferences,
      allergies,
      goals,
      excludeIngredients,
      favoriteIngredients,
      cuisinePreferences,
      cookingTime,
      mealTypes,
      servings,
      nutritionGoals
    } = params;

    let prompt = `Create a ${duration}-day meal plan using these available ingredients: ${ingredients.join(', ')}.\n\n`;
    
    prompt += `Requirements:\n`;
    prompt += `- Servings per meal: ${servings}\n`;
    prompt += `- Meal types to include: ${mealTypes.join(', ')}\n`;
    prompt += `- Cooking time preference: ${cookingTime}\n`;
    
    if (dietaryPreferences.length > 0) {
      prompt += `- Dietary preferences: ${dietaryPreferences.join(', ')}\n`;
    }
    
    if (allergies.length > 0) {
      prompt += `- Allergies to avoid: ${allergies.join(', ')}\n`;
    }
    
    if (excludeIngredients.length > 0) {
      prompt += `- Ingredients to avoid: ${excludeIngredients.join(', ')}\n`;
    }
    
    if (favoriteIngredients.length > 0) {
      prompt += `- Favorite ingredients to prioritize: ${favoriteIngredients.join(', ')}\n`;
    }
    
    if (cuisinePreferences.length > 0) {
      prompt += `- Cuisine preferences: ${cuisinePreferences.join(', ')}\n`;
    }
    
    if (goals.length > 0) {
      prompt += `- Health goals: ${goals.join(', ')}\n`;
    }
    
    if (nutritionGoals && nutritionGoals.dailyCalories) {
      prompt += `- Target daily calories: ${nutritionGoals.dailyCalories}\n`;
    }

    prompt += `\nPlease provide a JSON response with the following structure:
{
  \"title\": \"Meal Plan Title\",
  \"description\": \"Brief description\",
  \"meals\": [
    {
      \"day\": 1,
      \"date\": \"2024-01-01\",
      \"dayName\": \"Monday\",
      \"breakfast\": {
        \"customMeal\": {
          \"name\": \"Recipe Name\",
          \"ingredients\": [\"ingredient 1\", \"ingredient 2\"],
          \"instructions\": \"Step-by-step cooking instructions\",
          \"nutrition\": { \"calories\": 300, \"protein\": 15, \"carbs\": 40, \"fat\": 10 }
        },
        \"servings\": 1
      },
      \"lunch\": { /* similar structure */ },
      \"dinner\": { /* similar structure */ },
      \"snacks\": [{ /* similar structure */ }]
    }
  ],
  \"totalNutrition\": {
    \"dailyAverage\": { \"calories\": 2000, \"protein\": 100, \"carbs\": 250, \"fat\": 65 }
  },
  \"additionalIngredients\": [\"ingredient 1\", \"ingredient 2\"]
}`;

    return prompt;
  }

  // Call Gemini API
  async callGeminiAPI(systemPrompt, userPrompt) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`;
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const content = response.data.candidates[0].content;
        if (content && content.parts && content.parts[0]) {
          return {
            success: true,
            content: content.parts[0].text,
            model: 'gemini-pro'
          };
        }
      }

      return {
        success: false,
        error: 'Invalid response format from Gemini API'
      };
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      return {
        success: false,
        error: `Gemini API error: ${error.response?.data?.error?.message || error.message}`
      };
    }
  }

  // Call OpenAI API
  async callOpenAIAPI(systemPrompt, userPrompt) {
    try {
      const url = 'https://api.openai.com/v1/chat/completions';
      
      const payload = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return {
          success: true,
          content: response.data.choices[0].message.content,
          model: 'gpt-3.5-turbo'
        };
      }

      return {
        success: false,
        error: 'Invalid response format from OpenAI API'
      };
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      return {
        success: false,
        error: `OpenAI API error: ${error.response?.data?.error?.message || error.message}`
      };
    }
  }

  // Parse AI response to meal plan format
  parseAIResponse(content) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\\{[\\s\\S]*\\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.meals || !Array.isArray(parsed.meals)) {
        throw new Error('Invalid meals format');
      }

      // Process meals to ensure proper format
      const processedMeals = parsed.meals.map((day, index) => {
        const processedDay = {
          day: day.day || index + 1,
          date: day.date || new Date(),
          dayName: day.dayName || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()],
          breakfast: day.breakfast || {},
          lunch: day.lunch || {},
          dinner: day.dinner || {},
          snacks: day.snacks || [],
          totalNutrition: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          }
        };

        // Calculate daily nutrition totals
        const mealsToCheck = [processedDay.breakfast, processedDay.lunch, processedDay.dinner, ...processedDay.snacks];
        mealsToCheck.forEach(meal => {
          if (meal.customMeal && meal.customMeal.nutrition) {
            const servings = meal.servings || 1;
            processedDay.totalNutrition.calories += (meal.customMeal.nutrition.calories || 0) * servings;
            processedDay.totalNutrition.protein += (meal.customMeal.nutrition.protein || 0) * servings;
            processedDay.totalNutrition.carbs += (meal.customMeal.nutrition.carbs || 0) * servings;
            processedDay.totalNutrition.fat += (meal.customMeal.nutrition.fat || 0) * servings;
          }
        });

        return processedDay;
      });

      return {
        success: true,
        title: parsed.title || 'AI Generated Meal Plan',
        description: parsed.description || 'Personalized meal plan created by AI',
        meals: processedMeals,
        totalNutrition: parsed.totalNutrition || {},
        additionalIngredients: parsed.additionalIngredients || []
      };
    } catch (error) {
      console.error('Parse AI response error:', error);
      return {
        success: false,
        error: `Failed to parse AI response: ${error.message}`
      };
    }
  }

  // Main function to generate meal plan
  async generateMealPlan(params) {
    try {
      // Validate required parameters
      if (!params.ingredients || params.ingredients.length === 0) {
        return {
          success: false,
          error: 'Ingredients are required'
        };
      }

      if (!params.duration || params.duration < 1) {
        return {
          success: false,
          error: 'Duration must be at least 1 day'
        };
      }

      const systemPrompt = this.generateSystemPrompt();
      const userPrompt = this.generateUserPrompt(params);

      let aiResponse;
      
      // Try primary AI model first
      if (this.preferredModel === 'gemini' && this.geminiApiKey) {
        aiResponse = await this.callGeminiAPI(systemPrompt, userPrompt);
        
        // Fallback to OpenAI if Gemini fails
        if (!aiResponse.success && this.openaiApiKey) {
          console.log('Gemini failed, trying OpenAI...');
          aiResponse = await this.callOpenAIAPI(systemPrompt, userPrompt);
        }
      } else if (this.preferredModel === 'openai' && this.openaiApiKey) {
        aiResponse = await this.callOpenAIAPI(systemPrompt, userPrompt);
        
        // Fallback to Gemini if OpenAI fails
        if (!aiResponse.success && this.geminiApiKey) {
          console.log('OpenAI failed, trying Gemini...');
          aiResponse = await this.callGeminiAPI(systemPrompt, userPrompt);
        }
      } else {
        return {
          success: false,
          error: 'No AI API keys configured'
        };
      }

      if (!aiResponse.success) {
        return aiResponse;
      }

      // Parse the AI response
      const parsedResponse = this.parseAIResponse(aiResponse.content);
      if (!parsedResponse.success) {
        return parsedResponse;
      }

      return {
        success: true,
        model: aiResponse.model,
        ...parsedResponse
      };
    } catch (error) {
      console.error('Generate meal plan error:', error);
      return {
        success: false,
        error: `Meal plan generation failed: ${error.message}`
      };
    }
  }

  // Get recipe suggestions based on ingredients
  async getRecipeSuggestions(ingredients, options = {}) {
    try {
      const {
        dietaryTags = [],
        mealType = [],
        limit = 10
      } = options;

      // Search for existing recipes first
      const existingRecipes = await Recipe.findByIngredients(ingredients, {
        dietaryTags,
        mealType,
        limit
      });

      if (existingRecipes.length > 0) {
        return {
          success: true,
          recipes: existingRecipes,
          source: 'database'
        };
      }

      // If no existing recipes, generate with AI
      const systemPrompt = 'You are a recipe suggestion AI. Generate creative recipes using the provided ingredients.';
      const userPrompt = `Suggest ${limit} recipes using these ingredients: ${ingredients.join(', ')}. Include dietary tags: ${dietaryTags.join(', ')}. Format as JSON array with recipe objects.`;

      let aiResponse;
      if (this.preferredModel === 'gemini' && this.geminiApiKey) {
        aiResponse = await this.callGeminiAPI(systemPrompt, userPrompt);
      } else if (this.openaiApiKey) {
        aiResponse = await this.callOpenAIAPI(systemPrompt, userPrompt);
      }

      if (!aiResponse.success) {
        return aiResponse;
      }

      // Parse recipe suggestions
      try {
        const recipes = JSON.parse(aiResponse.content);
        return {
          success: true,
          recipes,
          source: 'ai-generated'
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to parse recipe suggestions'
        };
      }
    } catch (error) {
      console.error('Get recipe suggestions error:', error);
      return {
        success: false,
        error: `Recipe suggestions failed: ${error.message}`
      };
    }
  }
}

// Create singleton instance
const aiService = new AIService();

// Export main functions
const generateMealPlanWithAI = (params) => aiService.generateMealPlan(params);
const getRecipeSuggestionsWithAI = (ingredients, options) => aiService.getRecipeSuggestions(ingredients, options);

module.exports = {
  generateMealPlanWithAI,
  getRecipeSuggestionsWithAI,
  AIService
};