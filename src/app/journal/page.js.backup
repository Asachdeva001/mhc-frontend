'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Feather, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import JournalEditor from '@/components/JournalEditor';

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Fetch journal entries
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('mental_buddy_token');
        if (!token) {
          router.push('/auth/signin');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/journal?limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('mental_buddy_token');
          localStorage.removeItem('user');
          router.push('/auth/signin');
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch entries: ${response.status}`);
        }

        const data = await response.json();
        setEntries(data.entries || []);
      } catch (err) {
        console.error('Fetch entries error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user, router]);

  // Toggle favorite
  const toggleFavorite = async (entryId, currentStatus) => {
    try {
      const token = localStorage.getItem('mental_buddy_token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/journal/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isFavorite: !currentStatus }),
      });

      if (response.status === 401) {
        localStorage.removeItem('mental_buddy_token');
        localStorage.removeItem('user');
        router.push('/auth/signin');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      setEntries(entries.map(entry => 
        entry.id === entryId ? { ...entry, isFavorite: !currentStatus } : entry
      ));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Format date for magazine style
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      year: date.toLocaleDateString('en-US', { year: 'numeric' }),
    };
  };

  // Get mood emoji
  const getMoodEmoji = (score) => {
    if (!score) return null;
    if (score <= 3) return '😔';
    if (score <= 5) return '😐';
    if (score <= 7) return '🙂';
    if (score <= 9) return '😊';
    return '😄';
  };

  // Truncate content
  const truncateContent = (content, words = 30) => {
    const wordArray = content.split(' ');
    const truncated = wordArray.slice(0, words).join(' ');
    return truncated + (wordArray.length > words ? '...' : '');
  };

  // Open editor with animation
  const openEditor = (entry = null, event) => {
    const rect = event?.target.getBoundingClientRect();
    if (rect) {
      setClickPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    setSelectedEntry(entry);
    setShowEditor(true);
  };

  // Close editor
  const closeEditor = () => {
    setShowEditor(false);
    setSelectedEntry(null);
    // Refresh entries
    const fetchEntries = async () => {
      const token = localStorage.getItem('mental_buddy_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/journal?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    };
    fetchEntries();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#84A98C] via-[#FDFCF5] to-[#CAD2C5] animate-gradient-slow" />
        
        <Navigation />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/40"
          >
            <div className="animate-spin w-12 h-12 border-4 border-white border-t-[#84A98C] rounded-full"></div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Mesh Gradient Background - Slow Breathing Effect */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'linear-gradient(-45deg, #84A98C, #FDFCF5, #CAD2C5, #B8CEBF, #FDFCF5)',
            backgroundSize: '400% 400%',
            animation: 'gradient-breathing 20s ease infinite',
          }}
        />
        
        <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-quicksand font-semibold text-sanctuary-slate">
              Reflections
            </h1>
            <p className="text-sanctuary-slate/70 font-nunito mt-1">
              Your personal mindful journal
            </p>
          </div>

          {/* Desktop New Entry Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/journal/new')}
            className="hidden sm:flex items-center gap-2 bg-[#52796F] text-white px-6 py-3 rounded-3xl font-quicksand font-medium shadow-sanctuary hover:shadow-sanctuary-hover transition-sanctuary"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </motion.button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-3xl mb-6 font-nunito"
          >
            {error}
          </motion.div>
        )}

        {/* Daily Prompt Card */}
        <AnimatePresence>
          {!promptDismissed && !loadingPrompt && dailyPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="neumorphic rounded-3xl p-6 mb-8 relative overflow-hidden"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sanctuary-sage/20 to-transparent rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-sanctuary-sage/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-sanctuary-sage" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-quicksand font-semibold text-sanctuary-slate mb-2">
                    Today's Reflection Prompt
                  </h3>
                  <p className="text-sanctuary-slate/80 font-nunito leading-relaxed">
                    {dailyPrompt}
                  </p>
                </div>

                <button
                  onClick={dismissPrompt}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-sanctuary-sage/10 transition-sanctuary text-sanctuary-slate/60 hover:text-sanctuary-slate"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/journal/new')}
                className="mt-4 w-full sm:w-auto bg-sanctuary-sage/10 hover:bg-sanctuary-sage/20 text-sanctuary-sage px-6 py-2 rounded-3xl font-nunito font-medium transition-sanctuary"
              >
                Write about this
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sanctuary-slate/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your reflections..."
              className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-sanctuary-misty/40 rounded-3xl text-sanctuary-slate placeholder:text-sanctuary-slate/40 focus:outline-none focus:ring-2 focus:ring-sanctuary-sage/50 transition-sanctuary font-nunito"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sanctuary-slate/40 hover:text-sanctuary-slate"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tag Pills */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sanctuary-scrollbar">
              <Tag className="w-4 h-4 text-sanctuary-slate/60 flex-shrink-0" />
              
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-3xl font-nunito text-sm transition-sanctuary flex-shrink-0 ${
                  selectedTag === null
                    ? 'bg-sanctuary-sage text-white shadow-sanctuary'
                    : 'bg-white/60 text-sanctuary-slate/70 hover:bg-sanctuary-sage/10'
                }`}
              >
                All
              </button>

              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-3xl font-nunito text-sm transition-sanctuary flex-shrink-0 ${
                    selectedTag === tag
                      ? 'bg-sanctuary-sage text-white shadow-sanctuary'
                      : 'bg-white/60 text-sanctuary-slate/70 hover:bg-sanctuary-sage/10'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Entry Grid - Masonry Layout */}
        {filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="neumorphic rounded-3xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-sanctuary-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-sanctuary-sage" />
            </div>
            <h3 className="text-xl font-quicksand font-semibold text-sanctuary-slate mb-2">
              {searchQuery || selectedTag ? 'No entries found' : 'Start Your Journey'}
            </h3>
            <p className="text-sanctuary-slate/70 font-nunito mb-6 max-w-md mx-auto">
              {searchQuery || selectedTag 
                ? 'Try adjusting your search or filters'
                : 'Your reflections will appear here. Take a moment to write your first entry.'}
            </p>
            {!searchQuery && !selectedTag && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/journal/new')}
                className="bg-[#52796F] text-white px-6 py-3 rounded-3xl font-quicksand font-medium shadow-sanctuary hover:shadow-sanctuary-hover transition-sanctuary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Entry
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div 
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-sanctuary-hover transition-all duration-300 cursor-pointer border border-sanctuary-misty/20 h-full flex flex-col"
                  onClick={() => router.push(`/journal/${entry.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sanctuary-slate/50" />
                      <span className="text-sm font-nunito text-sanctuary-slate/70">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.moodScore && (
                        <span className="text-2xl" title={`Mood: ${entry.moodScore}/10`}>
                          {getMoodEmoji(entry.moodScore)}
                        </span>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(entry.id, entry.isFavorite);
                        }}
                        className="p-1.5 rounded-full hover:bg-sanctuary-sage/10 transition-sanctuary"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-sanctuary ${
                            entry.isFavorite 
                              ? 'fill-red-400 text-red-400' 
                              : 'text-sanctuary-slate/40 hover:text-red-400'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-quicksand font-semibold text-sanctuary-slate mb-2 line-clamp-2">
                    {entry.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-sanctuary-slate/70 font-nunito text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                    {truncateContent(entry.content)}
                  </p>

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {entry.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag}
                          className="px-3 py-1 bg-sanctuary-sage/10 text-sanctuary-sage text-xs font-nunito rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="px-3 py-1 bg-sanctuary-misty/30 text-sanctuary-slate/60 text-xs font-nunito rounded-full">
                          +{entry.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push('/journal/new')}
        className="sm:hidden fixed bottom-6 right-6 w-16 h-16 bg-[#52796F] text-white rounded-full shadow-sanctuary-hover flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </motion.button>
    </div>
  );
}
