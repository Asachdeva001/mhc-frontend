'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Loader2 } from 'lucide-react';
import axios from 'axios';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../lib/authContext';
import { CreatePostCard } from '../../components/CreatePostCard';
import { PostCard } from '../../components/PostCard';
import { SearchSidebar } from '../../components/SearchSidebar';
import {
    containsBlockedWord,
    containsSensitiveWord,
    filterPosts,
    TOPICS
} from '../../lib/communityUtils';

// Setup axios instance
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const DEBUG_API = process.env.NEXT_PUBLIC_DEBUG_API === 'true';

const api = axios.create({
    baseURL: API_BASE || undefined,
    timeout: 10000,
});

// Mask authorization token when logging
const maskAuth = (auth) => {
    if (!auth) return 'no-auth';
    try { return auth.slice(0, 20) + '...'; } catch { return 'auth'; }
};

api.interceptors.request.use((req) => {
    if (DEBUG_API) {
        console.debug('[API REQUEST]', req.method?.toUpperCase(), req.baseURL ? req.baseURL + req.url : req.url, maskAuth(req.headers?.Authorization));
    }
    return req;
}, (err) => {
    if (DEBUG_API) console.error('[API REQUEST ERROR]', err);
    return Promise.reject(err);
});

api.interceptors.response.use((res) => {
    if (DEBUG_API) console.debug('[API RESPONSE]', res.status, res.config?.url, res.data);
    return res;
}, (err) => {
    if (DEBUG_API) console.error('[API RESPONSE ERROR]', err.response?.status, err.config?.url, err.response?.data || err.message);
    return Promise.reject(err);
});

/**
 * CommunityPage Component
 * Main page for the community hub with posts, comments, pagination, and search
 */
export default function CommunityPage() {
    const { user, getToken, loading: authLoading } = useAuth();
    
    // Post and feed state
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState("General");
    
    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFilters, setSearchFilters] = useState({ tags: [], topics: [] });
    
    // UI state
    const [inlineError, setInlineError] = useState("");
    const [viewMode, setViewMode] = useState('feed'); // 'feed' or 'myPosts'
    const [pageLoading, setPageLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [popup, setPopup] = useState({ show: false, title: '', message: '', type: 'info' });
    
    // Debug state
    const [apiDebug, setApiDebug] = useState({
        base: API_BASE || (typeof window !== 'undefined' ? window.location.origin : ''),
        lastUrl: null,
        lastStatus: null,
        lastError: null
    });
    
    const POSTS_PER_PAGE = 10;

    /**
     * Fetch posts from server with pagination
     */
    const fetchPosts = useCallback(async (pageNum = 1) => {
        setPageLoading(true);
        try {
            const token = getToken();
            if (!token) {
                setInlineError("Please sign in to view the community feed.");
                setPosts([]);
                return;
            }

            const offset = (pageNum - 1) * POSTS_PER_PAGE;
            const response = await api.get('/api/posts', {
                params: {
                    limit: POSTS_PER_PAGE,
                    offset: offset,
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const fetchedPosts = response.data || [];
            console.log(`Fetched ${fetchedPosts.length} posts for page ${pageNum}`);
            
            setPosts(fetchedPosts);
            setCurrentPage(pageNum);
            
            // Calculate total pages based on results returned
            const hasMore = fetchedPosts.length === POSTS_PER_PAGE;
            const estimatedTotal = hasMore ? Math.ceil((offset + POSTS_PER_PAGE + 1) / POSTS_PER_PAGE) : pageNum;
            setTotalPages(Math.max(pageNum, estimatedTotal));
            setTotalPosts(offset + fetchedPosts.length);

            setApiDebug((d) => ({ ...d, lastUrl: response.config?.url || '/api/posts', lastStatus: response.status, lastError: null }));
            setInlineError("");

        } catch (err) {
            console.error('Error fetching posts:', err);
            const status = err.response?.status;
            const url = err.config?.url || '/api/posts';
            setApiDebug((d) => ({ ...d, lastUrl: url, lastStatus: status || null, lastError: err.response?.data || err.message }));

            let errorMessage = err.response?.data?.error || 'Could not load community posts. Please try again.';
            if (status === 404) {
                errorMessage = `API returned 404 for ${url}. Ensure your backend is running and/or set NEXT_PUBLIC_API_URL to your backend address (e.g. http://localhost:5000).`;
            }
            setInlineError(errorMessage);
        } finally {
            setPageLoading(false);
        }
    }, [getToken, POSTS_PER_PAGE]);

    // Fetch posts when auth is ready
    useEffect(() => {
        if (!authLoading) {
            fetchPosts(1);
        }
    }, [authLoading, fetchPosts]);

    /**
     * Handle post submission
     */
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        setInlineError("");
        const postContent = newPost.trim();
        if (!postContent) return;

        // Client-side validation
        if (containsBlockedWord(postContent)) {
            setInlineError(containsSensitiveWord(postContent)
                ? "We care about your safety. If you're in distress, please contact emergency services."
                : "Your message contains words that are not allowed.");
            return;
        }

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not available.');

            const payload = {
                content: postContent,
                isAnonymous,
                tag: selectedTopic,
            };

            const response = await api.post('/api/posts', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const { post } = response.data;
            setApiDebug((d) => ({ ...d, lastUrl: response.config?.url, lastStatus: response.status, lastError: null }));

            setPosts(prev => [post, ...prev]);
            setNewPost("");
            setSelectedTopic("General");
            setIsAnonymous(false);
        } catch (error) {
            console.error("Post creation error:", error);
            const status = error.response?.status;
            const url = error.config?.url || '/api/posts';
            const errorData = error.response?.data;
            setApiDebug((d) => ({ ...d, lastUrl: url, lastStatus: status || null, lastError: errorData || error.message }));
            
            // Handle AI moderation errors specifically
            if (status === 400 && errorData?.error === 'Content not allowed') {
                const moderationMessage = `Your post does not follow our community guidelines.\n\nPlease try writing something else that is respectful and supportive.`;
                const detailedReason = errorData.reason ? `\n\nReason: ${errorData.reason}` : '';
                
                setInlineError(`⚠️ ${moderationMessage}`);
                setPopup({ 
                    show: true, 
                    title: '⚠️ Community Guidelines', 
                    message: `${moderationMessage}${detailedReason}\n\nRemember: This is a safe space for mental health support. Let's keep it kind and supportive! 💚`,
                    type: 'error' 
                });
            } else {
                const errorMessage = status === 404
                    ? `Post endpoint not found (404). Check NEXT_PUBLIC_API_URL and that your backend is running.`
                    : (errorData?.message || errorData?.error || "Could not create post. Try again.");
                setInlineError(errorMessage);
            }
        }
    };

    /**
     * Handle post like
     */
    const handleLike = async (id) => {
        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not available.');

            const response = await api.post(`/api/posts/${id}/like`, null, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setApiDebug((d) => ({ ...d, lastUrl: response.config?.url, lastStatus: response.status, lastError: null }));

            // Re-fetch posts to get updated likes
            fetchPosts();

        } catch (err) {
            console.error(err);
            setApiDebug((d) => ({ ...d, lastUrl: err.config?.url || `/api/posts/${id}/like`, lastStatus: err.response?.status || null, lastError: err.response?.data || err.message }));
        }
    };

    /**
     * Handle adding reply/comment
     */
    const handleAddReply = async (postId, parentCommentId, replyText, anonymous = false, setLocalError) => {
        if (!replyText || !replyText.trim()) return;
        const text = replyText.trim();

        if (containsBlockedWord(text)) {
            setLocalError && setLocalError("Reply contains restricted words.");
            return;
        }

        const payload = {
            parentCommentId: parentCommentId || null,
            replyText: text,
            anonymous,
        };

        try {
            const token = getToken();
            if (!token) throw new Error('Authentication token not available.');

            const response = await api.post(`/api/posts/${postId}/comment`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const { updatedPost } = response.data;
            setApiDebug((d) => ({ ...d, lastUrl: response.config?.url, lastStatus: response.status, lastError: null }));

            // Update post with server response
            setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
            setLocalError && setLocalError("");
        } catch (err) {
            console.error('Comment/Reply error:', err);
            const errorData = err.response?.data;
            setApiDebug((d) => ({ ...d, lastUrl: err.config?.url || `/api/posts/${postId}/comment`, lastStatus: err.response?.status || null, lastError: errorData || err.message }));
            
            // Handle AI moderation errors specifically for comments
            if (err.response?.status === 400 && errorData?.error === 'Content not allowed') {
                const message = 'Your comment does not follow our community guidelines. Please try writing something else that is respectful and supportive.';
                setLocalError && setLocalError(`⚠️ ${message}`);
                setPopup && setPopup({ 
                    show: true, 
                    title: '⚠️ Community Guidelines', 
                    message: `${message}\n\nRemember: This is a safe space for mental health support. Let's keep it kind and supportive! 💚`,
                    type: 'error' 
                });
            } else {
                const errorMessage = errorData?.message || errorData?.error || "Could not post reply. Try again.";
                setLocalError && setLocalError(errorMessage);
            }
        }
    };

    /**
     * Handle topic filter change
     */
    const handleTopicFilterChange = (topic) => {
        setSearchFilters(prev => ({
            ...prev,
            topics: prev.topics.includes(topic)
                ? prev.topics.filter(t => t !== topic)
                : [...prev.topics, topic]
        }));
    };

    // Styles
    const backgroundAnimationStyles = `
    @keyframes floating-gradient {
     0% { background-position: 0% 50%; }
     50% { background-position: 100% 50%; }
     100% { background-position: 0% 50%; }
    }
    .animate-living-gradient {
      background: linear-gradient(-45deg, #f0fdfa, #ecfdf5, #e0f2fe, #f8fafc);
      background-size: 400% 400%;
      animation: floating-gradient 15s ease infinite;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;

    const cardClass = "bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60";

    return (
        <div className="min-h-screen animate-living-gradient text-slate-800">
            <style jsx global>{backgroundAnimationStyles}</style>

            <Navigation currentPage="community" />

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
            >
                <header className="mb-8 text-center sm:text-left relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 flex items-center gap-3 justify-center sm:justify-start">
                        Community Hub <Coffee className="text-teal-500 h-8 w-8 hidden sm:block" />
                    </h1>
                    <p className="text-slate-600 italic mt-2 max-w-2xl text-lg leading-relaxed">
                        Pull up a chair. A safe, refreshing space to share your journey.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                    <div className="space-y-8 lg:col-span-2">

                        {/* View Mode Tabs */}
                        {user && (
                            <div className="flex gap-3 mb-4">
                                <button
                                    onClick={() => setViewMode('feed')}
                                    className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${viewMode === 'feed'
                                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                                        : 'bg-white/60 text-slate-600 hover:bg-white border border-slate-200'
                                        }`}
                                >
                                    Community Feed
                                </button>
                                <button
                                    onClick={() => setViewMode('myPosts')}
                                    className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${viewMode === 'myPosts'
                                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                                        : 'bg-white/60 text-slate-600 hover:bg-white border border-slate-200'
                                        }`}
                                >
                                    My Posts ({posts.filter(p => p.userId === user.uid).length})
                                </button>
                            </div>
                        )}

                        {/* Create Post */}
                        {viewMode === 'feed' && (
                            <CreatePostCard
                                user={user}
                                newPost={newPost}
                                onPostChange={setNewPost}
                                isAnonymous={isAnonymous}
                                onAnonymousChange={setIsAnonymous}
                                selectedTopic={selectedTopic}
                                onTopicChange={setSelectedTopic}
                                onSubmit={handlePostSubmit}
                                inlineError={inlineError}
                                cardClass={cardClass}
                            />
                        )}

                        {/* Feed / My Posts */}
                        <div className="space-y-6">
                            <AnimatePresence>
                                {pageLoading && (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader2 className="animate-spin text-teal-500 h-6 w-6 mr-2" />
                                        <span className="text-slate-500">Loading posts…</span>
                                    </div>
                                )}
                                {!pageLoading && viewMode === 'feed' && posts.length === 0 && <div className="text-slate-500 py-6">No posts yet. Be the first to share 💬</div>}
                                {!pageLoading && viewMode === 'myPosts' && posts.filter(p => p.userId === user?.uid).length === 0 && <div className="text-slate-500 py-6">You haven&apos;t posted yet. Share your thoughts! 💭</div>}
                                {filterPosts(
                                    (viewMode === 'feed' ? posts : posts.filter(p => p.userId === user?.uid)),
                                    searchQuery,
                                    searchFilters
                                ).map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onLike={handleLike}
                                        onAddReply={handleAddReply}
                                        onDeletePost={(postId) => setPosts(posts.filter(p => p.id !== postId))}
                                        user={user}
                                        getToken={getToken}
                                        setPopup={setPopup}
                                    />
                                ))}
                            </AnimatePresence>

                            {/* Pagination Controls */}
                            {!pageLoading && posts.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center gap-4 pt-6"
                                >
                                    {/* Page Info */}
                                    <div className="text-sm text-slate-600 font-medium">
                                        Page <span className="text-teal-600 font-bold">{currentPage}</span> of <span className="text-teal-600 font-bold">{totalPages}</span>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex gap-2 items-center">
                                        <button
                                            onClick={() => fetchPosts(1)}
                                            disabled={currentPage === 1 || pageLoading}
                                            className="px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
                                            title="First page"
                                        >
                                            ⟨⟨
                                        </button>
                                        <button
                                            onClick={() => fetchPosts(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1 || pageLoading}
                                            className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
                                            title="Previous page"
                                        >
                                            ← Prev
                                        </button>

                                        {/* Page Number Display */}
                                        <div className="flex gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => fetchPosts(pageNum)}
                                                        disabled={pageLoading}
                                                        className={`px-3 py-2 rounded-full font-medium text-sm transition ${
                                                            currentPage === pageNum
                                                                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => fetchPosts(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage >= totalPages || pageLoading}
                                            className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
                                            title="Next page"
                                        >
                                            Next →
                                        </button>
                                        <button
                                            onClick={() => fetchPosts(totalPages)}
                                            disabled={currentPage === totalPages || pageLoading}
                                            className="px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
                                            title="Last page"
                                        >
                                            ⟩⟩
                                        </button>
                                    </div>

                                    {pageLoading && (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin h-4 w-4 text-teal-500" />
                                            <span className="text-sm text-slate-500">Loading page {currentPage}...</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <SearchSidebar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchFilters={searchFilters}
                        onTopicFilterChange={handleTopicFilterChange}
                        user={user}
                        userPostCount={posts.filter(p => p.userId === user?.uid).length}
                        onViewMyPosts={() => setViewMode('myPosts')}
                        apiDebug={apiDebug}
                        DEBUG_API={DEBUG_API}
                        cardClass={cardClass}
                    />
                </div>
            </motion.main>

            {/* Custom Popup */}
            <AnimatePresence>
                {popup.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setPopup({ ...popup, show: false })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border-l-4 ${popup.type === 'error' ? 'border-l-red-500' :
                                popup.type === 'success' ? 'border-l-teal-500' :
                                    popup.type === 'warning' ? 'border-l-amber-500' :
                                        'border-l-blue-500'
                                }`}
                        >
                            <h2 className="text-lg font-bold text-slate-800 mb-2">{popup.title}</h2>
                            <p className="text-slate-600 text-sm mb-6">{popup.message}</p>
                            <button
                                onClick={() => setPopup({ ...popup, show: false })}
                                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-2.5 rounded-full transition active:scale-95"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
