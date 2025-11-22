'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, RefreshCcw, AlertTriangle, X, BarChart, TrendingUp, Sparkles,
  Zap, CloudRain, Bed, Sun, Moon, Star, Trophy, Target, Calendar,
  Download, Share2, Heart, Flame, Gift, Rocket, Confetti, Music,
  Gamepad2, MessageCircle, Camera, Palette, Thermometer, Droplets,
  Wind, Eye, Bell, Settings, Play, Pause, Volume2, VolumeX
} from 'lucide-react';

import MoodGraph from '../../components/MoodGraph';
import Navigation from '../../components/Navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

// Helper function for a personal touch
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const audioRef = useRef(null);
  const [moodEntries, setMoodEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [todayMood, setTodayMood] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState({ text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" });
  const [goals, setGoals] = useState(['Meditate 10 mins', 'Drink 8 glasses of water', 'Read a book']);
  const [achievements, setAchievements] = useState(['First Mood Log', '7-Day Streak', 'Video Check-in']);
  const [showConfetti, setShowConfetti] = useState(false);
  const [theme, setTheme] = useState('default');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [showHabitModal, setShowHabitModal] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        loadDashboardData();
      } else {
        router.push('/auth/signin');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setMusicPlaying(!musicPlaying);
    }
  };

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const [entriesData, insightsData, todayData] = await Promise.all([
        api.mood.getMoodEntries({ limit: 30 }),
        api.mood.getMoodInsights(7),
        api.mood.getTodayMood()
      ]);
      setMoodEntries(entriesData || []);
      setInsights(insightsData || null);
      setTodayMood(todayData || null);
      setError('');
    } catch (error) {
      setError(`Failed to load dashboard data. Please try again.`);
    } finally {
      setDataLoading(false);
    }
  };

  const handleMoodLogged = () => {
    loadDashboardData();
  };

  const chartData = moodEntries.slice(0, 7).reverse().map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
    mood: entry.mood
  }));

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-teal-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'neon' ? 'bg-gradient-to-br from-purple-900 via-pink-900 to-red-900' : theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-50'} relative overflow-hidden`}>
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-50"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 0.5, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <Navigation currentPage="dashboard" />

      {/* Floating Action Buttons */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={loadDashboardData}
          disabled={dataLoading}
          className="w-12 h-12 bg-teal-500 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          {dataLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw size={20} />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          className="w-12 h-12 bg-pink-500 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          {musicPlaying ? <Pause size={20} /> : <Play size={20} />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(theme === 'default' ? 'neon' : theme === 'neon' ? 'dark' : 'default')}
          className="w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Palette size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center relative"
        >
          
        </motion.button>
      </div>

      <motion.main
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10"
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ y: -20, opacity: 0, rotate: -5 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 5 }}
              className="mb-6 p-4 bg-red-100 border border-red-300 rounded-2xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 font-quicksand font-medium">{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 transition-sanctuary"><X size={20} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crazy Header */}
        <header className="mb-8 text-center">
          <motion.h1
            className="text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-pulse"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}!
          </motion.h1>
          <p className="text-slate-500 mt-2 text-lg">Dive into your mood universe! 🚀</p>
        </header>

        {/* Professional Dynamic Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          {/* Column 1 */}
          <div className="space-y-6">
            <DailyCheckin todayMood={todayMood} onMoodLogged={() => { handleMoodLogged(); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }} />
            <Insights insights={insights} moodEntries={moodEntries} />
            <QuoteWidget quote={quote} />
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <GoalsWidget goals={goals} setGoals={setGoals} />
            <AchievementsWidget achievements={achievements} />
            <StreaksWidget insights={insights} />
          </div>

          {/* Column 3 */}
          <div className="space-y-6">
            <MoodCalendar entries={moodEntries} />
            <FunZone />
            <ExportShareWidget moodEntries={moodEntries} />
          </div>

        </div>

        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50"
            >
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -10,
                    rotate: 0,
                  }}
                  animate={{
                    y: window.innerHeight + 10,
                    rotate: 360,
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.main>
    </div>
  );
}

/* --- Sub-Components --- */

const DailyCheckin = ({ todayMood, onMoodLogged }) => {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMood, setNewMood] = useState({ level: 5, note: '', energy: 3, stress: 3, sleep: 7 });

  const moodOptions = [
    { mood: 1, emoji: '😔', color: 'bg-red-400' },
    { mood: 3, emoji: '😐', color: 'bg-yellow-400' },
    { mood: 5, emoji: '🙂', color: 'bg-green-400' },
    { mood: 7, emoji: '😄', color: 'bg-teal-400' },
    { mood: 9, emoji: '🤩', color: 'bg-sky-400' },
  ];

  const handleMoodSelect = (level) => {
    setNewMood({ ...newMood, level });
    setShowForm(true);
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    if (!newMood.note.trim()) {
      setError('Please add a brief note about your feelings.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.mood.logMood({
        mood: newMood.level, note: newMood.note.trim(), energy: newMood.energy,
        stress: newMood.stress, sleep: newMood.sleep
      });
      setShowForm(false);
      onMoodLogged();
      setNewMood({ level: 5, note: '', energy: 3, stress: 3, sleep: 7 });
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (todayMood?.hasEntry && !showForm) {
    return (
      <motion.div layout className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-700">You&apos;ve logged your mood today!</p>
        <p className="text-4xl my-3">{moodOptions.find(o => o.mood >= todayMood.moodEntry.mood)?.emoji || '😊'}</p>
        <p className="text-slate-600 italic">“{todayMood.moodEntry.note}”</p>
        <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-teal-600 hover:underline">Update Entry</button>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="neumorphic rounded-3xl p-6">
      <h2 className="text-xl font-semibold text-sanctuary-slate mb-4 text-center font-quicksand">How are you feeling now?</h2>
      <div className="flex justify-around items-center mb-6">
        {moodOptions.map(({ mood, emoji }) => (
          <motion.button key={mood} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => handleMoodSelect(mood)}
            className={`text-3xl p-3 rounded-full transition-sanctuary ${newMood.level === mood && showForm ? 'bg-sanctuary-sage/20 ring-2 ring-sanctuary-sage shadow-sanctuary' : 'hover:bg-sanctuary-misty/30'}`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleMoodSubmit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            {/* <SliderInput label="Mood Level" icon={Sparkles} min={1} max={10} value={newMood.level} onChange={(v) => setNewMood({ ...newMood, level: v })} color="bg-teal-500" /> */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SliderInput label="Energy" icon={Zap} min={1} max={5} value={newMood.energy} onChange={(v) => setNewMood({ ...newMood, energy: v })} color="bg-amber-500" />
              <SliderInput label="Stress" icon={CloudRain} min={1} max={5} value={newMood.stress} onChange={(v) => setNewMood({ ...newMood, stress: v })} color="bg-sky-500" />
              {/* --- FIX: Corrected the typo from newM to newMood --- */}
              <SliderInput label="Sleep" icon={Bed} min={0} max={12} value={newMood.sleep} onChange={(v) => setNewMood({ ...newMood, sleep: v })} color="bg-indigo-500" />
            </div>
            <textarea value={newMood.note} onChange={(e) => setNewMood({ ...newMood, note: e.target.value })}
              placeholder="What's contributing to this feeling?" rows="3" required
              className="w-full text-sanctuary-slate rounded-3xl p-3 border border-sanctuary-misty/40 transition-sanctuary bg-white/90 focus-sanctuary font-nunito placeholder:text-sanctuary-slate/40" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex space-x-2 pt-2">
              <button type="submit" disabled={isLoading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-full transition flex items-center justify-center">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Entry'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-sanctuary-misty/50 hover:bg-sanctuary-misty text-sanctuary-slate font-semibold py-2 rounded-3xl transition-sanctuary touch-target font-quicksand">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Insights = ({ insights, moodEntries }) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7DaysEntries = moodEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);

  let avgMoodValue;
  if (last7DaysEntries.length === 0) {
    avgMoodValue = "0/10";
  } else {
    const avg = last7DaysEntries.reduce((sum, e) => sum + e.mood, 0) / last7DaysEntries.length;
    avgMoodValue = avg.toFixed(1) + '/10';
  }

  return (
    <motion.div layout className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Insights</h2>
      <div className="space-y-4">
        <InsightCard icon={BarChart} title="7-Day Avg. Mood" value={avgMoodValue} color="text-emerald-600" />
        <InsightCard icon={Sparkles} title="Current Streak" value={insights ? `${insights.currentStreak || 0} days` : '...'} color="text-sky-600" />
        <InsightCard icon={TrendingUp} title="Mood Trend" value={insights ? insights.moodTrend || 'Stable' : '...'} color="text-amber-600" />
      </div>
    </motion.div>
  );
};

const RecentEntries = ({ entries }) => (
  <motion.div layout className="neumorphic rounded-3xl p-6">
    <h2 className="text-xl font-semibold text-sanctuary-slate mb-4 font-quicksand">Recent Entries</h2>
    {entries.length === 0 ? <EmptyState message="Your recent mood entries will appear here." /> : (
      <motion.div className="space-y-3" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible">
        {entries.slice(0, 7).map((entry) => <RecentEntryItem key={entry.id} entry={entry} />)}
      </motion.div>
    )}
  </motion.div>
);

const RecentEntryItem = ({ entry }) => {
  const getMoodColor = (mood) => {
    if (mood <= 3) return 'bg-red-200 text-red-800';
    if (mood <= 6) return 'bg-yellow-200 text-yellow-800';
    if (mood <= 8) return 'bg-green-200 text-green-800';
    return 'bg-teal-200 text-teal-800';
  };

  return (
    <motion.div
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      className="flex items-start justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/60"
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getMoodColor(entry.mood)}`}>
          {entry.mood}/10
        </div>
        <div>
          <p className="font-semibold text-slate-700">{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
          <p className="text-sm text-slate-600 italic">“{entry.note || 'No note'}”</p>
          <div className="flex space-x-4 text-xs text-slate-500 mt-2">
            {entry.energy && <span className="flex items-center"><Zap size={12} className="mr-1 text-amber-500" /> {entry.energy}/5</span>}
            {entry.stress && <span className="flex items-center"><CloudRain size={12} className="mr-1 text-sky-500" /> {entry.stress}/5</span>}
            {entry.sleep && <span className="flex items-center"><Bed size={12} className="mr-1 text-indigo-500" /> {entry.sleep}h</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InsightCard = ({ icon: Icon, title, value, color }) => (
  <div className="flex items-center space-x-4 bg-sanctuary-sand rounded-3xl border border-sanctuary-misty/30 p-4 shadow-sanctuary">
    <div className={`p-3 rounded-full bg-white shadow-sanctuary ${color}`}><Icon size={20} /></div>
    <div>
      <h3 className="text-sm text-sanctuary-slate/70 font-nunito">{title}</h3>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

const SliderInput = ({ label, icon: Icon, min, max, value, onChange, color }) => (
  <div className="w-full">
    <label className="flex items-center text-sm font-medium text-sanctuary-slate/80 mb-2 font-quicksand">
      <Icon size={14} className="mr-2" /> {label}
    </label>
    <div className="relative flex items-center">
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 rounded-lg cursor-pointer appearance-none ${color}`}
        style={{ backgroundSize: `${(value - min) * 100 / (max - min)}% 100%` }}
      />
      <span className="text-xs text-sanctuary-slate/70 font-semibold ml-3 w-8 text-right font-nunito">{value}</span>
    </div>
  </div>
);

const VideoCheckIn = ({ onMoodLogged }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null); // { mood, emotion, confidence }

  const startVideo = async () => {
    try {
      setError('');
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and device.');
      setIsStreaming(false);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const captureAndLogMood = async () => {
    if (!videoRef.current) return;

    try {
      setIsProcessing(true);
      setError('');

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg'); // base64 frame

      const res = await api.mood.logVideoMood(dataUrl);
      setResult(res);

      // Refresh dashboard data
      if (onMoodLogged) onMoodLogged();
    } catch (err) {
      console.error('Error logging video mood:', err);
      setError('Could not analyze mood from video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <motion.div
      layout
      className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Video Mood Check-in</h2>
          <p className="text-slate-500 text-sm">
            Use your camera to capture a quick snapshot and let the app estimate your mood.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={isStreaming ? stopVideo : startVideo}
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition
              ${
                isStreaming
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'bg-teal-600 text-white border-teal-700 hover:bg-teal-700'
              }`}
          >
            {isStreaming ? 'Stop Video' : 'Start Video'}
          </button>
          {isStreaming && (
            <button
              onClick={captureAndLogMood}
              disabled={isProcessing}
              className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 disabled:opacity-60"
            >
              {isProcessing ? 'Analyzing…' : 'Capture & Log Mood'}
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full bg-slate-900 rounded-2xl overflow-hidden aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 text-sm bg-slate-900/60">
            <p>Camera is off.</p>
            <p className="mt-1">Click &quot;Start Video&quot; to begin.</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-200 text-sm bg-slate-900/70 p-4 text-center">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-3 text-sm text-slate-700">
          <p>
            Detected mood: <span className="font-semibold">{result.mood}/10</span>{' '}
            {result.emotion && (
              <span className="text-slate-500">({result.emotion}, conf: {(result.confidence ?? 0).toFixed(2)})</span>
            )}
          </p>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        A single snapshot is sent securely to our mood model to estimate your emotion and mood score.
      </p>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};


const EmptyState = ({ message }) => (
  <div className="text-center py-10">
    <p className="text-slate-500">{message}</p>
  </div>
);



const QuoteWidget = ({ quote }) => (
  <motion.div
    layout
    className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
    whileHover={{ scale: 1.02 }}
  >
    <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
      <Heart className="mr-2 text-pink-500" /> Daily Inspiration
    </h3>
    <blockquote className="text-slate-700 italic">"{quote.text}"</blockquote>
    <cite className="text-sm text-slate-500 mt-2 block">- {quote.author}</cite>
  </motion.div>
);

const GoalsWidget = ({ goals, setGoals }) => {
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      layout
      className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
      whileHover={{ scale: 1.02 }}
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <Target className="mr-2 text-green-500" /> Daily Goals
      </h3>
      <div className="space-y-2 mb-4">
        {goals.map((goal, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between bg-slate-50 p-2 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-sm text-slate-700">{goal}</span>
            <button onClick={() => removeGoal(i)} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add a goal..."
          className="flex-1 text-sm p-2 rounded-lg border border-slate-300"
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
        />
        <button onClick={addGoal} className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Add
        </button>
      </div>
    </motion.div>
  );
};

const AchievementsWidget = ({ achievements }) => (
  <motion.div
    layout
    className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
    whileHover={{ scale: 1.02 }}
  >
    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
      <Trophy className="mr-2 text-yellow-500" /> Achievements
    </h3>
    <div className="grid grid-cols-1 gap-2">
      {achievements.map((achievement, i) => (
        <motion.div
          key={i}
          className="flex items-center space-x-3 bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <Trophy size={20} className="text-yellow-600" />
          <span className="text-sm font-medium text-slate-800">{achievement}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const FunZone = () => {
  const router = useRouter();

  const goToAntiStressGames = () => {
    router.push('/anti-stress-games');
  };

  return (
    <motion.div
      layout
      className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
      whileHover={{ scale: 1.02 }}
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <Gamepad2 className="mr-2 text-purple-500" /> Fun Zone
      </h3>
      <div className="text-center">
        <p className="text-slate-600 mb-4">Relax with anti-stress games!</p>
        <motion.button
          onClick={goToAntiStressGames}
          className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Play Anti-Stress Games
        </motion.button>
      </div>
    </motion.div>
  );
};

const MoodCalendar = ({ entries }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const getMoodForDay = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const entry = entries.find(e => new Date(e.date).toDateString() === date.toDateString());
    return entry ? entry.mood : null;
  };

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    const now = new Date();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    if (nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth())) {
      return; // Don't allow future months
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  const isNextDisabled = () => {
    const now = new Date();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth());
  };

  return (
    <motion.div
      layout
      className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <Calendar className="mr-2 text-blue-500" /> Mood Calendar
        </h3>
        <div className="flex space-x-2">
          <button onClick={goToPrevMonth} className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm">Prev</button>
          <button onClick={goToNextMonth} disabled={isNextDisabled()} className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>
      <div className="text-center mb-4">
        <span className="text-sm font-medium text-slate-600">{new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-xs font-semibold text-slate-500 py-1">{day}</div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const mood = getMoodForDay(i + 1);
          let colorClass = 'bg-slate-200 text-slate-500';
          if (mood !== null) {
            if (mood === 0) colorClass = 'bg-white text-black';
            else if (mood <= 2) colorClass = 'bg-red-100 text-black';
            else if (mood <= 4) colorClass = 'bg-red-200 text-black';
            else if (mood <= 6) colorClass = 'bg-red-300 text-black';
            else if (mood <= 8) colorClass = 'bg-red-400 text-white';
            else colorClass = 'bg-red-500 text-white';
          }
          return (
            <motion.div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${colorClass}`}
              whileHover={{ scale: 1.2 }}
            >
              {i + 1}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4">
        <div className="text-xs text-slate-500 mb-1">Mood Scale</div>
        <div className="relative h-4 bg-gradient-to-r from-white via-red-100 via-red-200 via-red-300 via-red-400 to-red-500 rounded">
          <div className="absolute inset-0 flex justify-between items-center px-1">
            <span className="text-xs text-black font-semibold">0-2</span>
            <span className="text-xs text-black font-semibold">2-4</span>
            <span className="text-xs text-black font-semibold">4-6</span>
            <span className="text-xs text-black font-semibold">6-8</span>
            <span className="text-xs text-white font-semibold">8-10</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StreaksWidget = ({ insights }) => (
  <motion.div
    layout
    className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
    whileHover={{ scale: 1.02 }}
  >
    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
      <Flame className="mr-2 text-orange-500" /> Streaks
    </h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-700">Current Streak</span>
        <div className="flex items-center space-x-1">
          <Flame className="text-orange-500" size={16} />
          <span className="font-bold text-orange-600">{insights?.currentStreak || 0} days</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-700">Longest Streak</span>
        <span className="font-bold text-slate-800">{insights?.longestStreak || 0} days</span>
      </div>
    </div>
  </motion.div>
);

const ExportShareWidget = ({ moodEntries }) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(moodEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'mood-data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My Mood Tracking Progress',
      text: `I've tracked my mood ${moodEntries.length} times. Check out my progress!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <motion.div
      layout
      className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
      whileHover={{ scale: 1.02 }}
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <Download className="mr-2 text-teal-500" /> Export & Share
      </h3>
      <div className="space-y-2">
        <motion.button
          onClick={handleExport}
          className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={16} />
          <span>Export Data</span>
        </motion.button>
        <motion.button
          onClick={handleShare}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Share2 size={16} />
          <span>Share Progress</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const HabitTrackerChart = ({ entries }) => {
  const chartData = entries.slice(0, 7).reverse();

  return (
    <motion.div
      layout
      className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
      whileHover={{ scale: 1.02 }}
    >
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Habit Tracker</h2>
      <p className="text-slate-500 text-sm mb-4">Daily mood levels over the last 7 days.</p>
      <div className="flex space-x-2 justify-center">
        {chartData.map((entry, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-8 bg-teal-500 rounded-t"
              style={{ height: `${entry.mood * 8}px` }}
            ></div>
            <span className="text-xs mt-2 text-slate-600">
              {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const MoodHeatmap = ({ entries }) => {
  const today = new Date();
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const entry = entries.find(e => new Date(e.date).toDateString() === date.toDateString());
    days.push({ date, mood: entry ? entry.mood : 0 });
  }

  return (
    <motion.div
      layout
      className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-6"
      whileHover={{ scale: 1.02 }}
    >
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Mood Heatmap</h2>
      <p className="text-slate-500 text-sm mb-4">Last 90 days mood activity (GitHub-style).</p>
      <div className="grid grid-cols-13 gap-1">
        {days.map((day, i) => {
          let color = 'bg-slate-200';
          if (day.mood > 0) {
            if (day.mood <= 3) color = 'bg-red-300';
            else if (day.mood <= 6) color = 'bg-yellow-300';
            else color = 'bg-green-400';
          }
          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${color}`}
              title={`${day.date.toDateString()}: ${day.mood}/10`}
            ></div>
          );
        })}
      </div>
    </motion.div>
  );
};
