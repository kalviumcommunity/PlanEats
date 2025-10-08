import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

// Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import RecipeDetails from './pages/RecipeDetails';
import MealPlans from './pages/MealPlans';
import MealPlanGenerator from './pages/MealPlanGenerator';
import Profile from './pages/Profile';

function App() {
  const { initializeAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    // Ensure dark theme is always applied
    document.documentElement.classList.add('dark');
  }, [initializeAuth]);

  return (
    <div className="min-h-screen bg-dark-950 text-white dark">
      <Navigation />
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Register />} 
        />
        
        {/* Public recipe browsing */}
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/meal-plans" element={
          <ProtectedRoute>
            <MealPlans />
          </ProtectedRoute>
        } />
        
        <Route path="/meal-plans/generate" element={
          <ProtectedRoute>
            <MealPlanGenerator />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;