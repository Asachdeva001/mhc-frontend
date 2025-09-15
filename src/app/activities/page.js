'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ActivityCard from '../../components/ActivityCard';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';

export default function ActivitiesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    } else if (isAuthenticated) {
      loadActivities();
    }
  }, [isAuthenticated, loading, router]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const activitiesData = await api.activities.getTodayActivities();
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityComplete = async (activityId) => {
    try {
      await api.activities.completeActivity(activityId);
      
      // Update the activity status locally
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, completed: true }
            : activity
        )
      );
    } catch (error) {
      console.error('Error completing activity:', error);
      setError('Failed to complete activity. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
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

  const completedCount = activities.filter(activity => activity.completed).length;
  const totalCount = activities.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation currentPage="activities" />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Wellness Activities</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Take a moment for yourself with these carefully curated activities designed to support your mental wellbeing.
          </p>
          
          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Today&apos;s Progress</span>
              <span className="text-sm font-medium text-gray-700">{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedCount === totalCount ? '🎉 All activities completed!' : 
               `${totalCount - completedCount} activities remaining`}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Activities Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading activities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onComplete={handleActivityComplete}
              />
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{completedCount}</div>
            <div className="text-gray-600">Activities Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{totalCount - completedCount}</div>
            <div className="text-gray-600">Activities Remaining</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </div>
            <div className="text-gray-600">Completion Rate</div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-3">📚</div>
              <h4 className="font-semibold text-gray-800 mb-2">Mental Health Resources</h4>
              <p className="text-gray-600 text-sm">
                Access articles, guides, and professional resources for mental health support.
              </p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-gray-800 mb-2">Progress Tracking</h4>
              <p className="text-gray-600 text-sm">
                Monitor your wellness journey and celebrate your achievements.
              </p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-3">💡</div>
              <h4 className="font-semibold text-gray-800 mb-2">Tips & Techniques</h4>
              <p className="text-gray-600 text-sm">
                Learn new coping strategies and mindfulness techniques.
              </p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-3">🤝</div>
              <h4 className="font-semibold text-gray-800 mb-2">Community Support</h4>
              <p className="text-gray-600 text-sm">
                Connect with others on similar wellness journeys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}