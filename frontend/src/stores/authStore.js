import { create } from 'zustand';
import authService from '../services/auth';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAdminUser: false,

      // Login action
      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.login(email, password, rememberMe);
          const isAdminUser = data.user?.role === 'admin' || 
                             data.user?.role === 'super-admin' || 
                             data.user?.isAdmin === true;
          set({ user: data.user, isAdminUser, isLoading: false });
          toast.success('Login successful!');
          return data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.register(userData);
          const isAdminUser = data.user?.role === 'admin' || 
                             data.user?.role === 'super-admin' || 
                             data.user?.isAdmin === true;
          set({ user: data.user, isAdminUser, isLoading: false });
          toast.success('Registration successful!');
          return data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Logout action
      logout: () => {
        authService.logout();
        set({ user: null, error: null });
        toast.success('Logged out successfully');
      },

      // Update profile action
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.updateProfile(profileData);
          set({ user: data.user, isLoading: false });
          toast.success('Profile updated successfully!');
          return data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Update user directly (for local updates)
      updateUser: (userData) => {
        set({ user: userData });
      },

      // Initialize user from storage
      initializeAuth: () => {
        const user = authService.getCurrentUserFromStorage();
        if (user) {
          const isAdminUser = user.role === 'admin' || 
                             user.role === 'super-admin' || 
                             user.isAdmin === true;
          set({ user, isAdminUser });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check if user is authenticated
      isAuthenticated: () => {
        const { user } = get();
        return !!user && authService.isAuthenticated();
      },

      // Check if user is admin
      isAdmin: () => {
        const { isAdminUser } = get();
        return isAdminUser;
      }
    })
  );