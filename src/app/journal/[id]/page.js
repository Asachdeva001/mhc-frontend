'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter, useParams } from 'next/navigation';
import JournalEditor from '@/components/JournalEditor';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import { Edit, Heart, Calendar, Tag, ArrowLeft } from 'lucide-react';

export default function JournalEntryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const entryId = params.id;

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!user || !entryId) return;

      try {
        const token = localStorage.getItem('mental_buddy_token');
        console.log('🔑 Sending Token:', token?.substring(0, 20) + '...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/journal?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch entry');

        const data = await response.json();
        const foundEntry = data.entries.find(e => e.id === entryId);
        
        if (!foundEntry) {
          setError('Entry not found');
        } else {
          setEntry(foundEntry);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [user, entryId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getMoodEmoji = (score) => {
    if (!score) return null;
    if (score <= 3) return '😔';
    if (score <= 5) return '😐';
    if (score <= 7) return '🙂';
    if (score <= 9) return '😊';
    return '😄';
  };

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem('mental_buddy_token');
      console.log('🔑 Sending Token:', token?.substring(0, 20) + '...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/journal/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isFavorite: !entry.isFavorite }),
      });

      if (!response.ok) throw new Error('Failed to update favorite');

      setEntry({ ...entry, isFavorite: !entry.isFavorite });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF5]">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="neumorphic rounded-3xl p-8">
            <div className="animate-spin w-12 h-12 border-4 border-sanctuary-sage border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFCF5]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="neumorphic rounded-3xl p-8 text-center">
            <p className="text-sanctuary-slate/70 font-nunito mb-4">{error}</p>
            <button
              onClick={() => router.push('/journal')}
              className="bg-[#52796F] text-white px-6 py-3 rounded-3xl font-nunito hover:bg-[#52796F]/90 transition-sanctuary"
            >
              Back to Journal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing && entry) {
    return (
      <JournalEditor 
        entryId={entryId}
        initialData={entry}
        onClose={() => {
          setIsEditing(false);
          // Refresh entry data
          setLoading(true);
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }}
      />
    );
  }

  if (!entry) return null;

  return (
    <div className="min-h-screen bg-[#FDFCF5]">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/journal')}
          className="flex items-center gap-2 text-sanctuary-slate/70 hover:text-sanctuary-slate font-nunito mb-6 transition-sanctuary"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Journal
        </motion.button>

        {/* Entry Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-sanctuary border border-sanctuary-misty/20"
        >
          {/* Header Actions */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-sanctuary-slate/50" />
              <span className="text-sanctuary-slate/70 font-nunito">
                {formatDate(entry.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {entry.moodScore && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-sanctuary-sage/10 rounded-full">
                  <span className="text-2xl">{getMoodEmoji(entry.moodScore)}</span>
                  <span className="text-sm font-nunito text-sanctuary-slate">
                    {entry.moodScore}/10
                  </span>
                </div>
              )}

              <button
                onClick={toggleFavorite}
                className="p-2 rounded-full hover:bg-sanctuary-sage/10 transition-sanctuary"
              >
                <Heart 
                  className={`w-6 h-6 transition-sanctuary ${
                    entry.isFavorite 
                      ? 'fill-red-400 text-red-400' 
                      : 'text-sanctuary-slate/40 hover:text-red-400'
                  }`}
                />
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sanctuary-sage/10 hover:bg-sanctuary-sage/20 text-sanctuary-sage rounded-full transition-sanctuary font-nunito"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 
            className="text-4xl sm:text-5xl font-serif font-light text-sanctuary-slate mb-6 leading-tight"
            style={{ fontFamily: "'Merriweather', 'Lora', serif" }}
          >
            {entry.title}
          </h1>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none text-sanctuary-slate/90 leading-relaxed mb-8 whitespace-pre-wrap"
            style={{ fontFamily: "'Merriweather', 'Lora', serif" }}
          >
            {entry.content}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-6 border-t border-sanctuary-misty/30">
              <Tag className="w-4 h-4 text-sanctuary-slate/50" />
              {entry.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1.5 bg-sanctuary-sage/10 text-sanctuary-sage text-sm font-nunito rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Metadata Footer */}
        {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-sanctuary-slate/50 font-nunito mt-4"
          >
            Last edited {new Date(entry.updatedAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </motion.p>
        )}
      </div>
    </div>
  );
}
