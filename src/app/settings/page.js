'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useAuth } from '../../lib/authContext';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Database, ChevronRight, Save, Trash2, AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'data', label: 'Data Management', icon: Database },
];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    email: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Deletion email confirmation
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('');

  // Initialize from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, loading, router]);

  // Load user profile data from backend
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        const response = await api.user.getProfile();
        setProfileData({
          name: response.name || user.name || '',
          bio: response.bio || '',
          email: response.email || user.email || '',
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to user data from auth context
        setProfileData({
          name: user.name || '',
          bio: '',
          email: user.email || '',
        });
        showToast('Could not load profile details', 'warning');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  // Helper function to show toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.push(`/settings?tab=${tabId}`, { scroll: false });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await api.user.updateProfile({
        name: profileData.name.trim(),
        bio: profileData.bio.trim(),
      });
      
      console.log('Profile updated:', response);
      showToast('Profile updated successfully!', 'success');
      
      // Update the user in local storage to reflect name change
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.name = profileData.name.trim();
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      // Force a page refresh to update navigation
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      await api.user.updatePassword(passwordData.newPassword);
      
      showToast('Password updated! Please sign in again.', 'success');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      
      // Sign out after 2 seconds
      setTimeout(async () => {
        await signOut();
        router.push('/auth/signin');
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      const errorMessage = error.message || 'Failed to update password';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConversations = () => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Delete Chat History',
      message: 'Are you sure you want to delete all your chat conversations? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await api.user.deleteConversations();
          showToast(response.message || 'Chat history deleted successfully', 'success');
        } catch (error) {
          console.error('Error deleting conversations:', error);
          showToast(error.message || 'Failed to delete chat history', 'error');
        }
      },
    });
  };

  const handleDeleteJournals = () => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Delete Journal Entries',
      message: 'Are you sure you want to delete all your journal entries? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await api.user.deleteJournals();
          showToast(response.message || 'Journal entries deleted successfully', 'success');
        } catch (error) {
          console.error('Error deleting journals:', error);
          showToast(error.message || 'Failed to delete journal entries', 'error');
        }
      },
    });
  };

  const handleDeleteAccount = () => {
    if (deleteEmailConfirm !== user?.email) {
      showToast('Email confirmation does not match', 'error');
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Account',
      message: 'This will permanently delete your account and ALL associated data. This action cannot be undone. Are you absolutely sure?',
      onConfirm: async () => {
        try {
          await api.user.deleteAccount(deleteEmailConfirm);
          showToast('Account deleted successfully', 'success');
          
          // Sign out and redirect after 2 seconds
          setTimeout(async () => {
            await signOut();
            router.push('/');
          }, 2000);
        } catch (error) {
          console.error('Error deleting account:', error);
          showToast(error.message || 'Failed to delete account', 'error');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sanctuary-cream">
        <Navigation currentPage="settings" />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-sanctuary-slate">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen mesh-gradient-sanctuary relative">
      <Navigation currentPage="settings" />
      
      {/* Toast Notification */}
      <div className="fixed top-20 right-4 z-50">
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-sanctuary-slate mb-3 font-nunito">Settings</h1>
          <p className="text-lg text-sanctuary-slate/60 font-quicksand">Manage your account preferences and data</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tabs Navigation - Left Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <nav className="frosted-glass rounded-3xl p-3 space-y-2 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-sanctuary-sage/20 text-sanctuary-sage shadow-lg border border-sanctuary-sage/30'
                        : 'text-sanctuary-slate hover:bg-white/60 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <span className="font-semibold font-nunito">{tab.label}</span>
                    </div>
                    {activeTab === tab.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={18} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>

          {/* Content Area */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="frosted-glass rounded-3xl p-8 md:p-12"
              >
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-3xl font-bold text-sanctuary-slate mb-3 font-nunito">Profile Settings</h2>
                    <p className="text-sanctuary-slate/60 mb-10 font-quicksand text-lg">Update your personal information</p>

                    {isLoadingProfile ? (
                      <div className="space-y-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-sanctuary-misty/30 rounded w-20 mb-2"></div>
                          <div className="h-12 bg-sanctuary-misty/30 rounded-2xl"></div>
                        </div>
                        <div className="animate-pulse">
                          <div className="h-4 bg-sanctuary-misty/30 rounded w-24 mb-2"></div>
                          <div className="h-12 bg-sanctuary-misty/30 rounded-2xl"></div>
                        </div>
                        <div className="animate-pulse">
                          <div className="h-4 bg-sanctuary-misty/30 rounded w-16 mb-2"></div>
                          <div className="h-32 bg-sanctuary-misty/30 rounded-2xl"></div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-sanctuary-slate mb-3 font-nunito">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-6 py-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-sanctuary-sage/40 focus:border-sanctuary-sage/40 text-sanctuary-slate placeholder:text-sanctuary-slate/40 transition-all duration-300 font-quicksand"
                          placeholder="Enter your name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-sanctuary-slate mb-3 font-nunito">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-6 py-4 rounded-2xl bg-sanctuary-misty/20 border border-sanctuary-misty/40 text-sanctuary-slate/60 cursor-not-allowed font-quicksand"
                        />
                        <p className="text-xs text-sanctuary-slate/50 mt-2 font-quicksand">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-sanctuary-slate mb-3 font-nunito">
                          Bio
                        </label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          rows={4}
                          className="w-full px-6 py-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-sanctuary-sage/40 focus:border-sanctuary-sage/40 text-sanctuary-slate placeholder:text-sanctuary-slate/40 resize-none transition-all duration-300 font-quicksand"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSaving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-3 px-8 py-4 bg-sanctuary-sage text-white rounded-2xl hover:bg-sanctuary-sage/90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold font-nunito"
                      >
                        <Save size={20} />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                      </motion.button>
                    </form>
                    )}
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-3xl font-bold text-sanctuary-slate mb-3 font-nunito">Security Settings</h2>
                    <p className="text-sanctuary-slate/60 mb-10 font-quicksand text-lg">Manage your account security</p>

                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-sanctuary-slate mb-3 font-nunito">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-6 py-4 pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-sanctuary-sage/40 focus:border-sanctuary-sage/40 text-sanctuary-slate placeholder:text-sanctuary-slate/40 transition-all duration-300 font-quicksand"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sanctuary-slate/60 hover:text-sanctuary-slate"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <p className="text-xs text-sanctuary-slate/50 mt-2 font-quicksand">Must be at least 6 characters</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-sanctuary-slate mb-3 font-nunito">
                          Confirm New Password
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-6 py-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-sanctuary-sage/40 focus:border-sanctuary-sage/40 text-sanctuary-slate placeholder:text-sanctuary-slate/40 transition-all duration-300 font-quicksand"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSaving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-3 px-8 py-4 bg-sanctuary-sage text-white rounded-2xl hover:bg-sanctuary-sage/90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold font-nunito"
                      >
                        <Lock size={20} />
                        <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
                      </motion.button>
                    </form>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div>
                    <h2 className="text-3xl font-bold text-sanctuary-slate mb-3 font-nunito">Data Management</h2>
                    <p className="text-sanctuary-slate/60 mb-10 font-quicksand text-lg">Control your data and privacy</p>

                    <div className="space-y-6">
                      {/* Delete Chat History */}
                      <div className="frosted-glass p-8 rounded-3xl bg-gradient-to-br from-orange-50/40 to-orange-100/20 border border-orange-200/40">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-sanctuary-slate mb-2 text-lg font-nunito">Delete Chat History</h3>
                            <p className="text-sanctuary-slate/60 font-quicksand leading-relaxed">
                              Permanently remove all your chat conversations. This action cannot be undone.
                            </p>
                          </div>
                          <AlertTriangle size={24} className="text-orange-600 flex-shrink-0 mt-1" />
                        </div>
                        <motion.button
                          onClick={handleDeleteConversations}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl font-semibold font-nunito"
                        >
                          <Trash2 size={18} />
                          <span>Delete Chat History</span>
                        </motion.button>
                      </div>

                      {/* Delete Journal Entries */}
                      <div className="frosted-glass p-8 rounded-3xl bg-gradient-to-br from-orange-50/40 to-orange-100/20 border border-orange-200/40">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-sanctuary-slate mb-2 text-lg font-nunito">Delete Journal Entries</h3>
                            <p className="text-sanctuary-slate/60 font-quicksand leading-relaxed">
                              Permanently remove all your journal entries. This action cannot be undone.
                            </p>
                          </div>
                          <AlertTriangle size={24} className="text-orange-600 flex-shrink-0 mt-1" />
                        </div>
                        <motion.button
                          onClick={handleDeleteJournals}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl font-semibold font-nunito"
                        >
                          <Trash2 size={18} />
                          <span>Delete All Journals</span>
                        </motion.button>
                      </div>

                      {/* Delete Account */}
                      <div className="frosted-glass p-8 rounded-3xl bg-gradient-to-br from-red-50/50 to-red-100/30 border-2 border-red-300/50">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-red-700 mb-2 text-lg font-nunito">Delete Account</h3>
                            <p className="text-sanctuary-slate/70 mb-4 font-quicksand leading-relaxed">
                              Permanently delete your account and all associated data. This action cannot be undone and you will lose all your data forever.
                            </p>
                          </div>
                          <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-1" />
                        </div>
                        <div className="space-y-4">
                          <input
                            type="email"
                            value={deleteEmailConfirm}
                            onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                            placeholder={`Type ${user?.email} to confirm`}
                            className="w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 text-sanctuary-slate placeholder:text-sanctuary-slate/40 transition-all duration-300 font-quicksand"
                          />
                          <motion.button
                            onClick={handleDeleteAccount}
                            disabled={deleteEmailConfirm !== user?.email}
                            whileHover={{ scale: deleteEmailConfirm === user?.email ? 1.02 : 1 }}
                            whileTap={{ scale: deleteEmailConfirm === user?.email ? 0.98 : 1 }}
                            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold font-nunito"
                          >
                            <Trash2 size={18} />
                            <span>Delete My Account</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
