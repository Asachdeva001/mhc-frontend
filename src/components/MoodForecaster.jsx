import React, { useState, useEffect } from 'react';

const MoodForecaster = () => {
    const [prediction, setPrediction] = useState(null);
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMoodPrediction = async () => {
            try {
                // In a real app, you would pass the user's actual mood history.
                // For this example, we send an empty object to use the backend's mock data.
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mood/prediction`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ history: [] }), // Send user's mood history here
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch mood prediction');
                }

                const data = await response.json();
                setPrediction(data.prediction);
                setSuggestion(data.suggestion);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMoodPrediction();
    }, []);

    if (loading) {
        return <div>Loading mood forecast...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Mood Forecast</h2>
            {prediction === 'bad' ? (
                <div>
                    <p>It looks like you might have a challenging day ahead.</p>
                    {suggestion && (
                        <div>
                            <h4>Here's a suggestion that might help:</h4>
                            <p><strong>{suggestion.name}</strong> ({suggestion.category})</p>
                        </div>
                    )}
                </div>
            ) : (
                <p>Looks like a stable day ahead. Keep up the great work!</p>
            )}
        </div>
    );
};

export default MoodForecaster;