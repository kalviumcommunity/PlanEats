import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  BellIcon,
  CogIcon,
  HeartIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import authService from '../services/auth';
import { useAuthStore } from '../stores/authStore';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form
  const { 
    register: registerProfile, 
    handleSubmit: handleSubmitProfile, 
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    reset: resetProfile,
    watch
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      preferences: {
        dietaryRestrictions: user?.preferences?.dietaryRestrictions || [],
        allergies: user?.preferences?.allergies || [],
        cuisinePreferences: user?.preferences?.cuisinePreferences || [],
        cookingSkillLevel: user?.preferences?.cookingSkillLevel || 'beginner',
        mealPrepTime: user?.preferences?.mealPrepTime || '30'
      }
    }
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPassword,
    watch: watchPassword
  } = useForm();

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        preferences: {
          dietaryRestrictions: user.preferences?.dietaryRestrictions || [],
          allergies: user.preferences?.allergies || [],
          cuisinePreferences: user.preferences?.cuisinePreferences || [],
          cookingSkillLevel: user.preferences?.cookingSkillLevel || 'beginner',
          mealPrepTime: user.preferences?.mealPrepTime || '30'
        }
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const onSubmitPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      resetPassword();
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    try {
      await authService.deleteAccount();
      toast.success('Account deleted successfully');
      // Redirect will be handled by auth store
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'preferences', name: 'Preferences', icon: HeartIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'data', name: 'Data & Privacy', icon: ChartBarIcon }
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 
    'Low-Carb', 'Low-Fat', 'High-Protein', 'Mediterranean', 'Whole30'
  ];

  const allergyOptions = [
    'Nuts', 'Shellfish', 'Eggs', 'Dairy', 'Soy', 'Wheat', 'Fish', 'Sesame'
  ];

  const cuisineOptions = [
    'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Mediterranean',
    'Thai', 'French', 'Korean', 'Greek', 'American', 'Middle Eastern'
  ];

  const ProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Profile Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-secondary"
        >
          {isEditing ? (
            <>
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-white" />
            </div>
            {isEditing && (
              <button
                type="button"
                className="absolute -bottom-2 -right-2 p-2 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors"
              >
                <CameraIcon className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">{user?.name}</h3>
            <p className="text-dark-300">{user?.email}</p>
            <p className="text-sm text-dark-400">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              {...registerProfile('name', { required: 'Name is required' })}
              disabled={!isEditing}
              className={`input ${profileErrors.name ? 'input-error' : ''}`}
            />
            {profileErrors.name && (
              <p className="form-error">{profileErrors.name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              {...registerProfile('email', { required: 'Email is required' })}
              disabled={!isEditing}
              className={`input ${profileErrors.email ? 'input-error' : ''}`}
            />
            {profileErrors.email && (
              <p className="form-error">{profileErrors.email.message}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea
            {...registerProfile('bio')}
            disabled={!isEditing}
            rows={3}
            placeholder="Tell us about yourself..."
            className="input resize-none"
          />
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                resetProfile();
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="btn btn-primary"
            >
              {isSubmittingProfile ? 'Saving...' : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );

  const PreferencesTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Food Preferences</h2>
      
      <form className="space-y-6">
        {/* Dietary Restrictions */}
        <div className="form-group">
          <label className="form-label">Dietary Restrictions</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietaryOptions.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  {...registerProfile('preferences.dietaryRestrictions')}
                  className="rounded border-dark-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-200">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="form-group">
          <label className="form-label">Allergies</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allergyOptions.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  {...registerProfile('preferences.allergies')}
                  className="rounded border-dark-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-200">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cuisine Preferences */}
        <div className="form-group">
          <label className="form-label">Favorite Cuisines</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cuisineOptions.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  {...registerProfile('preferences.cuisinePreferences')}
                  className="rounded border-dark-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-200">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cooking Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Cooking Skill Level</label>
            <select
              {...registerProfile('preferences.cookingSkillLevel')}
              className="input"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Meal Prep Time (minutes)</label>
            <select
              {...registerProfile('preferences.mealPrepTime')}
              className="input"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2+ hours</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Security Settings</h2>
      
      {/* Change Password */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                {...registerPassword('currentPassword', { required: 'Current password is required' })}
                className={`input pr-10 ${passwordErrors.currentPassword ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-dark-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-dark-400" />
                )}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="form-error">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                {...registerPassword('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className={`input pr-10 ${passwordErrors.newPassword ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-dark-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-dark-400" />
                )}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="form-error">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...registerPassword('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === watchPassword('newPassword') || 'Passwords do not match'
                })}
                className={`input pr-10 ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-dark-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-dark-400" />
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="form-error">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmittingPassword}
            className="btn btn-primary"
          >
            {isSubmittingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Delete Account */}
      <div className="card p-6 border-red-900">
        <h3 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h3>
        <p className="text-dark-300 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="btn btn-danger"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete Account
        </button>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Notification Preferences</h2>
      
      <div className="space-y-4">
        {[
          { id: 'email_recipes', label: 'New Recipe Recommendations', description: 'Get notified about new recipes that match your preferences' },
          { id: 'email_meal_plans', label: 'Meal Plan Updates', description: 'Receive updates about your meal plans and schedules' },
          { id: 'email_tips', label: 'Cooking Tips & News', description: 'Weekly cooking tips and food-related news' },
          { id: 'push_reminders', label: 'Meal Prep Reminders', description: 'Push notifications for meal preparation reminders' },
          { id: 'push_shopping', label: 'Shopping List Updates', description: 'Notifications when your shopping list is updated' }
        ].map(notification => (
          <div key={notification.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">{notification.label}</h4>
                <p className="text-dark-300 text-sm">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const DataTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Data & Privacy</h2>
      
      <div className="space-y-6">
        {/* Data Export */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-white mb-4">Export Your Data</h3>
          <p className="text-dark-300 mb-4">
            Download a copy of your data including recipes, meal plans, and preferences.
          </p>
          <button className="btn btn-secondary">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Download Data
          </button>
        </div>

        {/* Privacy Settings */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-white mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Make Profile Public</h4>
                <p className="text-dark-300 text-sm">Allow others to see your favorite recipes and meal plans</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Analytics & Insights</h4>
                <p className="text-dark-300 text-sm">Help us improve by sharing anonymous usage data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'preferences': return <PreferencesTab />;
      case 'security': return <SecurityTab />;
      case 'notifications': return <NotificationsTab />;
      case 'data': return <DataTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">Profile Settings</h1>
          <p className="text-dark-300">
            Manage your account, preferences, and privacy settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4 sticky top-8">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-900 text-primary-400'
                          : 'text-dark-300 hover:text-white hover:bg-dark-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="card p-8"
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;