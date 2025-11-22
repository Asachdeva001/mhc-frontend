'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ghost, Send } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
    baseURL: API_BASE || undefined,
    timeout: 10000,
});

/**
 * CommentItem Component
 * Displays a single comment with nested replies and delete functionality
 */
export const CommentItem = ({ comment, postId, onAddReply, user, onDeleteComment, onDeleteReply, setPopup }) => {
    const [showSubReplyInput, setShowSubReplyInput] = useState(false);
    const [subReplyText, setSubReplyText] = useState("");
    const [localError, setLocalError] = useState("");
    const [deletedReplies, setDeletedReplies] = useState([]);
    const [localReplies, setLocalReplies] = useState(comment.replies || []);

    useEffect(() => {
        setLocalReplies(comment.replies || []);
    }, [comment.replies]);

    const isCommentOwner = user && comment.userId === user.uid;

    const initiateReply = () => {
        if (!user) {
            setPopup({ show: true, title: 'Sign In Required', message: 'Please sign in to reply to comments.', type: 'info' });
            return;
        }
        setLocalError("");
        if (showSubReplyInput) {
            setShowSubReplyInput(false);
            setSubReplyText("");
        } else {
            setShowSubReplyInput(true);
        }
    };

    const submitSubReply = async (anonymous = false) => {
        if (!subReplyText.trim()) return;

        const replyText = subReplyText.trim();

        const optimisticReply = {
            id: `temp-${Date.now()}`,
            content: replyText,
            author: anonymous ? 'Anonymous' : user.name || 'User',
            isAnonymous: anonymous,
            userId: user.uid,
            timestamp: new Date().toISOString(),
        };

        setLocalReplies([...localReplies, optimisticReply]);
        setSubReplyText("");
        setShowSubReplyInput(false);

        onAddReply(postId, comment.id, replyText, anonymous, setLocalError);
    };

    const handleDeleteComment = async () => {
        if (!confirm('Delete this comment?')) return;
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No auth token');
            await api.delete(`/api/posts/${postId}/comment/${comment.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            onDeleteComment(comment.id);
        } catch (err) {
            console.error('Error deleting comment:', err);
            setPopup({ show: true, title: 'Delete Failed', message: 'Could not delete comment.', type: 'error' });
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (!confirm('Delete this reply?')) return;

        setDeletedReplies([...deletedReplies, replyId]);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No auth token');
            await api.delete(`/api/posts/${postId}/comment/${comment.id}/reply/${replyId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            onDeleteReply(replyId);
        } catch (err) {
            console.error('Error deleting reply:', err);
            setDeletedReplies(deletedReplies.filter(id => id !== replyId));
            setPopup({ show: true, title: 'Delete Failed', message: 'Could not delete reply.', type: 'error' });
        }
    };

    const getCommenterInitial = (authorName) => {
        if (comment.isAnonymous || !authorName) return null;
        return authorName.split(' ')[0][0];
    };

    const getReplyInitial = (authorName) => {
        if (authorName === 'Anonymous') return null;
        return authorName.split(' ')[0][0];
    };

    return (
        <div className="group">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 font-semibold text-xs">
                    {comment.isAnonymous ? <Ghost size={14} /> : (comment.author ? getCommenterInitial(comment.author) : 'U')}
                </div>
                <div className="flex-1 bg-slate-100/50 border border-slate-200 rounded-2xl p-3 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <span className="font-semibold text-slate-800 text-sm">{comment.author}</span>
                            <span className="text-[10px] text-slate-400 ml-2">{new Date(comment.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {isCommentOwner && (
                            <button onClick={handleDeleteComment} className="text-slate-300 hover:text-red-500 transition text-xs" title="Delete comment">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                    <p className="text-slate-700 text-sm mt-1">{comment.content}</p>
                    {user && (
                        <button onClick={initiateReply} className="text-xs font-medium text-slate-400 hover:text-teal-500 mt-2 transition-colors">Reply</button>
                    )}
                </div>
            </div>

            {showSubReplyInput && user && (
                <div className="ml-11 mt-2 mb-2 animate-in fade-in slide-in-from-top-1">
                    {localError && <div className="text-red-500 text-sm mb-1">{localError}</div>}
                    <div className="flex gap-2">
                        <input
                            autoFocus
                            value={subReplyText}
                            onChange={(e) => setSubReplyText(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm outline-none focus:border-teal-400"
                            placeholder={`Reply to ${comment.author}...`}
                        />
                        <button
                            onClick={() => submitSubReply(false)}
                            className="bg-teal-500 text-white p-1 px-2.5 rounded-full hover:bg-teal-600 transition"
                            title="Reply"
                        >
                            <Send size={14} />
                        </button>
                        <button
                            onClick={() => submitSubReply(true)}
                            className="bg-slate-500 text-white p-1 px-2.5 rounded-full hover:bg-slate-600 transition text-xs"
                            title="Reply Anonymously"
                        >
                            <Ghost size={14} />
                        </button>
                    </div>
                </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 mt-2 space-y-2 border-l-2 border-slate-100 pl-3">
                    {localReplies.filter(reply => !deletedReplies.includes(reply.id)).map(reply => {
                        const isReplyOwner = user && reply.userId === user.uid;
                        return (
                            <div key={reply.id} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                                    {reply.isAnonymous ? <Ghost size={10} /> : (reply.author ? getReplyInitial(reply.author) : 'U')}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-semibold text-slate-700">{reply.author}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(reply.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        {isReplyOwner && (
                                            <button onClick={() => handleDeleteReply(reply.id)} className="text-slate-300 hover:text-red-500 transition" title="Delete reply">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600">{reply.content}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
