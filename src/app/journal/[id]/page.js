'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter, useParams } from 'next/navigation';
import JournalEditor from '@/components/JournalEditor'; // Assuming this component uses the new palette
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import { Edit, Heart, Calendar, Tag, ArrowLeft, Loader2 } from 'lucide-react';

// --- Theme Constants (Standard Tailwind Emerald/Gray) ---
const COLORS = {
    primary: 'text-emerald-600',
    primaryBg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    text: 'text-gray-800',
    subtleText: 'text-gray-500',
    bgLight: 'bg-gray-50', // Matches the dashboard background
    cardBg: 'bg-white',
    focusRing: 'focus:ring-emerald-500',
};

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
                // NOTE: Using a placeholder URL and simulating token use.
                const token = localStorage.getItem('mental_buddy_token');
                console.log('🔑 Sending Token:', token?.substring(0, 20) + '...');
                
                // Using a wider limit to ensure finding the entry, as in the original code
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

        // Note: The original code's dependency array was missing `entryId` and `authLoading`,
        // leading to potential initial fetch issues if `user` was null. 
        // Assuming this is a controlled environment where `fetchEntry` is safe to call after initial checks.
        if (user && !authLoading) {
            fetchEntry();
        }
    }, [user, entryId, authLoading]);

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
            // Assuming endpoint accepts PATCH/PUT for favoriting
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
            <div className={`min-h-screen ${COLORS.bgLight}`}>
                <Navigation />
                <div className="flex items-center justify-center min-h-[80vh]">
                    {/* Modern Loading Spinner */}
                    <div className={`${COLORS.cardBg} rounded-xl p-8 shadow-lg border border-gray-100`}>
                        <Loader2 className={`w-12 h-12 ${COLORS.primary} animate-spin`} />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${COLORS.bgLight}`}>
                <Navigation />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    {/* Error Card */}
                    <div className={`${COLORS.cardBg} rounded-xl p-8 text-center shadow-lg border border-red-200`}>
                        <p className={`text-red-600 mb-4 font-semibold`}>{error}</p>
                        <button
                            onClick={() => router.push('/journal')}
                            className={`${COLORS.primaryBg} text-white px-6 py-3 rounded-lg font-semibold ${COLORS.hoverBg} transition-colors shadow-md`}
                        >
                            Back to Journal
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Pass the current entry data to the editor for initial load
    if (isEditing && entry) {
        return (
            <JournalEditor 
                entryId={entryId}
                initialData={entry}
                onClose={() => {
                    setIsEditing(false);
                    // Force a hard refresh to re-fetch the potentially updated entry data
                    window.location.reload(); 
                }}
            />
        );
    }

    if (!entry) return null;

    return (
        <div className={`min-h-screen ${COLORS.bgLight}`}>
            <Navigation />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.push('/journal')}
                    className={`flex items-center gap-2 ${COLORS.subtleText} hover:${COLORS.primary} font-medium mb-6 transition-colors`}
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Journal
                </motion.button>

                {/* Entry Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    // Clean, elevated card style
                    className={`${COLORS.cardBg} rounded-2xl p-8 sm:p-12 shadow-xl border border-gray-100`}
                >
                    {/* Header Actions */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex flex-col gap-2">
                            <h1 
                                className={`text-4xl sm:text-5xl font-serif font-bold ${COLORS.text} leading-tight`}
                            >
                                {entry.title}
                            </h1>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className={`w-4 h-4 ${COLORS.subtleText}`} />
                                <span className={`${COLORS.subtleText} font-medium`}>
                                    {formatDate(entry.createdAt)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Mood Score */}
                            {entry.moodScore && (
                                <div className={`flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full border border-emerald-200`}>
                                    <span className="text-xl">{getMoodEmoji(entry.moodScore)}</span>
                                    <span className={`text-sm font-semibold ${COLORS.primary}`}>
                                        {entry.moodScore}/10
                                    </span>
                                </div>
                            )}

                            {/* Favorite Button */}
                            <motion.button
                                onClick={toggleFavorite}
                                className="p-2 rounded-full hover:bg-red-50 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Heart 
                                    className={`w-6 h-6 transition-colors ${
                                        entry.isFavorite 
                                            ? 'fill-red-500 text-red-500 shadow-sm' 
                                            : 'text-gray-400 hover:text-red-400'
                                    }`}
                                />
                            </motion.button>

                            {/* Edit Button */}
                            <button
                                onClick={() => setIsEditing(true)}
                                className={`flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-semibold rounded-full hover:bg-emerald-100 transition-colors border border-emerald-200`}
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div 
                        className={`prose prose-lg max-w-none ${COLORS.text} leading-relaxed mb-8 border-t border-gray-100 pt-8`}
                    >
                        {/* Using dangerouslySetInnerHTML if content is rich text/HTML, otherwise just display string */}
                        <p className="whitespace-pre-wrap">{entry.content}</p>
                    </div>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-6 border-t border-gray-100">
                            <Tag className={`w-4 h-4 ${COLORS.subtleText}`} />
                            {entry.tags.map(tag => (
                                <span 
                                    key={tag}
                                    className="px-3 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded-full"
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
                        className={`text-center text-sm ${COLORS.subtleText} mt-4`}
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