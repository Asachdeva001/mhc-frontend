'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Ghost, User, ArrowLeft, Loader2, Send } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import { useAuth } from '../../../lib/authContext';
import axios from 'axios';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const DEBUG_API = process.env.NEXT_PUBLIC_DEBUG_API === 'true';

const api = axios.create({
    baseURL: API_BASE || undefined,
    timeout: 10000,
});

api.interceptors.request.use((req) => {
    if (DEBUG_API) console.debug('[API REQUEST]', req.method?.toUpperCase(), req.url);
    return req;
}, (err) => Promise.reject(err));

api.interceptors.response.use((res) => {
    if (DEBUG_API) console.debug('[API RESPONSE]', res.status, res.data);
    return res;
}, (err) => Promise.reject(err));

const renderContentWithTags = (text) => {
    const parts = text.split(/(#[\w-]+)/g);
    return parts.map((part, idx) => {
        if (part?.startsWith('#')) {
            return (
                <span key={idx} className="inline-block text-teal-700 font-semibold">
                    {part}
                </span>
            );
        }
        return <span key={idx}>{part}</span>;
    });
};

export default function PostDetailPage({ params }) {
    const { user, getToken, loading: authLoading } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [popup, setPopup] = useState({ show: false, title: '', message: '', type: 'info' });
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [activeReplyTo, setActiveReplyTo] = useState(null); // Track which comment is being replied to
    const [replyingText, setReplyingText] = useState(""); // Text for replying to comments

    useEffect(() => {
        if (!authLoading) {
            fetchPost();
        }
    }, [authLoading, params.id]);

    const fetchPost = async () => {
        try {
            const token = getToken();
            if (!token) {
                setError("Please sign in to view posts.");
                return;
            }

            const response = await api.get(`/api/posts/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setPost(response.data);
            setError("");
        } catch (err) {
            console.error('Error fetching post:', err);
            setError(err.response?.data?.error || "Could not load post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user || !post) return;
        try {
            const token = getToken();
            await api.post(`/api/posts/${post.id}/like`, null, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await fetchPost();
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const handleAddComment = async (isAnonymous = false) => {
        if (!replyText.trim()) return;
        
        setIsSubmittingReply(true);
        try {
            const token = getToken();
            const response = await api.post(`/api/posts/${post.id}/comment`, {
                parentCommentId: null,
                replyText: replyText.trim(),
                anonymous: isAnonymous,
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            setPost(response.data.updatedPost);
            setReplyText("");
            setPopup({ show: true, title: 'Success!', message: 'Comment posted.', type: 'success' });
        } catch (err) {
            console.error('Error adding comment:', err);
            setPopup({ show: true, title: 'Failed', message: err.response?.data?.error || 'Could not post comment.', type: 'error' });
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleReplyToComment = async (commentId, isAnonymous = false) => {
        if (!replyingText.trim()) return;
        
        setIsSubmittingReply(true);
        try {
            const token = getToken();
            const response = await api.post(`/api/posts/${post.id}/comment`, {
                parentCommentId: commentId,
                replyText: replyingText.trim(),
                anonymous: isAnonymous,
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            setPost(response.data.updatedPost);
            setReplyingText("");
            setActiveReplyTo(null);
            setPopup({ show: true, title: 'Success!', message: 'Reply posted.', type: 'success' });
        } catch (err) {
            console.error('Error adding reply:', err);
            setPopup({ show: true, title: 'Failed', message: err.response?.data?.error || 'Could not post reply.', type: 'error' });
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleShare = () => {
        const shareText = `Check out this post: "${post.content.substring(0, 100)}..." #CommunityHub\n\n${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Community Post',
                text: shareText,
            }).catch(err => console.log('Share failed:', err));
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                setPopup({ show: true, title: 'Copied!', message: 'Post link copied to clipboard.', type: 'success' });
            }).catch(() => {
                setPopup({ show: true, title: 'Share Failed', message: 'Could not copy to clipboard.', type: 'error' });
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navigation currentPage="community" />
                <div className="flex justify-center items-center min-h-screen">
                    <Loader2 className="animate-spin text-teal-500 h-8 w-8" />
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navigation currentPage="community" />
                <div className="max-w-2xl mx-auto p-6">
                    <Link href="/community" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
                        <ArrowLeft size={18} /> Back to Community
                    </Link>
                    <div className="bg-white rounded-3xl p-8 text-center">
                        <p className="text-red-600 text-lg">{error || "Post not found"}</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentUserLiked = user && post.likes && Array.isArray(post.likes) && post.likes.includes(user.uid);

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-sky-50">
            <Navigation currentPage="community" />
            
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pt-20"
            >
                <Link href="/community" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 font-semibold">
                    <ArrowLeft size={18} /> Back to Community
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200/60"
                >
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                                post.isAnonymous ? "bg-slate-200 text-slate-400" : "bg-gradient-to-br from-teal-400 to-emerald-400 text-white"
                            }`}>
                                {post.isAnonymous ? <Ghost size={24} /> : post.avatar}
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-800 text-lg">{post.author}</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                    <span>{new Date(post.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="text-teal-400">•</span>
                                    <span className="bg-teal-50 px-2.5 py-0.5 rounded-md text-teal-700 border border-teal-100/50 font-medium">{post.tag}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <p className="text-slate-700 leading-relaxed mb-6 text-base">
                        {renderContentWithTags(post.content)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-6 border-t border-slate-100 pt-4 mb-6">
                        <button
                            onClick={handleLike}
                            disabled={!user || currentUserLiked}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                                currentUserLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                            }`}
                        >
                            <Heart size={20} className={currentUserLiked ? "fill-current drop-shadow-sm" : ""} />
                            <span>{(Array.isArray(post.likes) ? post.likes.length : 0)} Warmth</span>
                        </button>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                            <MessageCircle size={20} />
                            <span>{(post.comments?.length || 0)} Replies</span>
                        </div>
                        <button
                            onClick={handleShare}
                            className="ml-auto flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors duration-300"
                            title="Share post"
                        >
                            <Share2 size={18} /> <span className="hidden sm:inline">Share</span>
                        </button>
                    </div>

                    {/* Comment Input */}
                    {user && (
                        <div className="border-t border-slate-100 pt-6 mb-6">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Send some support..."
                                rows={2}
                                className="w-full bg-white/90 text-slate-700 rounded-2xl p-3 border border-slate-200 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition resize-none mb-3 text-sm"
                            />
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleAddComment(false)}
                                    disabled={!replyText.trim() || isSubmittingReply}
                                    className="px-4 py-1.5 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-medium text-sm transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmittingReply ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={16} />}
                                    Comment
                                </button>
                                <button 
                                    onClick={() => handleAddComment(true)}
                                    disabled={!replyText.trim() || isSubmittingReply}
                                    className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmittingReply ? <Loader2 className="animate-spin h-4 w-4" /> : <Ghost size={16} />}
                                    Anonymously
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    {post.comments && post.comments.length > 0 && (
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="font-semibold text-slate-800 mb-4">{post.comments.length} Comments</h3>
                            <div className="space-y-4">
                                {post.comments.map(comment => (
                                    <div key={comment.id} className="bg-slate-50 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                                                comment.isAnonymous ? "bg-slate-200 text-slate-400" : "bg-teal-200 text-teal-700"
                                            }`}>
                                                {comment.isAnonymous ? <Ghost size={12} /> : comment.author?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-semibold text-slate-700">{comment.author}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(comment.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3">{comment.content}</p>

                                        {/* Reply Button */}
                                        {user && (
                                            <button
                                                onClick={() => setActiveReplyTo(activeReplyTo === comment.id ? null : comment.id)}
                                                className="text-xs font-medium text-teal-600 hover:text-teal-700 mb-3"
                                            >
                                                {activeReplyTo === comment.id ? 'Cancel' : 'Reply'}
                                            </button>
                                        )}

                                        {/* Reply Input */}
                                        {activeReplyTo === comment.id && user && (
                                            <div className="mb-3 bg-white rounded-xl p-3 border border-teal-100">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={replyingText}
                                                    onChange={(e) => setReplyingText(e.target.value)}
                                                    placeholder={`Reply to ${comment.author}...`}
                                                    className="w-full bg-transparent border-0 outline-none text-sm text-slate-700 placeholder-slate-400 mb-2"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReplyToComment(comment.id, false)}
                                                        disabled={!replyingText.trim() || isSubmittingReply}
                                                        className="px-3 py-1 rounded-full bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {isSubmittingReply ? <Loader2 className="animate-spin h-3 w-3" /> : <Send size={12} />}
                                                        Reply
                                                    </button>
                                                    <button
                                                        onClick={() => handleReplyToComment(comment.id, true)}
                                                        disabled={!replyingText.trim() || isSubmittingReply}
                                                        className="px-3 py-1 rounded-full bg-slate-300 hover:bg-slate-400 text-white text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {isSubmittingReply ? <Loader2 className="animate-spin h-3 w-3" /> : <Ghost size={12} />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Nested Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="ml-4 space-y-2 border-l-2 border-slate-200 pl-3 mt-3">
                                                {comment.replies.map(reply => (
                                                    <div key={reply.id}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold ${
                                                                reply.isAnonymous ? "bg-slate-200 text-slate-400" : "bg-teal-200 text-teal-700"
                                                            }`}>
                                                                {reply.isAnonymous ? <Ghost size={10} /> : reply.author?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-700">{reply.author}</span>
                                                            <span className="text-[10px] text-slate-400">{new Date(reply.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 mt-1">{reply.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!user && (
                        <div className="border-t border-slate-100 pt-6 text-center">
                            <p className="text-sm text-slate-500">Sign in to leave a comment</p>
                        </div>
                    )}
                </motion.div>
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
                            className={`bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border-l-4 ${
                                popup.type === 'error' ? 'border-l-red-500' :
                                popup.type === 'success' ? 'border-l-teal-500' :
                                'border-l-blue-500'
                            }`}
                        >
                            <h2 className="text-lg font-bold text-slate-800 mb-2">{popup.title}</h2>
                            <p className="text-slate-600 text-sm mb-6">{popup.message}</p>
                            <button
                                onClick={() => setPopup({ ...popup, show: false })}
                                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-2.5 rounded-full transition"
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
