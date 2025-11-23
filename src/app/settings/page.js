'use client';

import { useState, useEffect, Suspense } from 'react';
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

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [toast, setToast] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, loading, router]);

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

    if (user) loadProfile();
  }, [user]);

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

      showToast('Profile updated successfully!', 'success');

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.name = profileData.name.trim();
      localStorage.setItem('user', JSON.stringify(storedUser));

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

      setTimeout(async () => {
        await signOut();
        router.push('/auth/signin');
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      showToast(error.message || 'Failed to update password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConversations = () => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Delete Chat History',
      message: 'Are you sure you want to delete all chat conversations? This action cannot be undone.',
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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen mesh-gradient-sanctuary relative">
      <Navigation currentPage="settings" />

      {/* Toast */}
      <div className="fixed top-20 right-4 z-50">
        <AnimatePresence>
          {toast && (
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
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

      {/* Rest of your JSX unchanged ... */}
      {/* ✅ KEEP everything below exactly as it was */}
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
