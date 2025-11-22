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
      <div className="min-h-screen mesh-gradient-sanctuary relative">
        <Navigation currentPage="activities" />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-3xl flex items-center justify-between shadow-sanctuary"
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-red-700 font-quicksand font-medium">{error}</span>
                </div>
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 transition-sanctuary"><X size={20} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <header className="mb-10 sm:mb-12 text-center">
            <motion.h1 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-sanctuary-slate font-nunito mb-3 leading-tight"
            >
              Your Daily Wellness
            </motion.h1>
            <motion.p 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-sanctuary-slate/70 font-quicksand"
            >
              Choose an activity to nurture your mind and body
            </motion.p>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8 items-start">
            {/* Progress Card - Sticky on large screens */}
            <div className="xl:col-span-1 order-1">
              <div className="xl:sticky xl:top-24">
                <ActivityProgress completed={completedCount} total={totalCount} />
              </div>
            </div>
            
            {/* Activities Grid */}
            <div className="xl:col-span-3 order-2">
                {dataLoading ? (
                    <div className="flex justify-center items-center h-64 frosted-glass rounded-3xl">
                      <Loader2 className="h-10 w-10 animate-spin text-sanctuary-sage"/>
                    </div>
                ) : displayedActivities.length > 0 ? (
                    <motion.div 
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
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
        <motion.div 
          layout 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="frosted-glass rounded-3xl p-6 sm:p-8 border-2 border-white/40 shadow-xl"
        >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sanctuary-sage to-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-sanctuary-slate font-nunito">Today's Progress</h2>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg className="transform -rotate-90" width="160" height="160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-sanctuary-misty/30"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 440' }}
                  animate={{ strokeDasharray: `${percentage * 4.4} 440` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#84A98C" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-sanctuary-slate font-nunito">{Math.round(percentage)}%</span>
                <span className="text-sm text-sanctuary-slate/60 font-quicksand">{completed}/{total}</span>
              </div>
            </div>

            <div className="space-y-3">
                 <InsightCard icon={CheckCircle} title="Completed" value={`${completed} ${completed === 1 ? 'Activity' : 'Activities'}`} color="text-sanctuary-sage" bgColor="from-sanctuary-sage/20 to-teal-500/20" />
                 <InsightCard icon={ListTodo} title="Remaining" value={`${total - completed} ${(total - completed) === 1 ? 'Activity' : 'Activities'}`} color="text-sanctuary-slate" bgColor="from-sanctuary-misty/40 to-sanctuary-sand/60" />
            </div>
        </motion.div>
    );
};

const InsightCard = ({ icon: Icon, title, value, color, bgColor }) => (
  <motion.div 
    whileHover={{ x: 5 }}
    className={`flex items-center space-x-4 bg-gradient-to-r ${bgColor} rounded-2xl border border-white/40 p-4 backdrop-blur-sm shadow-lg`}
  >
    <div className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg ${color}`}>
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className="flex-1">
      <h3 className="text-xs font-medium text-sanctuary-slate/60 font-quicksand uppercase tracking-wide">{title}</h3>
      <p className={`text-base sm:text-lg font-bold ${color} font-nunito`}>{value}</p>
    </div>
  </motion.div>
);

const EmptyState = ({ message }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="text-center py-20 frosted-glass rounded-3xl border-2 border-white/40"
  >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sanctuary-sage/30 to-sanctuary-misty/40 flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">🌿</span>
      </div>
      <p className="text-xl text-sanctuary-slate/70 font-quicksand">{message}</p>
  </motion.div>
);