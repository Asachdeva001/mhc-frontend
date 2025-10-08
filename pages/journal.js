import React, { useState, useEffect } from 'react';
import api from '../src/lib/api';

const JournalPage = () => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    
    const today = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format

    useEffect(() => {
        const fetchTodaysEntry = async () => {
            try {
                const entry = await api.journal.getEntryByDate(today);
                if (entry && entry.content) {
                    setContent(entry.content);
                }
            } catch (err) {
                // It's okay if an entry for today doesn't exist yet (will result in a 404)
                if (err.message.includes('not found')) {
                    console.log("No journal entry for today yet.");
                } else {
                    setError('Failed to load today\'s entry.');
                    console.error(err);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTodaysEntry();
    }, [today]);

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setStatus('');
        try {
            await api.journal.saveEntry(content, today);
            setStatus('Entry saved successfully!');
            setTimeout(() => setStatus(''), 3000); // Clear status after 3 seconds
        } catch (err) {
            setError('Failed to save entry. Please try again.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const pageTitle = `Journal for ${new Date(today).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1>{pageTitle}</h1>
            <p>Use this space to write down your thoughts, feelings, and reflections for the day.</p>
            
            {isLoading ? (
                <p>Loading your journal...</p>
            ) : (
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing here..."
                    style={{
                        width: '100%',
                        height: '400px',
                        padding: '10px',
                        fontSize: '16px',
                        fontFamily: 'sans-serif',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                />
            )}

            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center' }}>
                <button onClick={handleSave} disabled={isSaving || isLoading}>
                    {isSaving ? 'Saving...' : 'Save Entry'}
                </button>
                {status && <span style={{ marginLeft: '10px', color: 'green' }}>{status}</span>}
                {error && <span style={{ marginLeft: '10px', color: 'red' }}>{error}</span>}
            </div>
        </div>
    );
};

export default JournalPage;