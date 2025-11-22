'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Ghost, User } from 'lucide-react';
import { TOPICS, containsBlockedWord } from '../lib/communityUtils';

/**
 * CreatePostCard Component
 * Displays the form for creating a new post with topic selection and anonymous toggle
 */
export const CreatePostCard = ({
    user,
    newPost,
    onPostChange,
    isAnonymous,
    onAnonymousChange,
    selectedTopic,
    onTopicChange,
    onSubmit,
    inlineError,
    cardClass
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const postContent = newPost.trim();
        if (!postContent) return;

        // Client-side content validation
        if (containsBlockedWord(postContent)) {
            return; // Error will be handled by parent component
        }

        onSubmit(e);
    };

    return (
        <motion.div layout className={`${cardClass} p-6 sm:p-8 relative overflow-hidden`}>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 relative">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2 text-xl">
                    <MessageCircle className="w-6 h-6 text-teal-500" /> Share thoughts
                </h2>
                {user ? (
                    <button
                        onClick={() => onAnonymousChange(!isAnonymous)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${isAnonymous ? "bg-slate-700 text-teal-50 shadow-slate-800/20" : "bg-white text-slate-600 hover:bg-teal-50 border border-teal-100"
                            }`}
                    >
                        {isAnonymous ? <Ghost size={16} className="text-teal-400" /> : <User size={16} />}
                        {isAnonymous ? "Posting Anonymously" : `Posting as ${user?.name || 'You'}`}
                    </button>
                ) : (
                    <span className="text-red-500 text-sm">Sign in to post.</span>
                )}
            </div>
            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={newPost}
                    onChange={(e) => onPostChange(e.target.value)}
                    placeholder={isAnonymous ? "Share freely, friend..." : "What's on your mind today?"}
                    rows="3"
                    className="w-full bg-white/80 text-slate-700 rounded-2xl p-4 border border-slate-200 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition resize-none mb-6 placeholder:text-slate-400 text-lg"
                    disabled={!user}
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 no-scrollbar">
                        {TOPICS.map(topic => (
                            <button
                                key={topic}
                                type="button"
                                onClick={() => onTopicChange(topic)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition whitespace-nowrap ${selectedTopic === topic ? "bg-teal-100 text-teal-800 border-teal-300 shadow-sm" : "bg-white/60 text-slate-500 border-slate-200 hover:bg-teal-50 hover:border-teal-200"
                                    }`}
                                disabled={!user}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                    <button
                        type="submit"
                        disabled={!newPost.trim() || !user}
                        className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full font-semibold shadow-[0_4px_12px_rgba(20,184,166,0.3)] transition flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Send size={18} /> Post
                    </button>
                </div>
            </form>
            {inlineError && <div className="mt-4 bg-red-50 border border-red-100 text-red-800 p-3 rounded-lg text-sm">{inlineError}</div>}
        </motion.div>
    );
};
