'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, X, CheckCircle, ListTodo } from 'lucide-react';

import Navigation from '../../components/Navigation';
import ActivityCard from '../../components/ActivityCard';
import ActivityModal from '../../components/ActivityModal';
import DoodleCanvas from '../../components/DoodleCanvas';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

// --- Local Storage Helper for Daily Activity Tracking ---
const activityStorage = {
  getTodayKey: () => {
    const today = new Date();
    return `activity_completion_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  },
  getCompleted: () => {
    if (typeof window === 'undefined') return new Set();
    const key = activityStorage.getTodayKey();
    const completedIds = localStorage.getItem(key);
    return completedIds ? new Set(JSON.parse(completedIds)) : new Set();
  },
  addCompleted: (activityId) => {
    if (typeof window === 'undefined') return;
    const key = activityStorage.getTodayKey();
    const completed = activityStorage.getCompleted();
    completed.add(activityId);
    localStorage.setItem(key, JSON.stringify(Array.from(completed)));
  },
};

export default function ActivitiesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for managing the modal
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Local front-end activity definitions (6 activities remain after removing 5)
  // All timed activities default to 5 minutes (300 seconds)
  const localActivities = [
    { id: 'breathing-exercise', title: '5-Minute Breathing Exercise', description: 'Practice deep breathing to reduce stress and anxiety', duration: '5 minutes', category: 'Breathing', difficulty: 'Easy', showDuration: true },
    { id: 'meditation', title: 'Guided Meditation', description: 'Listen to a calming meditation session', duration: '5 minutes', category: 'Meditation', difficulty: 'Medium', showDuration: true },
    { id: 'doodle', title: 'Free-form Doodling', description: 'Let your creativity flow with simple drawing', duration: '10 minutes', category: 'Creative', difficulty: 'Easy', showDuration: false },
    { id: 'music-listening', title: 'Music Therapy', description: 'Listen to music that matches or improves your mood', duration: '5 minutes', category: 'Creative', difficulty: 'Easy', showDuration: true },
    { id: 'stretching', title: 'Gentle Stretching', description: 'Release tension with simple stretches', duration: '5 minutes', category: 'Physical', difficulty: 'Easy', showDuration: true },
    { id: 'dance-break', title: 'Dance Break', description: 'Put on your favorite song and move your body', duration: '5 minutes', category: 'Physical', difficulty: 'Easy', showDuration: true }
  ];

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin');
      } else {
        loadActivities();
      }
    }
  }, [isAuthenticated, authLoading, router]);

  const loadActivities = async () => {
    try {
      setDataLoading(true);
      setError('');
      const activitiesData = await api.activities.getTodayActivities();
      const completedIds = activityStorage.getCompleted();
      
      const enrichedActivities = (activitiesData || []).map(activity => ({
        ...activity,
        completed: completedIds.has(activity.id),
      }));
      
      setActivities(enrichedActivities);
    } catch (err) {
      setError('Failed to load activities. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };
  
  // This is called by the modal when the timer finishes
  // Wrap in useCallback to prevent infinite re-renders
  const handleActivityComplete = useCallback((activityId) => {
    activityStorage.addCompleted(activityId);
    setActivities(prev =>
      prev.map(activity =>
        activity.id === activityId ? { ...activity, completed: true } : activity
      )
    );
     // Optional: Persist to backend without blocking UI
     api.activities.completeActivity(activityId).catch(err => {
        console.error("Failed to sync completion with server:", err);
     });
  }, []);

  // Always display all local activities
  const completedIds = activityStorage.getCompleted();
  
  // Load incomplete activities from localStorage (activities that were paused/closed mid-way)
  const getIncompleteActivities = () => {
    if (typeof window === 'undefined') return new Map();
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const incompleteMap = new Map();
    
    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`activity_incomplete_${todayKey}`)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          incompleteMap.set(data.id, data);
        } catch (e) {
          console.error('Failed to parse incomplete activity', e);
        }
      }
    }
    return incompleteMap;
  };
  
  const incompleteActivitiesMap = getIncompleteActivities();
  
  // Merge activities with incomplete status and saved state
  const displayedActivities = localActivities.map(a => {
    const incompleteData = incompleteActivitiesMap.get(a.id);
    return {
      ...a,
      completed: completedIds.has(a.id),
      isIncomplete: !!incompleteData, // Yellow card if incomplete
      incompleteSavedState: incompleteData, // Store saved state for resuming
    };
  });
  
  const completedCount = displayedActivities.filter(a => a.completed).length;
  const totalCount = displayedActivities.length;
  
  
  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-teal-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-violet-50">
        <Navigation currentPage="activities" />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="mb-6 p-4 bg-red-100 border border-red-300 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
                <button onClick={() => setError('')} className="text-red-600 hover:text-red-800"><X size={20} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <header className="mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">Your Daily Wellness</h1>
              <p className="text-slate-500 mt-1">Select an activity to begin your mindful moment.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 lg:sticky top-8">
              <ActivityProgress completed={completedCount} total={totalCount} />
            </div>
            
            <div className="lg:col-span-2">
                {dataLoading ? (
                    <div className="flex justify-center items-center h-64 bg-white/60 backdrop-blur-lg rounded-2xl"><Loader2 className="h-8 w-8 animate-spin text-teal-600"/></div>
                ) : displayedActivities.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-3 gap-6"
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                    initial="hidden"
                    animate="visible"
                  >
                    {displayedActivities.map(activity => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onStart={setSelectedActivity}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState message="No activities available." />
                )}
            </div>
          </div>
        </motion.main>
      </div>

      {/* Render the modal outside the main flow, controlled by state */}
      <AnimatePresence>
        {selectedActivity && selectedActivity.id === 'doodle' ? (
          <DoodleCanvas
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
            onComplete={handleActivityComplete}
          />
        ) : selectedActivity ? (
          <ActivityModal
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
            onComplete={handleActivityComplete}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

/* --- Sub-Components --- */

const ActivityProgress = ({ completed, total }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return(
        <motion.div layout className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Today's Progress</h2>
            <div className="space-y-4">
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <motion.div
                        className="bg-gradient-to-r from-teal-400 to-sky-500 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-600">
                    <span>{completed}/{total} Completed</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            </div>
            <div className="mt-6 space-y-3">
                 <InsightCard icon={CheckCircle} title="Completed" value={`${completed} Activities`} color="text-emerald-600" />
                 <InsightCard icon={ListTodo} title="Remaining" value={`${total - completed} Activities`} color="text-amber-600" />
            </div>
        </motion.div>
    );
};

const InsightCard = ({ icon: Icon, title, value, color }) => (
  <div className="flex items-center space-x-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
    <div className={`p-2 rounded-full bg-white ${color}`}><Icon size={18} /></div>
    <div>
      <h3 className="text-sm text-slate-600">{title}</h3>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-20 bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80">
      <p className="text-slate-500">{message}</p>
  </div>
);