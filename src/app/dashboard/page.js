'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoodGraph from '../../components/MoodGraph';
import Navigation from '../../components/Navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [moodEntries, setMoodEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [todayMood, setTodayMood] = useState(null);
  const [newMood, setNewMood] = useState({ level: 5, note: '', energy: 3, stress: 3, sleep: 7 });
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    } else if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, user, loading, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading dashboard data...');
      
      // Load mood entries, insights, and today's mood in parallel
      const [entriesData, insightsData, todayData] = await Promise.all([
        api.mood.getMoodEntries({ limit: 30 }),
        api.mood.getMoodInsights(7),
        api.mood.getTodayMood()
      ]);

      console.log('📊 Dashboard data loaded:', {
        entries: entriesData?.length || 0,
        insights: insightsData,
        today: todayData
      });

      setMoodEntries(entriesData || []);
      setInsights(insightsData || null);
      setTodayMood(todayData || null);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    if (!newMood.note.trim()) {
      setError('Please add a note about how you\'re feeling');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const moodData = {
        mood: newMood.level,
        note: newMood.note.trim(),
        energy: newMood.energy,
        stress: newMood.stress,
        sleep: newMood.sleep
      };

      await api.mood.logMood(moodData);
      
      // Reload dashboard data to show the new entry
      await loadDashboardData();
      
      setNewMood({ level: 5, note: '', energy: 3, stress: 3, sleep: 7 });
      setShowForm(false);
    } catch (error) {
      console.error('Error logging mood:', error);
      setError('Failed to save mood entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Convert mood entries to chart data
  const chartData = moodEntries.slice(0, 7).reverse().map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
    mood: entry.mood
  }));

  // Debug logging for mood data
  console.log('📊 Current mood data state:', {
    moodEntries: moodEntries.length,
    insights: insights,
    todayMood: todayMood,
    chartData: chartData.length
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-800 mb-2">Loading...</div>
          <div className="text-gray-600">Please wait while we authenticate you</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation currentPage="dashboard" />

      <div className="max-w-6xl mx-auto p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {user?.name || user?.email || 'User'}! 👋
              </h1>
              <p className="text-gray-600">
                Here&apos;s your wellness overview for today
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>{isLoading ? '🔄' : '🔄'}</span>
              <span>{isLoading ? 'Loading...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {isLoading ? (
            <div className="col-span-3 bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-600">Loading insights...</span>
              </div>
            </div>
          ) : insights ? (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Average Mood</h3>
                    <p className="text-sm text-gray-600">Last 7 days</p>
                  </div>
                  <div className="text-2xl font-bold text-green-500">{insights.averageMood || 0}/10</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Current Streak</h3>
                    <p className="text-sm text-gray-600">Days in a row</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{insights.currentStreak || 0}</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Mood Trend</h3>
                    <p className="text-sm text-gray-600">Recent change</p>
                  </div>
                  <div className="text-2xl font-bold text-purple-500 capitalize">{insights.moodTrend || 'stable'}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-3 bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500 text-lg mb-2">No insights available yet</p>
              <p className="text-gray-400 text-sm">Start logging your mood to see personalized insights</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mood Check-in Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Mood Check-in</h2>
            {todayMood?.hasEntry ? (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-green-600 font-semibold mb-2">✅ Today&apos;s mood logged!</div>
                <div className="text-sm text-gray-600">
                  Mood: {todayMood.moodEntry.mood}/10
                  {todayMood.moodEntry.note && (
                    <div className="mt-1 italic">&quot;{todayMood.moodEntry.note}&quot;</div>
                  )}
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Update today&apos;s mood
                </button>
              </div>
            ) : !showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
              >
                How are you feeling today?
              </button>
            ) : (
              <form onSubmit={handleMoodSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood Level (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newMood.level}
                    onChange={(e) => setNewMood({ ...newMood, level: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>😔 Very Low</span>
                    <span className="text-lg">{newMood.level}</span>
                    <span>😊 Excellent</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energy (1-5)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newMood.energy}
                      onChange={(e) => setNewMood({ ...newMood, energy: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center text-xs text-gray-500 mt-1">{newMood.energy}/5</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stress (1-5)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newMood.stress}
                      onChange={(e) => setNewMood({ ...newMood, stress: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center text-xs text-gray-500 mt-1">{newMood.stress}/5</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep (hours)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={newMood.sleep}
                      onChange={(e) => setNewMood({ ...newMood, sleep: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center text-xs text-gray-500 mt-1">{newMood.sleep}h</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How are you feeling? *
                  </label>
                  <textarea
                    value={newMood.note}
                    onChange={(e) => setNewMood({ ...newMood, note: e.target.value })}
                    placeholder="Share what&apos;s on your mind..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save Entry'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={isLoading}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Mood Graph */}
          <MoodGraph data={chartData} />
        </div>


        {/* Recent Entries */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Mood Entries</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-600">Loading mood entries...</span>
              </div>
            </div>
          ) : moodEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-500 text-lg mb-2">No mood entries yet</p>
              <p className="text-gray-400 text-sm">Start tracking your daily mood to see your entries here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moodEntries.slice(0, 5).map((entry, index) => {
                console.log(`📝 Rendering mood entry ${index}:`, entry);
                return (
                  <div key={entry.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {entry.mood <= 3 ? '😔' : entry.mood <= 6 ? '😐' : entry.mood <= 8 ? '🙂' : '😊'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{entry.mood}/10</p>
                        <p className="text-sm text-gray-600">{entry.note || 'No note'}</p>
                        <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                          {entry.energy && <span>⚡ {entry.energy}/5</span>}
                          {entry.stress && <span>😰 {entry.stress}/5</span>}
                          {entry.sleep && <span>😴 {entry.sleep}h</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.date ? new Date(entry.date).toLocaleDateString() : 'Unknown date'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}