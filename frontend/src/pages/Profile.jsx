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
      });
    }
  }, [user, resetProfile]);

  const handleProfileSubmit = async (data) => {
    try {
      await updateUser(data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password updated successfully!');
      resetPassword();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to update password. Please check your current password.');
    }
  };

  const dietaryOptions = [
    'vegan', 'vegetarian', 'keto', 'paleo', 'gluten-free', 
    'dairy-free', 'nut-free', 'low-carb', 'low-fat', 'high-protein'
  ];

  const cuisineOptions = [
    'american', 'italian', 'mexican', 'chinese', 'indian', 
    'mediterranean', 'french', 'japanese', 'thai', 'greek'
  ];

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-orange-500 text-white'
          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
      }`}
    >
      <Icon className="h-5 w-5 mr-2" />
      {label}
    </button>
  );

  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-orange-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h3>
          <p className="text-gray-600">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-12 w-12 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-xl p-2 shadow-lg border border-gray-100">
            <TabButton
              id="profile"
              label="Profile"
              icon={UserIcon}
              isActive={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
            <TabButton
              id="preferences"
              label="Preferences"
              icon={CogIcon}
              isActive={activeTab === 'preferences'}
              onClick={() => setActiveTab('preferences')}
            />
            <TabButton
              id="security"
              label="Security"
              icon={ShieldCheckIcon}
              isActive={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
            />
            <TabButton
              id="notifications"
              label="Notifications"
              icon={BellIcon}
              isActive={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    {isEditing ? (
                      <>
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmitProfile(handleProfileSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          {...registerProfile('name', { required: 'Name is required' })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Enter your full name"
                        />
                        {profileErrors.name && (
                          <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          {...registerProfile('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Enter your email"
                        />
                        {profileErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{profileErrors.email.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          {...registerProfile('bio')}
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        disabled={isSubmittingProfile}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                      >
                        {isSubmittingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <p className="text-gray-900">{user.name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <p className="text-gray-900">{user.bio || 'No bio provided'}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Dietary Restrictions
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {dietaryOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            user.preferences?.dietaryRestrictions?.includes(option)
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Cuisine Preferences
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {cuisineOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            user.preferences?.cuisinePreferences?.includes(option)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cooking Skill Level
                      </label>
                      <p className="text-gray-900 capitalize">{user.preferences?.cookingSkillLevel || 'Beginner'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Prep Time (minutes)
                      </label>
                      <p className="text-gray-900">{user.preferences?.mealPrepTime || '30'} minutes</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                
                <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('currentPassword', { required: 'Current password is required' })}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('newPassword', { 
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        type={showNewPassword ? 'text' : 'password'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('confirmPassword', { required: 'Please confirm your new password' })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingPassword}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      {isSubmittingPassword ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={user.preferences?.notifications?.email || false}
                    onChange={() => {}}
                    label="Email Notifications"
                  />
                  <ToggleSwitch
                    checked={user.preferences?.notifications?.push || false}
                    onChange={() => {}}
                    label="Push Notifications"
                  />
                  <ToggleSwitch
                    checked={user.preferences?.notifications?.mealReminders || false}
                    onChange={() => {}}
                    label="Meal Reminders"
                  />
                  <ToggleSwitch
                    checked={user.preferences?.notifications?.planUpdates || false}
                    onChange={() => {}}
                    label="Plan Updates"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;