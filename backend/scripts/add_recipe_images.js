const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

// Sample recipe images for different types of dishes
const recipeImages = [
  {
    title: "Spaghetti Carbonara",
    images: [
      {
        url: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=800&h=600&fit=crop",
        alt: "Delicious spaghetti carbonara with parmesan cheese",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1606755965493-87e4b6b5f4b5?w=600&h=400&fit=crop",
        alt: "Close-up of carbonara sauce coating pasta",
        isPrimary: false
      }
    ]
  },
  {
    title: "Chicken Tikka Masala",
    images: [
      {
        url: "https://images.unsplash.com/photo-1603360946369-dc9bbd814503?w=800&h=600&fit=crop",
        alt: "Creamy chicken tikka masala with rice",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop",
        alt: "Spiced chicken pieces in tomato sauce",
        isPrimary: false
      }
    ]
  },
  {
    title: "Caesar Salad",
    images: [
      {
        url: "https://images.unsplash.com/photo-1550304943-93d0cb03bf53?w=800&h=600&fit=crop",
        alt: "Fresh caesar salad with croutons and parmesan",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
        alt: "Salad greens with caesar dressing",
        isPrimary: false
      }
    ]
  },
  {
    title: "Beef Tacos",
    images: [
      {
        url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
        alt: "Delicious beef tacos with fresh toppings",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1422560519424-230667b6b130?w=600&h=400&fit=crop",
        alt: "Taco ingredients and assembly",
        isPrimary: false
      }
    ]
  },
  {
    title: "Grilled Salmon",
    images: [
      {
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
        alt: "Perfectly grilled salmon with vegetables",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1626082927389-6cd097cee6a6?w=600&h=400&fit=crop",
        alt: "Fresh salmon fillet seasoned and ready to grill",
        isPrimary: false
      }
    ]
  },
  {
    title: "Vegetable Stir Fry",
    images: [
      {
        url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
        alt: "Colorful vegetable stir fry with tofu",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1513426790186-41d61e37f3a3?w=600&h=400&fit=crop",
        alt: "Fresh vegetables ready for stir fry",
        isPrimary: false
      }
    ]
  },
  {
    title: "Chocolate Chip Cookies",
    images: [
      {
        url: "https://images.unsplash.com/photo-1499636136210-6f4ee7dbd9c6?w=800&h=600&fit=crop",
        alt: "Freshly baked chocolate chip cookies",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1606792630921-23d6469e32ce?w=600&h=400&fit=crop",
        alt: "Stack of warm chocolate chip cookies",
        isPrimary: false
      }
    ]
  },
  {
    title: "Avocado Toast",
    images: [
      {
        url: "https://images.unsplash.com/photo-1525351484163-75294c88b3c9?w=800&h=600&fit=crop",
        alt: "Healthy avocado toast with poached egg",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1573283341523-6a6d597ff46b?w=600&h=400&fit=crop",
        alt: "Fresh avocado slices on toast",
        isPrimary: false
      }
    ]
  },
  {
    title: "Mushroom Risotto",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606491956689-2ea863456b6c?w=800&h=600&fit=crop",
        alt: "Creamy mushroom risotto served in a bowl",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop",
        alt: "Risotto cooking process with mushrooms",
        isPrimary: false
      }
    ]
  },
  {
    title: "Greek Yogurt Parfait",
    images: [
      {
        url: "https://images.unsplash.com/photo-1626032874840-5ddae5dc2f1d?w=800&h=600&fit=crop",
        alt: "Layered Greek yogurt parfait with berries",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1511689987387-88eb6bdde1ec?w=600&h=400&fit=crop",
        alt: "Fresh berries and granola for parfait",
        isPrimary: false
      }
    ]
  }
];

async function updateRecipesWithImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/planeats');
    console.log('Connected to database');

    // Update each recipe with matching title
    for (const recipeData of recipeImages) {
      const result = await Recipe.updateMany(
        { title: { $regex: new RegExp(recipeData.title, 'i') } },
        { $set: { images: recipeData.images } }
      );

      console.log(`Updated ${result.modifiedCount} recipe(s) with title "${recipeData.title}"`);
    }

    // Also update any remaining recipes that might have similar names
    const remainingRecipes = await Recipe.find({ images: { $exists: true, $eq: [] } }).select('title');
    
    if (remainingRecipes.length > 0) {
      console.log(`Found ${remainingRecipes.length} recipes without images, updating with default images...`);
      
      for (let i = 0; i < remainingRecipes.length; i++) {
        const recipe = remainingRecipes[i];
        const randomImageSet = recipeImages[Math.floor(Math.random() * recipeImages.length)];
        
        await Recipe.updateOne(
          { _id: recipe._id },
          { $set: { images: randomImageSet.images } }
        );
        
        console.log(`Updated recipe "${recipe.title}" with random images`);
      }
    }

    console.log('All recipes have been updated with images!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating recipes with images:', error);
    process.exit(1);
  }
}

updateRecipesWithImages();

/*
To run this script when MongoDB is available:
1. Make sure MongoDB is running on your system
2. Navigate to the backend directory: cd /Users/fibafathima/Documents/PlanEats/PlanEats/backend
3. Run the script: node scripts/add_recipe_images.js

Alternative manual approach:
If you want to manually add images to recipes via the API:
- Use POST /api/recipes or PUT /api/recipes/:id
- Include an "images" field in the request body:
{
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "alt": "Description of the image",
      "isPrimary": true
    }
  ]
}
*/