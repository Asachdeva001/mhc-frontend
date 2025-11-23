'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Smile,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { encryptionManager } from '@/lib/encryptionManager';

export default function JournalEditor({ entryId = null, initialData = null, onClose, clickPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 } }) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Editor state
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [moodScore, setMoodScore] = useState(initialData?.moodScore || null);
  const [tags, setTags] = useState(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite || false);
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Refs
  const contentRef = useRef(null);
  const moodSelectorRef = useRef(null);
  
  // Track unsaved changes
  useEffect(() => {
    const hasChanges = title.trim() !== (initialData?.title || '') || 
                      content.trim() !== (initialData?.content || '');
    setHasUnsavedChanges(hasChanges);
  }, [title, content, initialData]);
  
  // Get mood emoji
  const getMoodEmoji = (score) => {
    if (!score) return '😊';
    if (score <= 3) return '😔';
    if (score <= 5) return '😐';
    if (score <= 7) return '🙂';
    if (score <= 9) return '😊';
    return '😄';
  };

  // Save entry
  const saveEntry = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please add a title and write something before saving.');
      return;
    }

    if (!user) {
      setError('You must be logged in to save entries.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('mental_buddy_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = entryId 
        ? `${apiUrl}/api/journal/${entryId}`
        : `${apiUrl}/api/journal`;
      
      const method = entryId ? 'PUT' : 'POST';

      // Encrypt the entry before sending
      let entryData = {
        title: title.trim(),
        content: content.trim(),
        moodScore,
        tags,
        isFavorite,
      };

      try {
        const encryptedEntry = await encryptionManager.encryptJournalEntry(entryData, user.uid);
        entryData = encryptedEntry;
        console.log('🔐 Journal entry encrypted before save');
      } catch (encryptError) {
        console.warn('⚠️ Failed to encrypt entry, saving unencrypted:', encryptError);
        // Continue with unencrypted data if encryption fails
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save entry');
      }

      // Show success animation
      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      
      // Close after a brief moment
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete entry
  const deleteEntry = async () => {
    if (!entryId) return;
    
    if (!confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('mental_buddy_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/journal/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveEntry();
      }
      // Escape to close (with confirmation if unsaved)
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, moodScore, tags, isFavorite, hasUnsavedChanges]);

  // Close mood selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moodSelectorRef.current && !moodSelectorRef.current.contains(event.target)) {
        setShowMoodSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ clipPath: `circle(0% at ${clickPosition.x}px ${clickPosition.y}px)` }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ clipPath: `circle(0% at ${clickPosition.x}px ${clickPosition.y}px)` }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 bg-[#FDFCF5] z-[100] overflow-y-auto"
    >
      {/* Minimal Top Bar */}
      <div className="sticky top-0 bg-[#FDFCF5]/80 backdrop-blur-sm z-10 border-b border-[#CAD2C5]/30">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
          {/* Left: Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (hasUnsavedChanges) {
                if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-2 text-[#2F3E46]/60 hover:text-[#2F3E46] transition-colors font-light"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Back</span>
          </motion.button>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Mood Selector */}
            <div className="relative" ref={moodSelectorRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMoodSelector(!showMoodSelector)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all border border-white/60 text-[#2F3E46]/70"
              >
                <Smile className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-2xl">{getMoodEmoji(moodScore)}</span>
              </motion.button>

              <AnimatePresence>
                {showMoodSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 w-72 border border-white/60"
                  >
                    <p className="text-sm font-light text-[#2F3E46]/70 mb-4 text-center">
                      How are you feeling?
                    </p>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">😔</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={moodScore || 5}
                        onChange={(e) => setMoodScore(parseInt(e.target.value))}
                        className="flex-1 accent-[#84A98C]"
                      />
                      <span className="text-xl">😄</span>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-4xl">{getMoodEmoji(moodScore)}</span>
                      <p className="text-sm font-light text-[#2F3E46] mt-2">
                        {moodScore || 5}/10
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delete (only for existing entries) */}
            {entryId && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deleteEntry}
                className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-all"
              >
                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>
            )}

            {/* Save Button with Glow Effect */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveEntry}
              disabled={saving || !hasUnsavedChanges}
              className={`
                px-6 py-2 rounded-full font-light transition-all
                ${hasUnsavedChanges && !saving
                  ? 'bg-[#84A98C] text-white shadow-lg shadow-[#84A98C]/30' 
                  : 'bg-[#CAD2C5]/50 text-[#2F3E46]/50 cursor-not-allowed'}
              `}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Saving...
                </span>
              ) : saveSuccess ? (
                'Saved ✓'
              ) : (
                'Save'
              )}
            </motion.button>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-5xl mx-auto px-6 sm:px-8 pb-4"
            >
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-800 px-4 py-3 rounded-2xl text-sm font-light">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Editor Content - Centered and Zen */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          {/* Title Input - Massive Serif */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your reflection..."
            className="w-full text-4xl md:text-5xl font-playfair font-light text-[#2F3E46] placeholder:text-[#2F3E46]/20 bg-transparent border-none outline-none focus:ring-0 leading-tight"
            autoFocus
          />

          {/* Divider */}
          <div className="w-16 h-px bg-[#CAD2C5]" />

          {/* Content Textarea - Large, Centered, Serif */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Let your thoughts flow..."
            className="w-full min-h-[60vh] text-xl md:text-2xl font-playfair font-light text-[#2F3E46] placeholder:text-[#2F3E46]/20 bg-transparent border-none outline-none focus:ring-0 resize-none leading-relaxed"
          />

          {/* Tags Section */}
          <div className="pt-8 border-t border-[#CAD2C5]/30">
            <label className="text-sm font-light text-[#2F3E46]/60 mb-3 block flex items-center gap-2">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Tags
            </label>
            
            {/* Tag Pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <motion.div
                    key={tag}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm text-[#84A98C] rounded-full text-sm font-light border border-white/60"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                      className="hover:text-[#84A98C]/70 transition-colors"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault();
                  const newTag = tagInput.trim().toLowerCase().replace(/^#/, '');
                  if (!tags.includes(newTag) && newTag.length > 0) {
                    setTags([...tags, newTag]);
                  }
                  setTagInput('');
                }
              }}
              placeholder="Add a tag (press Enter)"
              className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl text-[#2F3E46] placeholder:text-[#2F3E46]/40 focus:outline-none focus:ring-2 focus:ring-[#84A98C]/30 transition-all font-light"
            />
          </div>
        </motion.div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#2F3E46]/80 backdrop-blur-sm text-white/90 rounded-full text-sm font-light"
      >
        <span className="hidden sm:inline">
          Press <kbd className="px-2 py-1 bg-white/20 rounded mx-1">⌘/Ctrl + S</kbd> to save • 
          <kbd className="px-2 py-1 bg-white/20 rounded mx-1">Esc</kbd> to exit
        </span>
        <span className="sm:hidden">
          Tap Save when ready
        </span>
      </motion.div>
    </motion.div>
  );
}
