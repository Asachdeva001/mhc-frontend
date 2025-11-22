'use client';

import { motion } from 'framer-motion';
import { Heart, MessageSquare, Search, Shield } from 'lucide-react';
import { TOPICS } from '../lib/communityUtils';

/**
 * SearchSidebar Component
 * Displays search bar, topic filters, active filters, user posts info, guidelines, and API debug panel
 */
export const SearchSidebar = ({
    searchQuery,
    onSearchChange,
    searchFilters,
    onTopicFilterChange,
    user,
    userPostCount,
    onViewMyPosts,
    apiDebug,
    DEBUG_API,
    cardClass
}) => {
    return (
        <div className="space-y-6 lg:sticky lg:top-6 h-fit">
            {/* Search & Topic Filter Card */}
            <div className={cardClass + " p-4"}>
                <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search posts, #tags..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-600 placeholder:text-slate-400 transition"
                    />
                </div>

                <div className="mb-3">
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Filter by Topic:</label>
                    <div className="flex flex-wrap gap-1">
                        {TOPICS.map(topic => (
                            <button
                                key={topic}
                                onClick={() => onTopicFilterChange(topic)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition ${searchFilters.topics.includes(topic)
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Filters Display */}
                {(searchQuery || searchFilters.topics.length > 0) && (
                    <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                        {searchQuery && <div className="mb-1">🔍 Query: <span className="font-semibold">{searchQuery}</span></div>}
                        {searchFilters.topics.length > 0 && <div>📌 Topics: <span className="font-semibold">{searchFilters.topics.join(', ')}</span></div>}
                    </div>
                )}
            </div>

            {/* User Posts Info Card */}
            {user && (
                <div className={cardClass + " p-4"}>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Your Posts</span>
                            <span className="text-lg font-bold text-teal-600">{userPostCount}</span>
                        </div>
                        <button
                            onClick={onViewMyPosts}
                            className="w-full bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 text-teal-700 font-semibold py-2 rounded-full transition border border-teal-200"
                        >
                            View My Posts
                        </button>
                    </div>
                </div>
            )}

            {/* Guidelines Card */}
            <div className="bg-teal-50/60 backdrop-blur-md rounded-3xl border border-teal-200 p-6 shadow-xl w-full">
                <h3 className="font-bold text-slate-800 text-xl mb-4 flex items-center gap-2">
                    <Shield className="text-teal-600 h-6 w-6" /> Community Guidelines
                </h3>

                <div className="text-slate-700 text-base leading-relaxed space-y-4">

                    <div className="flex items-start gap-2">
                        <MessageSquare className="text-teal-500 h-8 w-8" />
                        <div>
                            <strong className="font-semibold">Be Kind & Supportive</strong>
                            <p className='text-justify'>Respect everyone. Share gently, avoid criticism, and use anonymous mode for sensitive topics.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Heart className="text-teal-500 h-8 w-8" />
                        <div>
                            <strong className="font-semibold">Prioritize Safety</strong>
                            <p className='text-justify'>Don’t share personal info. Report any posts about immediate harm or danger.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Shield className="text-teal-500 h-8 w-8" />
                        <div>
                            <strong className="font-semibold">Stay On-Topic</strong>
                            <p className='text-justify'>Keep discussions about mental wellness, self-care, experiences, or the app. No promotions.</p>
                        </div>
                    </div>

                </div>
            </div>


            {/* API Debug Panel */}
            {(DEBUG_API || apiDebug.lastError) && (
                <div className="mt-4 p-4 bg-white/80 border border-slate-200 rounded-2xl text-xs text-slate-700">
                    <div className="font-semibold text-sm mb-1">API Debug</div>
                    <div className="flex items-center gap-2"><span className="font-medium">Base:</span> <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{apiDebug.base}</code></div>
                    <div className="flex items-center gap-2 mt-1"><span className="font-medium">Last URL:</span> <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{apiDebug.lastUrl || '—'}</code></div>
                    <div className="mt-1"><span className="font-medium">Status:</span> {apiDebug.lastStatus ?? '—'}</div>
                    {apiDebug.lastError && (
                        <div className="mt-2 text-[11px] text-red-600 max-h-40 overflow-auto bg-red-50 border border-red-100 p-2 rounded">
                            <pre className="whitespace-pre-wrap">{typeof apiDebug.lastError === 'string' ? apiDebug.lastError : JSON.stringify(apiDebug.lastError, null, 2)}</pre>
                        </div>
                    )}
                    <div className="mt-2 text-slate-500 text-[11px]">Tip: set `NEXT_PUBLIC_API_URL` if your backend runs on a different port.</div>
                </div>
            )}
        </div>
    );
};
