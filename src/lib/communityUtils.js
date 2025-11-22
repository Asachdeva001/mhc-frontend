// --- Community Page Utilities & Helpers ---

// Blocked words and supportive handling (Client-side validation for UX)
export const BLOCKED_WORDS = ["suicide", "kill", "self-harm", "sex"];
export const SENSITIVE_WORDS = ["suicide", "kill", "self-harm"];

// Topics for post categorization
export const TOPICS = ["Vent", "Success", "Advice", "Anxiety", "Reflection", "General"];

/**
 * Checks if text contains blocked words
 */
export const containsBlockedWord = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return BLOCKED_WORDS.some(w => lower.includes(w));
};

/**
 * Checks if text contains sensitive words (subset of blocked words)
 */
export const containsSensitiveWord = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return SENSITIVE_WORDS.some(w => lower.includes(w));
};

/**
 * Renders content with styled hashtags (teal color)
 */
export const renderContentWithTags = (text) => {
    const parts = text.split(/(#[\w-]+)/g);
    return parts.map((part, idx) => {
        if (part?.startsWith('#')) {
            return (
                <span key={idx} className="inline-block text-teal-700 font-semibold rounded-md text-sm">
                    {part}
                </span>
            );
        }
        return <span key={idx}>{part}</span>;
    });
};

/**
 * Extracts hashtags from content text
 */
export const extractHashtags = (content) => {
    const matches = content.match(/#[\w-]+/g) || [];
    return matches.map(tag => tag.toLowerCase());
};

/**
 * Filters posts based on search query and active filters (tags, topics)
 */
export const filterPosts = (allPosts, query, filters) => {
    return allPosts.filter(post => {
        const queryLower = query.toLowerCase();
        const contentMatch = post.content.toLowerCase().includes(queryLower);
        const tagsInContent = extractHashtags(post.content);
        const tagMatch = filters.tags.length === 0 || filters.tags.some(tag => tagsInContent.includes(tag.toLowerCase()));
        const topicMatch = filters.topics.length === 0 || filters.topics.includes(post.tag);

        return contentMatch && tagMatch && topicMatch;
    });
};

/**
 * Gets avatar initials for non-anonymous users
 */
export const getAvatarInitials = (authorName, isAnonymous) => {
    if (isAnonymous || !authorName) return null;
    return authorName.split(' ').map(n => n[0]).join('');
};

/**
 * Gets first initial for avatar
 */
export const getInitial = (authorName) => {
    if (!authorName || authorName === 'Anonymous') return null;
    return authorName.split(' ')[0][0];
};
