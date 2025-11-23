'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Feather, Heart, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import JournalEditor from '@/components/JournalEditor';
import { encryptionManager } from '@/lib/encryptionManager';

// --- Theme Constants (Standard Tailwind Emerald/Gray) ---
const COLORS = {
    primary: 'text-emerald-600',
    primaryBg: 'bg-emerald-600',
    textDark: 'text-gray-800',
    subtleText: 'text-gray-500',
    bgLight: 'bg-gray-50', // Base screen background
    cardBgLight: 'bg-white/40', // Floating glass card background
    cardBorder: 'border-white/60',
    accentLight: 'bg-emerald-200',
    accentDark: 'text-emerald-700',
};

export default function JournalPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
    const [encryptionReady, setEncryptionReady] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin');
        }
    }, [user, authLoading, router]);

    // Initialize encryption
    useEffect(() => {
        const initEncryption = async () => {
            if (!user) return;
            
            try {
                await encryptionManager.initializeForUser(user.uid);
                setEncryptionReady(true);
                console.log('🔐 Journal encryption ready');
            } catch (error) {
                console.error('❌ Failed to initialize journal encryption:', error);
                setEncryptionReady(true); // Continue without encryption
            }
        };

        initEncryption();
    }, [user]);

    // Fetch journal entries
    useEffect(() => {
        const fetchEntries = async () => {
            if (!user || !encryptionReady) return;

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
                const fetchedEntries = data.entries || [];

                // Decrypt entries
                try {
                    const decryptedEntries = await encryptionManager.decryptJournalEntries(fetchedEntries, user.uid);
                    setEntries(decryptedEntries);
                    console.log('✅ Journal entries decrypted:', decryptedEntries.length);
                } catch (decryptError) {
                    console.warn('⚠️ Failed to decrypt some entries, using original data:', decryptError);
                    setEntries(fetchedEntries);
                }
            } catch (err) {
                console.error('Fetch entries error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, [user, router, encryptionReady]);

    // Toggle favorite (kept simple)
    const toggleFavorite = async (entryId, currentStatus) => {
        try {
            const token = localStorage.getItem('mental_buddy_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/journal/${entryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ isFavorite: !currentStatus }),
            });

            if (!response.ok) throw new Error('Failed to update favorite');

            setEntries(entries.map(entry => 
                entry.id === entryId ? { ...entry, isFavorite: !currentStatus } : entry
            ));
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    // Format date
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
        // Calculate click position relative to the viewport for the circular mask transition
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
        // Quick refresh after editor closes
        setLoading(true);
        window.location.reload(); 
    };

    if (authLoading || loading) {
        return (
            <div className={`min-h-screen relative overflow-hidden ${COLORS.bgLight}`}>
                
                <Navigation />
                <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl`}
                    >
                        <Loader2 className={`animate-spin w-12 h-12 border-4 ${COLORS.primary} rounded-full`} />
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`min-h-screen relative overflow-hidden ${COLORS.bgLight}`}>
                
                {/* Background (Simplified to use standard Tailwind classes for a consistent subtle gradient) */}
                <div 
                    className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-100 via-white to-teal-100"
                />
                
                <Navigation />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
                    {/* Minimal Header (Using standard font classes) */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 pt-8 text-center"
                    >
                        <h1 className={`text-5xl md:text-6xl font-serif font-light ${COLORS.textDark} mb-3 tracking-tight`}>
                            Reflections
                        </h1>
                        <p className={`text-lg ${COLORS.subtleText} font-light`}>Your sanctuary of thoughts</p>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-red-50 backdrop-blur-md border border-red-200 text-red-800 px-6 py-4 rounded-xl font-sans"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Masonry Grid of Floating Glass Cards */}
                    {entries.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`max-w-2xl mx-auto ${COLORS.cardBg} backdrop-blur-md rounded-2xl p-12 text-center border border-gray-100 shadow-xl`}
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className={`w-10 h-10 ${COLORS.primary} `} strokeWidth={1.5} />
                            </div>
                            <h3 className={`text-2xl font-serif font-light ${COLORS.textDark} mb-3`}>
                                Begin Your Journey
                            </h3>
                            <p className={`text-lg ${COLORS.subtleText} font-light`}>
                                Your first reflection awaits
                            </p>
                        </motion.div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {entries.map((entry, index) => (
                                <FloatingGlassCard
                                    key={entry.id}
                                    entry={entry}
                                    index={index}
                                    formatDate={formatDate}
                                    getMoodEmoji={getMoodEmoji}
                                    truncateContent={truncateContent}
                                    toggleFavorite={toggleFavorite}
                                    openEditor={openEditor}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Floating Orb - New Entry Button */}
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => openEditor(null, e)}
                    className={`fixed bottom-8 right-8 w-16 h-16 sm:w-20 sm:h-20 ${COLORS.primaryBg} backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center z-50 border border-white/80 group`}
                    style={{
                        boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)',
                        animation: 'pulse-gentle 3s ease-in-out infinite',
                    }}
                >
                    <Feather 
                        className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:text-gray-100 transition-colors" 
                        strokeWidth={2}
                    />
                </motion.button>
            </div>

            {/* Journal Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <JournalEditor
                        entryId={selectedEntry?.id}
                        initialData={selectedEntry}
                        onClose={closeEditor}
                        clickPosition={clickPosition}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// Floating Glass Card Component with 3D Tilt Effect (Standardized)
function FloatingGlassCard({ entry, index, formatDate, getMoodEmoji, truncateContent, toggleFavorite, openEditor }) {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const rotateX = useTransform(y, [-100, 100], [5, -5]);
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);

    const handleMouseMove = (event) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    };

    const date = formatDate(entry.createdAt);

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
            }}
            whileHover={{ scale: 1.02 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="break-inside-avoid mb-6 cursor-pointer group"
            onClick={(e) => openEditor(entry, e)}
        >
            <div className={`
                relative ${COLORS.cardBgLight} backdrop-blur-md rounded-3xl p-8 
                ${COLORS.cardBorder} border 
                transition-all duration-300
                ${isHovered ? 'shadow-2xl shadow-emerald-300/50' : 'shadow-lg shadow-gray-200'}
            `}>
                {/* Inner Glow on Hover */}
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none"
                    />
                )}

                {/* Date Badge */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col items-center bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/80">
                        <span className="text-xs font-medium text-gray-500 tracking-widest">{date.month}</span>
                        <span className={`text-3xl font-serif font-light ${COLORS.textDark} leading-none`}>{date.day}</span>
                        <span className="text-xs font-medium text-gray-500">{date.year}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {entry.moodScore && (
                            <span className="text-2xl">{getMoodEmoji(entry.moodScore)}</span>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(entry.id, entry.isFavorite);
                            }}
                            className="p-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all border border-white/80"
                        >
                            <Heart 
                                className={`w-5 h-5 transition-all ${
                                    entry.isFavorite 
                                        ? 'fill-red-500 text-red-500' 
                                        : 'text-gray-500/80 hover:text-red-400'
                                }`}
                                strokeWidth={1.5}
                            />
                        </button>
                    </div>
                </div>

                {/* Title */}
                <h3 className={`text-2xl md:text-3xl font-serif font-light ${COLORS.textDark} mb-4 leading-tight line-clamp-2`}>
                    {entry.title}
                </h3>

                {/* Content Preview */}
                <p className={`text-gray-600/90 font-light text-base leading-relaxed mb-6 line-clamp-4`}>
                    {truncateContent(entry.content)}
                </p>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {entry.tags.slice(0, 3).map(tag => (
                            <span 
                                key={tag}
                                className={`px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100`}
                            >
                                {tag}
                            </span>
                        ))}
                        {entry.tags.length > 3 && (
                            <span className={`px-3 py-1 bg-white/50 backdrop-blur-sm text-gray-600/80 text-xs font-light rounded-full border border-white/80`}>
                                +{entry.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}