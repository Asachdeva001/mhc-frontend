'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Toast from '../../components/Toast'; // Assuming this uses standard colors
import ConfirmationModal from '../../components/ConfirmationModal'; // Assuming this uses standard colors
import { useAuth } from '../../lib/authContext';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Database, ChevronRight, Save, Trash2, AlertTriangle, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';

const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data Management', icon: Database },
];

// --- Theme Constants (Standard Tailwind Emerald/Gray) ---
const COLORS = {
    primary: 'text-emerald-600',
    primaryBg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    textDark: 'text-gray-800',
    subtleText: 'text-gray-500',
    bgLight: 'bg-gray-50',
    cardBg: 'bg-white',
    cardBgGlass: 'bg-white/70 backdrop-blur-md',
    focusRing: 'focus:ring-emerald-500',
    focusBorder: 'focus:border-emerald-500',
};

const SettingsContent = ()=>{
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
        currentPassword: '',
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
                // Assuming api.user.getProfile is available
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
            // Assuming api.user.updateProfile is available
            const response = await api.user.updateProfile({
                name: profileData.name.trim(),
                bio: profileData.bio.trim(),
            });
            
            showToast('Profile updated successfully!', 'success');
            
            // Update the user in local storage to reflect name change
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            storedUser.name = profileData.name.trim();
            localStorage.setItem('user', JSON.stringify(storedUser));
            
            // Force a page refresh to update navigation/auth context across components
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
        
        if (!passwordData.currentPassword) {
            showToast('Please enter your current password', 'error');
            return;
        }

        if (!passwordData.newPassword) {
            showToast('Please enter a new password', 'error');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters long', 'error');
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            showToast('New password must be different from current password', 'error');
            return;
        }

        setIsSaving(true);
        
        try {
            // Verify current password and update to new one
            await api.user.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            
            showToast('Password updated successfully! Please sign in again.', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            
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
                    // Assuming api.user.deleteConversations is available
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
                    // Assuming api.user.deleteJournals is available
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
                    // Assuming api.user.deleteAccount is available
                    await api.user.deleteAccount(deleteEmailConfirm);
                    showToast('Account deletion initiated', 'success');
                    
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
            // Standardized loading screen
            <div className={`min-h-screen ${COLORS.bgLight}`}>
                <Navigation currentPage="settings" />
                <div className="flex items-center justify-center h-[80vh]">
                    <Loader2 className={`animate-spin h-8 w-8 ${COLORS.primary}`} />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        // Standardized background
        <div className={`min-h-screen ${COLORS.bgLight} bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative`}>
            <Navigation currentPage="settings" />
            
            {/* Toast Notification (Assuming Toast component is standardized) */}
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

            {/* Confirmation Modal (Assuming ConfirmationModal component is standardized) */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText="Yes, Proceed"
                cancelText="Cancel"
            />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className={`text-4xl font-bold ${COLORS.textDark} mb-3`}>Settings</h1>
                    <p className={`text-lg ${COLORS.subtleText}`}>Manage your account preferences and data</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Tabs Navigation - Left Sidebar */}
                    <motion.div 
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Standardized Glass Card Navigation */}
                        <nav className={`${COLORS.cardBgGlass} rounded-2xl p-3 space-y-2 sticky top-24 border border-white/60 shadow-xl`}>
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                                            activeTab === tab.id
                                                ? 'bg-emerald-100 text-emerald-700 shadow-md border border-emerald-300'
                                                : 'text-gray-700 hover:bg-white/90 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon size={20} />
                                            <span className="font-semibold">{tab.label}</span>
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
                                // Standardized Glass Card Content Container
                                className={`${COLORS.cardBgGlass} rounded-2xl p-8 md:p-10 shadow-xl border border-white/60`}
                            >
                                {activeTab === 'profile' && (
                                    <div>
                                        <h2 className={`text-3xl font-bold ${COLORS.textDark} mb-3`}>Profile Settings</h2>
                                        <p className={`text-lg ${COLORS.subtleText} mb-10`}>Update your personal information</p>

                                        {isLoadingProfile ? (
                                            <div className="space-y-6">
                                                <div className="animate-pulse">
                                                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                                                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                                                </div>
                                                <div className="animate-pulse">
                                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                                                </div>
                                                <div className="animate-pulse">
                                                    <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                                                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                                <div>
                                                    <label className={`block text-sm font-semibold ${COLORS.textDark} mb-3`}>
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileData.name}
                                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                        className={`w-full px-5 py-3 rounded-xl ${COLORS.cardBg} border border-gray-300 focus:outline-none focus:ring-2 ${COLORS.focusRing} ${COLORS.focusBorder} ${COLORS.textDark} placeholder:${COLORS.subtleText} transition-all duration-300`}
                                                        placeholder="Enter your name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-semibold ${COLORS.textDark} mb-3`}>
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        disabled
                                                        className={`w-full px-5 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 cursor-not-allowed`}
                                                    />
                                                    <p className={`text-xs ${COLORS.subtleText} mt-2`}>Email cannot be changed</p>
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-semibold ${COLORS.textDark} mb-3`}>
                                                        Bio
                                                    </label>
                                                    <textarea
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                        rows={4}
                                                        className={`w-full px-5 py-3 rounded-xl ${COLORS.cardBg} border border-gray-300 focus:outline-none focus:ring-2 ${COLORS.focusRing} ${COLORS.focusBorder} ${COLORS.textDark} placeholder:${COLORS.subtleText} resize-none transition-all duration-300`}
                                                        placeholder="Tell us about yourself..."
                                                    />
                                                </div>

                                                <motion.button
                                                    type="submit"
                                                    disabled={isSaving}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`flex items-center space-x-3 px-6 py-3 ${COLORS.primaryBg} text-white rounded-xl ${COLORS.hoverBg} transition-all duration-300 shadow-md shadow-emerald-300/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold`}
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
                                        <h2 className={`text-3xl font-bold ${COLORS.textDark} mb-3`}>Security Settings</h2>
                                        <p className={`text-lg ${COLORS.subtleText} mb-10`}>Manage your account security</p>

                                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                            <div>
                                                <label className={`block text-sm font-semibold ${COLORS.textDark} mb-3`}>
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className={`w-full px-5 py-3 pr-12 rounded-xl ${COLORS.cardBg} border border-gray-300 focus:outline-none focus:ring-2 ${COLORS.focusRing} ${COLORS.focusBorder} ${COLORS.textDark} placeholder:${COLORS.subtleText} transition-all duration-300`}
                                                        placeholder="Enter your current password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className={`absolute right-4 top-1/2 -translate-y-1/2 ${COLORS.subtleText} hover:${COLORS.textDark}`}
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                <p className={`text-xs ${COLORS.subtleText} mt-2`}>Required to verify your identity</p>
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-semibold ${COLORS.textDark} mb-3`}>
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className={`w-full px-5 py-3 pr-12 rounded-xl ${COLORS.cardBg} border border-gray-300 focus:outline-none focus:ring-2 ${COLORS.focusRing} ${COLORS.focusBorder} ${COLORS.textDark} placeholder:${COLORS.subtleText} transition-all duration-300`}
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className={`absolute right-4 top-1/2 -translate-y-1/2 ${COLORS.subtleText} hover:${COLORS.textDark}`}
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                <p className={`text-xs ${COLORS.subtleText} mt-2`}>Must be at least 6 characters and different from current password</p>
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-semibold ${COLORS.textDark} mb-3`}>
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className={`w-full px-5 py-3 rounded-xl ${COLORS.cardBg} border border-gray-300 focus:outline-none focus:ring-2 ${COLORS.focusRing} ${COLORS.focusBorder} ${COLORS.textDark} placeholder:${COLORS.subtleText} transition-all duration-300`}
                                                    placeholder="Confirm new password"
                                                />
                                            </div>

                                            <motion.button
                                                type="submit"
                                                disabled={isSaving}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex items-center space-x-3 px-6 py-3 ${COLORS.primaryBg} text-white rounded-xl ${COLORS.hoverBg} transition-all duration-300 shadow-md shadow-emerald-300/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold`}
                                            >
                                                <Lock size={20} />
                                                <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
                                            </motion.button>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'data' && (
                                    <div>
                                        <h2 className={`text-3xl font-bold ${COLORS.textDark} mb-3`}>Data Management</h2>
                                        <p className={`text-lg ${COLORS.subtleText} mb-10`}>Control your data and privacy</p>

                                        <div className="space-y-6">
                                            {/* Delete Chat History */}
                                            <div className="p-8 rounded-2xl bg-orange-50/70 border border-orange-200/80 shadow-md">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div>
                                                        <h3 className={`font-bold ${COLORS.textDark} mb-2 text-lg`}>Delete Chat History</h3>
                                                        <p className={`${COLORS.subtleText} leading-relaxed`}>
                                                            Permanently remove all your chat conversations. This action cannot be undone.
                                                        </p>
                                                    </div>
                                                    <AlertTriangle size={24} className="text-orange-600 flex-shrink-0 mt-1" />
                                                </div>
                                                <motion.button
                                                    onClick={handleDeleteConversations}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-300/50 font-semibold"
                                                >
                                                    <Trash2 size={18} />
                                                    <span>Delete Chat History</span>
                                                </motion.button>
                                            </div>

                                            {/* Delete Journal Entries */}
                                            <div className="p-8 rounded-2xl bg-orange-50/70 border border-orange-200/80 shadow-md">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div>
                                                        <h3 className={`font-bold ${COLORS.textDark} mb-2 text-lg`}>Delete Journal Entries</h3>
                                                        <p className={`${COLORS.subtleText} leading-relaxed`}>
                                                            Permanently remove all your journal entries. This action cannot be undone.
                                                        </p>
                                                    </div>
                                                    <AlertTriangle size={24} className="text-orange-600 flex-shrink-0 mt-1" />
                                                </div>
                                                <motion.button
                                                    onClick={handleDeleteJournals}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-300/50 font-semibold"
                                                >
                                                    <Trash2 size={18} />
                                                    <span>Delete All Journals</span>
                                                </motion.button>
                                            </div>

                                            {/* Delete Account */}
                                            <div className="p-8 rounded-2xl bg-red-50/70 border-2 border-red-300/80 shadow-xl">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div>
                                                        <h3 className={`font-bold text-red-700 mb-2 text-lg`}>Delete Account</h3>
                                                        <p className={`${COLORS.subtleText} leading-relaxed mb-4`}>
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
                                                        className={`w-full px-5 py-3 rounded-xl ${COLORS.cardBg} border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 ${COLORS.textDark} placeholder:${COLORS.subtleText} transition-all duration-300`}
                                                    />
                                                    <motion.button
                                                        onClick={handleDeleteAccount}
                                                        disabled={deleteEmailConfirm !== user?.email}
                                                        whileHover={{ scale: deleteEmailConfirm === user?.email ? 1.02 : 1 }}
                                                        whileTap={{ scale: deleteEmailConfirm === user?.email ? 0.98 : 1 }}
                                                        className="flex items-center space-x-3 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-300/50 font-semibold"
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

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SettingsContent />
        </Suspense>
    );
}