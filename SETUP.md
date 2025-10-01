# PlanEats AI - Complete Setup Guide

## 🚀 Quick Setup

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys:
# MONGO_URI=mongodb://localhost:27017/planeats
# GEMINI_API_KEY=your_gemini_api_key_here
# JWT_SECRET=your_super_secret_jwt_key_here

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup (5 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🎯 Remaining Implementation Tasks

### Frontend Components to Create:

1. **Core Components** (`src/components/`):
   - `Navigation.jsx` - Header with dark theme navigation
   - `Hero.jsx` - Landing page hero section
   - `RecipeCard.jsx` - Recipe display cards
   - `MealPlanGenerator.jsx` - AI meal plan form
   - `Dashboard.jsx` - User analytics dashboard
   - `AuthForms.jsx` - Login/signup forms

2. **Main Pages** (`src/pages/`):
   - `LandingPage.jsx` - Homepage with hero and features
   - `Login.jsx` - Authentication page
   - `Dashboard.jsx` - User dashboard
   - `Recipes.jsx` - Recipe search and browse
   - `RecipeDetails.jsx` - Individual recipe view
   - `MealPlans.jsx` - Meal plan management
   - `Profile.jsx` - User settings

3. **Services** (`src/services/`):
   - `api.js` - Axios configuration and API calls
   - `auth.js` - Authentication service
   - `recipes.js` - Recipe API calls
   - `mealplans.js` - Meal plan API calls

4. **State Management** (`src/stores/`):
   - `authStore.js` - Authentication state (Zustand)
   - `recipeStore.js` - Recipe state management
   - `mealplanStore.js` - Meal plan state

## 🎨 Frontend Component Examples

### Navigation Component
```jsx
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Navigation() {
  const { user, logout } = useAuthStore();
  
  return (
    <nav className="bg-dark-900/95 backdrop-blur-sm border-b border-dark-800">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <div className="text-gradient text-xl font-bold">PlanEats AI</div>
          <div className="hidden md:flex space-x-4">
            <NavLink to="/" className="nav-link">Home</NavLink>
            <NavLink to="/recipes" className="nav-link">Recipes</NavLink>
            <NavLink to="/meal-plans" className="nav-link">Meal Plans</NavLink>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                <button onClick={logout} className="btn-secondary">Logout</button>
              </>
            ) : (
              <NavLink to="/login" className="btn-primary">Login</NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### Hero Section
```jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero-gradient min-h-screen flex items-center">
      <div className="container-custom">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">Smart Meal Planning</span><br />
            <span className="text-white">Powered by AI</span>
          </h1>
          <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            Transform your available ingredients into personalized meal plans with AI-powered recipe suggestions and nutrition tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary text-lg px-8 py-4">
              Start Planning
            </Link>
            <Link to="/recipes" className="btn-secondary text-lg px-8 py-4">
              Browse Recipes
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

## 🔑 API Integration

### Authentication Service
```javascript
// src/services/auth.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authService = {
  async login(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  },
  
  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  },
  
  logout() {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default authService;
```

## 🗄️ State Management with Zustand

```javascript
// src/stores/authStore.js
import { create } from 'zustand';
import authService from '../services/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      set({ user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      throw error;
    }
  },
  
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({ user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    authService.logout();
    set({ user: null, error: null });
  }
}));
```

## 🎯 Features Implementation Priority

### Phase 1 - Core Authentication & Navigation
1. Set up React Router
2. Create Navigation component
3. Implement Authentication forms
4. Create protected routes

### Phase 2 - Recipe Management
1. Recipe listing page with search
2. Recipe detail view
3. Recipe creation form
4. Favorite recipes functionality

### Phase 3 - AI Meal Planning
1. Meal plan generator form
2. AI integration for meal plan creation
3. Meal plan dashboard
4. Shopping list generation

### Phase 4 - User Experience
1. User dashboard with analytics
2. Profile management
3. Advanced filtering and search
4. Mobile responsiveness improvements

## 🚀 Deployment Instructions

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Deploy with build command: `npm install` and start command: `npm start`

### Frontend (Netlify)
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure redirects for SPA: `/*    /index.html   200`

### Database (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas
2. Create a database user
3. Configure network access (0.0.0.0/0 for development)
4. Update `MONGO_URI` in environment variables

## 🎨 Dark Theme Implementation

The project includes a comprehensive dark theme with:
- Custom Tailwind configuration
- Glassmorphism effects
- Smooth animations
- Accessible focus states
- Modern gradient effects

Key color palette:
- Primary: Emerald green (#10b981)
- Secondary: Cyan (#06b6d4)  
- Background: Almost black (#0f0f0f)
- Surface: Dark blue-gray variants

## ✅ Testing Strategy

### Backend Testing
- Unit tests for models and utilities
- Integration tests for API endpoints
- Authentication middleware testing

### Frontend Testing
- Component unit tests with React Testing Library
- User interaction testing
- API integration testing

## 📱 Mobile Optimization

The application is built with mobile-first design:
- Responsive navigation with hamburger menu
- Touch-friendly buttons and inputs
- Optimized layouts for all screen sizes
- Fast loading with code splitting

## 🔒 Security Best Practices

- JWT token-based authentication
- bcrypt password hashing (12 rounds)
- Input validation and sanitization
- CORS configuration
- Rate limiting on sensitive endpoints
- Environment variable security

## 🚀 Performance Optimizations

- Vite for fast development and builds
- React lazy loading for code splitting
- Image optimization and compression
- MongoDB indexing for fast queries
- API response caching
- Frontend state management optimization

This comprehensive setup guide provides everything needed to complete the PlanEats AI application. The backend foundation is complete, and the frontend structure is ready for component implementation following the provided examples and architecture.