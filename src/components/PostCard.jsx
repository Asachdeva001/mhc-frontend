'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Share2, Shield, Ghost, User, MoreHorizontal } from 'lucide-react';
import axios from 'axios';
import { renderContentWithTags, getAvatarInitials } from '../lib/communityUtils';
import { CommentItem } from './CommentItem';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
    baseURL: API_BASE || undefined,
    timeout: 10000,
});

/**
 * PostCard Component
 * Displays a single post with likes, replies, comments, and share functionality
 */
export const PostCard = ({ post, onLike, onAddReply, onDeletePost, user, getToken, setPopup }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [localError, setLocalError] = useState("");
    const [expandedReplies, setExpandedReplies] = useState(false);
    const router = useRouter();
    const [comments, setComments] = useState(post.comments || []);

    useEffect(() => {
        setComments(post.comments || []);
    }, [post.comments]);

    const currentUserLiked = user && post.likes && Array.isArray(post.likes) && post.likes.includes(user.uid);
    const isPostOwner = user && post.userId === user.uid;

    const handleDeletePost = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            await api.delete(`/api/posts/${post.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            onDeletePost(post.id);
            setPopup({ show: true, title: 'Success', message: 'Post deleted successfully.', type: 'success' });
        } catch (err) {
            console.error('Error deleting post:', err);
            setPopup({ show: true, title: 'Delete Failed', message: 'Could not delete post. Please try again.', type: 'error' });
        }
    };

    const handleLikeClick = () => {
        if (!user) {
            setPopup({ show: true, title: 'Sign In Required', message: 'Please sign in to like posts.', type: 'info' });
            return;
        }
        if (!currentUserLiked) {
            onLike(post.id);
        }
    };

    const submitComment = async (anonymous = false) => {
        if (!user) {
            setLocalError("You must be signed in to reply.");
            return;
        }
        setLocalError("");
        if (!replyText.trim()) return;

        const commentText = replyText.trim();

        const optimisticComment = {
            id: `temp-${Date.now()}`,
            content: commentText,
            author: anonymous ? 'Anonymous' : user.name || 'User',
            isAnonymous: anonymous,
            userId: user.uid,
            timestamp: new Date().toISOString(),
            replies: [],
        };

        setComments([...comments, optimisticComment]);
        setReplyText("");
        setShowReplyBox(false);
        setExpandedReplies(true);

        onAddReply(post.id, null, commentText, anonymous, setLocalError);
    };

    const handleDeleteComment = (commentId) => {
        setComments(comments.filter(c => c.id !== commentId));
    };

    const handleDeleteReply = (replyId) => {
        // Handled by CommentItem
    };

    const handleSharePost = () => {
        router.push(`/community/${post.id}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.05)] transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${post.isAnonymous ? "bg-slate-200 text-slate-400" : "bg-gradient-to-br from-teal-400 to-emerald-400 text-white"
                        }`}>
                        {post.isAnonymous ? <Ghost size={22} /> : (post.avatar || getAvatarInitials(post.author, post.isAnonymous))}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 text-base">{post.author}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                            <span>{new Date(post.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-teal-400">•</span>
                            <span className="bg-teal-50 px-2.5 py-0.5 rounded-md text-teal-700 border border-teal-100/50">{post.tag}</span>
                        </div>
                    </div>
                </div>
                {isPostOwner && (
                    <button onClick={handleDeletePost} className="text-slate-300 hover:text-red-500 transition bg-white p-1 rounded-full" title="Delete post">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                )}
            </div>

            <p className="text-slate-700 leading-relaxed mb-5 text-[15px]">
                {renderContentWithTags(post.content)}
            </p>

            <div className="flex items-center gap-6 border-t border-slate-100/50 pt-4">
                <button onClick={handleLikeClick} className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${currentUserLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`} disabled={!user || currentUserLiked}>
                    <Heart size={20} className={currentUserLiked ? "fill-current drop-shadow-sm" : ""} /> <span>{(Array.isArray(post.likes) ? post.likes.length : 0)} Warmth</span>
                </button>
                <button onClick={() => setShowReplyBox(!showReplyBox)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors duration-300" disabled={!user}>
                    <MessageCircle size={20} /> <span>{comments?.length || 0} Replies</span>
                </button>
                <button onClick={handleSharePost} className="ml-auto flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors duration-300" title="Share post">
                    <Share2 size={18} /> <span className="hidden sm:inline">Share</span>
                </button>
            </div>

            {showReplyBox && user && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Send some support..."
                        rows={2}
                        className="w-full bg-white/90 text-slate-700 rounded-2xl p-3 border border-slate-200 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition resize-none mb-2 text-sm"
                    />
                    {localError && <div className="text-red-500 text-sm mb-2">{localError}</div>}
                    <div className="flex gap-2">
                        <button onClick={() => submitComment(false)} className="px-4 py-1.5 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-medium text-sm transition">Reply</button>
                        <button onClick={() => submitComment(true)} className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition">Reply Anonymously</button>
                    </div>
                </div>
            )}
            {!user && showReplyBox && <div className="mt-4 text-sm text-red-500">Sign in to leave a reply.</div>}

            <div className="mt-4">
                {comments && comments.length > 0 && (
                    <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider cursor-pointer hover:text-slate-600" onClick={() => setExpandedReplies(!expandedReplies)}>
                        {expandedReplies ? 'Hide Discussion' : `View ${comments.length} comments`}
                    </div>
                )}
                {expandedReplies && (
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                postId={post.id}
                                onAddReply={onAddReply}
                                user={user}
                                getToken={getToken}
                                onDeleteComment={handleDeleteComment}
                                onDeleteReply={handleDeleteReply}
                                setPopup={setPopup}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
