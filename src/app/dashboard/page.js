'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, RefreshCcw, AlertTriangle, X, BarChart, TrendingUp, Sparkles,
  Zap, CloudRain, Bed, Sun, Moon, Star, Trophy, Target, Calendar,
  Share2, Heart, Flame, Gift, Rocket, Music, Gamepad2, Play, Pause, Palette
} from 'lucide-react';

import MoodGraph from '../../components/MoodGraph';
import Navigation from '../../components/Navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/authContext';
import { goalsStorage } from '../../lib/localStorage';

// --- 🎨 COLORS ---
const COLORS = {
  primary: 'text-teal-600',
  primaryBg: 'bg-teal-600',
  secondary: 'text-sky-500',
  secondaryBg: 'bg-sky-500',
  accent: 'text-amber-500',
  accentBg: 'bg-amber-500',
  cardBg: 'bg-white/90',
  cardBorder: 'border-slate-200',
  baseText: 'text-slate-700',
  subtleText: 'text-slate-500',
  bgGradient: 'bg-gradient-to-br from-teal-50 to-blue-50',
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// Backup quote in case API fails
const BACKUP_QUOTE = {
  text: "Believe you can and you're halfway there.",
  author: "Theodore Roosevelt"
};

// Fetch random quote from Zenquotes API
const fetchRandomQuote = async () => {
  try {
    const response = await fetch('https://zenquotes.io/api/quotes');
    if (!response.ok) throw new Error('Failed to fetch quote');
    
    const data = await response.json();
    if (data && data.length > 0) {
      const randomQuote = data[Math.floor(Math.random() * data.length)];
      return {
        text: randomQuote.q,
        author: randomQuote.a.replace(/,\s*type\.name$/, '') // Remove author type suffix if present
      };
    }
    return BACKUP_QUOTE;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return BACKUP_QUOTE;
  }
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
  const [quote, setQuote] = useState(BACKUP_QUOTE);

  // --------------- LOCAL STORAGE GOALS -------------------
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("focus_goals");
    if (saved) setGoals(JSON.parse(saved));
    else setGoals(['Meditate 10 mins', 'Drink 8 glasses of water', 'Read a book']);
  }, []);

  useEffect(() => {
    localStorage.setItem("focus_goals", JSON.stringify(goals));
  }, [goals]);
  // -------------------------------------------------------

  const [achievements, setAchievements] = useState(['First Mood Log', '7-Day Streak', 'Video Check-in']);
  const [showConfetti, setShowConfetti] = useState(false);
  const [theme, setTheme] = useState('oasis');
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        loadDashboardData();
        // Fetch random quote on dashboard load
        fetchRandomQuote().then(fetchedQuote => setQuote(fetchedQuote));
      } else {
        router.push('/auth/signin');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  const toggleMusic = () => {
    if (audioRef.current) {
      musicPlaying ? audioRef.current.pause() : audioRef.current.play();
    }
    setMusicPlaying(!musicPlaying);
  };

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const [entriesData, insightsData, todayData] = await Promise.all([
        api.mood.getMoodEntries({ limit: 30 }).catch(() => []),
        api.mood.getMoodInsights(7).catch(() => null),
        api.mood.getTodayMood().catch(() => null)
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

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className={`min-h-screen ${COLORS.bgGradient} flex items-center justify-center`}>
        <Loader2 className={`animate-spin h-8 w-8 ${COLORS.primary}`} />
      </div>
    );
  }

  const appBgClass =
    theme === 'dark' ? 'bg-gray-900' :
      theme === 'neon' ? 'bg-gradient-to-br from-purple-900 via-pink-900 to-red-900' :
        COLORS.bgGradient;


  return (
    <div className={`min-h-screen ${appBgClass} relative overflow-hidden`}>

      {/* --- Floating Particles --- */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-50"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 0.5, 1]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <Navigation currentPage="dashboard" />

      {/* --- Floating Action Buttons --- */}
      <div className="fixed top-20 right-4 z-50 space-y-3">
        {/* Refresh */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={loadDashboardData}
          disabled={dataLoading}
          className={`w-12 h-12 ${COLORS.primaryBg} text-white rounded-full shadow-xl flex items-center justify-center`}
        >
          {dataLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw size={20} />}
        </motion.button>

        {/* Music */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          className={`w-12 h-12 ${COLORS.secondaryBg} text-white rounded-full shadow-xl flex items-center justify-center`}
        >
          {musicPlaying ? <Pause size={20} /> : <Play size={20} />}
        </motion.button>

        {/* Theme */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(theme === 'oasis' ? 'dark' : theme === 'dark' ? 'neon' : 'oasis')}
          className={`w-12 h-12 ${COLORS.accentBg} text-white rounded-full shadow-xl flex items-center justify-center`}
        >
          <Palette size={20} />
        </motion.button>
      </div>

      {/* MAIN CONTENT */}
      <motion.main
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10"
      >

        {/* ERRORS */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
              <button onClick={() => setError('')}><X size={20} className="text-red-500" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <header className="mb-10 text-center">
          <motion.h1
            className={`text-3xl sm:text-4xl font-extrabold ${COLORS.primary}`}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Explorer'}!
          </motion.h1>
          <p className={`${COLORS.subtleText} mt-2 italic text-xl`}>Your wellness journey begins here. ✨</p>
        </header>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Column 1 */}
          <div className="space-y-8">
            <DailyCheckin todayMood={todayMood} onMoodLogged={() => {
              handleMoodLogged();
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
            }} />

            <RecentEntries entries={moodEntries} />
            <QuoteWidget quote={quote} />
          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            <GoalsWidget goals={goals} setGoals={setGoals} />
            <MoodSummary moodEntries={moodEntries} insights={insights} />
            <AchievementsWidget achievements={achievements} />
          </div>

          {/* Column 3 */}
          <div className="space-y-8">
            <MoodCalendar entries={moodEntries} />
            <FunZone />
            {/* <ExportShareWidget moodEntries={moodEntries} /> */}
          </div>

        </div>

      </motion.main>
    </div>
  );
}

// -------------------- DAILY CHECK-IN --------------------
const DailyCheckin = ({ todayMood, onMoodLogged }) => {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMood, setNewMood] = useState({
    level: 5, note: '', energy: 3, stress: 3, sleep: 7
  });

  const moodOptions = [
    { mood: 1, emoji: '😞' },
    { mood: 3, emoji: '😕' },
    { mood: 5, emoji: '🙂' },
    { mood: 7, emoji: '😊' },
    { mood: 9, emoji: '🤩' },
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
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowForm(false);
      onMoodLogged();
      setNewMood({ level: 5, note: '', energy: 3, stress: 3, sleep: 7 });
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodEmoji = (mood) =>
    moodOptions.find(o => o.mood >= mood)?.emoji || '😊';

  // Already logged today → show result
  if (todayMood?.hasEntry && !showForm) {
    return (
      <motion.div
        layout
        className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6 text-center`}
      >
        <p className={`text-xl font-bold ${COLORS.primary}`}>You've completed your daily check-in!</p>

        <p className="text-5xl my-4 animate-bounce-once">
          {getMoodEmoji(todayMood.moodEntry.mood)}
        </p>

        <p className={`${COLORS.subtleText} italic`}>
          “{todayMood.moodEntry.note}”
        </p>

        <button
          onClick={() => setShowForm(true)}
          className={`mt-4 text-sm ${COLORS.secondary} hover:underline font-semibold`}
        >
          Update Entry
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6`}
    >
      <h2 className={`text-2xl font-bold ${COLORS.baseText} mb-6 text-center`}>
        How are you feeling today?
      </h2>

      {/* Mood buttons */}
      <div className="flex justify-around items-center mb-6">
        {moodOptions.map(({ mood, emoji }) => (
          <motion.button
            key={mood}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMoodSelect(mood)}
            className={`text-4xl p-3 rounded-full transition-all ${newMood.level === mood && showForm
                ? `bg-teal-100 ring-4 ring-teal-300 shadow-lg`
                : 'hover:bg-teal-50'
              }`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleMoodSubmit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-5 overflow-hidden pt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SliderInput
                label="Energy"
                icon={Zap}
                min={1}
                max={5}
                value={newMood.energy}
                onChange={(v) => setNewMood({ ...newMood, energy: v })}
              />

              <SliderInput
                label="Stress"
                icon={CloudRain}
                min={1}
                max={5}
                value={newMood.stress}
                onChange={(v) => setNewMood({ ...newMood, stress: v })}
              />

              <SliderInput
                label="Sleep (hours)"
                icon={Bed}
                min={0}
                max={12}
                value={newMood.sleep}
                onChange={(v) => setNewMood({ ...newMood, sleep: v })}
              />
            </div>

            <textarea
              value={newMood.note}
              onChange={(e) =>
                setNewMood({ ...newMood, note: e.target.value })
              }
              placeholder="What's contributing to this feeling?"
              rows="3"
              className="w-full text-slate-700 rounded-xl p-3 border border-slate-300 bg-slate-50/80 focus:ring-2 focus:ring-teal-400 resize-none"
            />

            {error && (
              <p className="text-sm text-red-600 font-medium flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                {error}
              </p>
            )}

            <div className="flex space-x-3 pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 ${COLORS.primaryBg} text-white font-bold py-3 rounded-xl shadow-md`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Save Entry'
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// -------------------- RECENT ENTRIES --------------------
const RecentEntries = ({ entries }) => {
  const getMoodColor = (m) => {
    if (m <= 3) return 'bg-orange-100 text-orange-800';
    if (m <= 6) return 'bg-yellow-100 text-yellow-800';
    if (m <= 8) return 'bg-green-100 text-green-800';
    return 'bg-teal-100 text-teal-800';
  };

  return (
    <motion.div
      layout
      className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6`}
    >
      <h2 className={`text-xl font-bold ${COLORS.baseText} mb-4 flex items-center`}>
        <Calendar size={20} className={`mr-2 ${COLORS.primary}`} />
        Latest Mood Logs
      </h2>

      {entries.length === 0 && (
        <EmptyState message="Your recent mood entries will appear here." />
      )}

      <div className="space-y-4">
        {entries.slice(0, 3).map((entry) => (
          <motion.div
            key={entry.id}
            className="flex items-start p-3 bg-slate-50/70 rounded-xl border border-slate-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getMoodColor(entry.mood)}`}>
              {entry.mood}/10
            </div>

            <div className="ml-3 flex-grow">
              <p className="font-semibold text-sm text-slate-700">
                {new Date(entry.date).toLocaleDateString('en-US')}
              </p>

              <p className="text-xs text-slate-600 italic mt-1 truncate max-w-xs">
                “{entry.note || 'No note'}”
              </p>

              <div className="flex space-x-3 text-xs text-slate-500 mt-1">
                {entry.energy && (
                  <span className="flex items-center">
                    <Zap size={10} className="mr-1 text-amber-500" /> {entry.energy}/5
                  </span>
                )}
                {entry.sleep !== undefined && (
                  <span className="flex items-center">
                    <Bed size={10} className="mr-1 text-indigo-500" /> {entry.sleep}h
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};


// -------------------- QUOTE WIDGET --------------------
const QuoteWidget = ({ quote }) => (
  <motion.div
    layout
    className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6`}
    whileHover={{ scale: 1.01 }}
  >
    <h3 className={`text-lg font-bold ${COLORS.baseText} mb-3 flex items-center`}>
      <Heart className={`mr-2 ${COLORS.secondary}`} /> Daily Wisdom
    </h3>

    <blockquote className={`${COLORS.baseText} italic text-lg border-l-4 border-teal-400 pl-4`}>
      “{quote.text}”
    </blockquote>

    <cite className={`${COLORS.subtleText} text-sm mt-3 block`}>
      - {quote.author}
    </cite>
  </motion.div>
);


// -------------------- GOALS (LOCAL STORAGE ENABLED) --------------------
const GoalsWidget = ({ goals, setGoals }) => {
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (i) => {
    setGoals(goals.filter((_, idx) => idx !== i));
  };

  return (
    <motion.div
      layout
      className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6`}
      whileHover={{ scale: 1.01 }}
    >
      <h3 className={`text-lg font-bold ${COLORS.baseText} mb-4 flex items-center`}>
        <Target className={`mr-2 ${COLORS.primary}`} /> Focus Goals
      </h3>

      <div className="space-y-3 mb-4">
        {goals.map((goal, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between bg-teal-50 p-3 rounded-xl border border-teal-100"
          >
            <span className={`text-sm ${COLORS.baseText}`}>
              {i + 1}. {goal}
            </span>

            <button
              onClick={() => removeGoal(i)}
              className="text-teal-600 hover:text-red-500 p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add a new goal..."
          className="flex-1 text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-400"
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
        />

        <button
          onClick={addGoal}
          className={`${COLORS.primaryBg} text-white px-4 py-2 rounded-xl`}
        >
          Add
        </button>
      </div>
    </motion.div>
  );
};


// -------------------- ACHIEVEMENTS --------------------
const AchievementsWidget = ({ achievements }) => (
  <motion.div
    layout
    className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6`}
    whileHover={{ scale: 1.01 }}
  >
    <h3 className={`text-lg font-bold ${COLORS.baseText} mb-4 flex items-center`}>
      <Trophy className={`${COLORS.accent} mr-2`} /> Milestones
    </h3>

    <div className="grid gap-3">
      {achievements.map((ach, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3 bg-amber-50 p-3 rounded-xl border border-amber-100"
        >
          <Star size={20} className={COLORS.accent} />
          <span className={`text-sm ${COLORS.baseText}`}>{ach}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);


// -------------------- SHARED SMALL COMPONENTS --------------------
const SliderInput = ({ label, icon: Icon, min, max, value, onChange }) => (
  <div className="w-full">
    <label className={`flex items-center text-sm font-semibold ${COLORS.baseText} mb-2`}>
      <Icon size={16} className="mr-2 text-teal-500" /> {label}
    </label>

    <div className="relative flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-lg cursor-pointer bg-teal-300"
      />
      <span className={`text-sm ${COLORS.baseText} font-bold ml-3`}>
        {value}
      </span>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-8 bg-slate-50 rounded-lg">
    <p className={`${COLORS.subtleText} italic text-sm`}>{message}</p>
  </div>
);

// -------------------- MOOD SUMMARY --------------------
const MoodSummary = ({ insights, moodEntries }) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7 = moodEntries.filter(
    (e) => new Date(e.date) >= sevenDaysAgo
  );

  const avgMoodValue =
    last7.length === 0
      ? "0/10"
      : (last7.reduce((sum, e) => sum + e.mood, 0) / last7.length).toFixed(1) +
      "/10";

  const moodTrend = insights?.moodTrend || "Stable";
  const trendIcon = moodTrend.includes("Increasing")
    ? TrendingUp
    : moodTrend.includes("Decreasing")
      ? CloudRain
      : BarChart;

  const trendColor = moodTrend.includes("Increasing")
    ? "text-teal-600"
    : moodTrend.includes("Decreasing")
      ? "text-orange-500"
      : "text-sky-500";

  return (
    <motion.div
      layout
      className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6`}
    >
      <h2 className={`text-xl font-bold ${COLORS.baseText} mb-4 flex items-center`}>
        <BarChart size={20} className={`mr-2 ${COLORS.secondary}`} />
        Your Mood Summary
      </h2>

      <div className="space-y-4">
        <InsightCard
          icon={BarChart}
          title="7-Day Avg. Mood"
          value={avgMoodValue}
          color={COLORS.primary}
        />

        <InsightCard
          icon={Flame}
          title="Current Streak"
          value={insights ? `${insights.currentStreak || 0} days` : "..."}
          color={COLORS.accent}
        />

        <InsightCard
          icon={trendIcon}
          title="Mood Trend"
          value={moodTrend}
          color={trendColor}
        />
      </div>

      <p className={`${COLORS.subtleText} text-xs mt-4`}>
        Based on your last 7 mood logs.
      </p>
    </motion.div>
  );
};


// -------------------- INSIGHT CARD --------------------
const InsightCard = ({ icon: Icon, title, value, color }) => (
  <div
    className={`flex items-center space-x-4 bg-slate-50/80 rounded-xl border border-slate-200 p-4 shadow-sm`}
  >
    <div className={`p-3 rounded-full bg-white shadow-md ${color}`}>
      <Icon size={20} />
    </div>

    <div>
      <h3 className="text-sm text-slate-500 font-medium">{title}</h3>
      <p className={`text-xl font-extrabold ${color}`}>{value}</p>
    </div>
  </div>
);


// -------------------- FUN ZONE / CALM CORNER --------------------
const FunZone = () => {
  const router = useRouter();

  return (
    <motion.div
      layout
      className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6`}
      whileHover={{ scale: 1.01 }}
    >
      <h3 className={`text-lg font-bold ${COLORS.baseText} mb-4 flex items-center`}>
        <Gamepad2 className="mr-2 text-purple-500" /> Calm Corner
      </h3>

      <div className="text-center">
        <p className={`${COLORS.subtleText} mb-4`}>
          Take a break and re-center yourself with guided activities.
        </p>

        <motion.button
          onClick={() => router.push('/anti-stress-games')}
          className={`px-5 py-3 ${COLORS.secondaryBg} text-white rounded-full font-bold shadow-md hover:bg-sky-600`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center">
            <Music size={18} className="mr-2" />
            Explore Activities
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};


// -------------------- MOOD CALENDAR --------------------
const MoodCalendar = ({ entries }) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    new Date().getFullYear()
  );

  const today = new Date();
  const firstDayOfMonth = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();
  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const getMoodColor = (mood) => {
    if (mood === 0) return "bg-slate-200 text-slate-400";
    if (mood <= 3) return "bg-orange-200 text-orange-800";
    if (mood <= 6) return "bg-yellow-200 text-yellow-800";
    if (mood <= 8) return "bg-green-300 text-green-800";
    return "bg-teal-400 text-white";
  };

  const getMoodForDay = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const entry = entries.find(
      (e) =>
        new Date(e.date).toDateString() === date.toDateString()
    );
    return entry ? entry.mood : null;
  };

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    if (
      nextYear > today.getFullYear() ||
      (nextYear === today.getFullYear() && nextMonth > today.getMonth())
    ) {
      return;
    }

    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  const isNextDisabled = () => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    return (
      nextYear > today.getFullYear() ||
      (nextYear === today.getFullYear() && nextMonth > today.getMonth())
    );
  };

  return (
    <motion.div
      layout
      className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6`}
      whileHover={{ scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${COLORS.baseText} flex items-center`}>
          <Calendar className={`mr-2 ${COLORS.secondary}`} />
          Mood Calendar
        </h3>

        <div className="flex space-x-2">
          <button
            onClick={goToPrevMonth}
            className="px-2 py-1 bg-slate-200 rounded-lg"
          >
            &lt;
          </button>

          <button
            onClick={goToNextMonth}
            disabled={isNextDisabled()}
            className="px-2 py-1 bg-slate-200 rounded-lg disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Month Label */}
      <div className="text-center mb-4">
        <span className="text-xl font-bold text-slate-800">
          {new Date(currentYear, currentMonth).toLocaleDateString(
            "en-US",
            { month: "long", year: "numeric" }
          )}
        </span>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className={`text-xs font-semibold ${COLORS.primary} py-1`}
          >
            {d}
          </div>
        ))}

        {/* Padding */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`pad-${i}`} className="w-8 h-8" />
        ))}

        {/* Dates */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const mood = getMoodForDay(day) ?? 0;

          return (
            <motion.div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-200 ${getMoodColor(
                mood
              )}`}
              whileHover={{
                scale: 1.15,
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {day}
            </motion.div>
          );
        })}
      </div>

      {/* Mood Key */}
      <div className="mt-6 text-center">
        <div className="text-sm font-semibold mb-2 text-slate-700">
          Mood Key (1–10)
        </div>

        <div className="flex justify-between text-xs text-slate-500">
          <span className="bg-orange-200 p-1 rounded-sm">1–3 😞</span>
          <span className="bg-yellow-200 p-1 rounded-sm">4–6 🙂</span>
          <span className="bg-green-300 p-1 rounded-sm">7–8 😊</span>
          <span className="bg-teal-400 p-1 rounded-sm text-white">
            9–10 🤩
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// -------------------- EXPORT + SHARE (SCREENSHOT) --------------------
const ExportShareWidget = ({ moodEntries }) => {
  // const [isCapturing, setIsCapturing] = useState(false);

  // const handleShare = async () => {
  //   try {
  //     setIsCapturing(true);
  //     
  //     // Select the core dashboard area
  //     const dashboard = document.querySelector("main");
  //     if (!dashboard) {
  //       alert("Unable to capture screenshot");
  //       setIsCapturing(false);
  //       return;
  //     }

  //     // Capture screenshot with better color handling
  //     const canvas = await html2canvas(dashboard, {
  //       scale: 2,
  //       backgroundColor: '#ffffff',
  //       useCORS: true,
  //       logging: false,
  //       allowTaint: true,
  //       ignoreElements: (element) => {
  //         // Ignore certain problematic elements if needed
  //         return false;
  //       }
  //     });

  //     // Convert canvas to blob/file
  //     canvas.toBlob(async (blob) => {
  //       try {
  //         if (!blob) {
  //           alert("Failed to capture image");
  //           setIsCapturing(false);
  //           return;
  //         }

  //         const file = new File([blob], "mood_dashboard.png", {
  //           type: "image/png",
  //         });

  //         const shareData = {
  //           title: "My Mood Tracking Progress",
  //           text: `Here's a snapshot of my Oasis Wellness Dashboard 🌿\nMood logs: ${moodEntries.length}`,
  //           files: [file],
  //         };

  //         // If device supports file sharing
  //         if (navigator.canShare && navigator.canShare({ files: [file] })) {
  //           await navigator.share(shareData);
  //         } else {
  //           // Fallback: download image
  //           const link = document.createElement("a");
  //           link.href = canvas.toDataURL();
  //           link.download = "mood_dashboard.png";
  //           link.click();

  //           alert("Screenshot downloaded. Your browser does not support direct sharing.");
  //         }
  //         setIsCapturing(false);
  //       } catch (err) {
  //         console.error("Blob conversion error:", err);
  //         alert("Failed to process screenshot");
  //         setIsCapturing(false);
  //       }
  //     });
  //   } catch (err) {
  //     console.error("Share Error:", err);
  //     alert("Failed to capture screenshot. Please try again.");
  //     setIsCapturing(false);
  //   }
  // };

  const handleShare = () => {
    // Simple fallback: share the dashboard link
    const shareData = {
      title: "My Mood Tracking Progress",
      text: `Check out my Oasis Wellness Dashboard 🌿\nMood logs: ${moodEntries.length}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log('Share cancelled:', err));
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <motion.div
      layout
      className={`${COLORS.cardBg} rounded-3xl shadow-xl ${COLORS.cardBorder} border p-6`}
      whileHover={{ scale: 1.01 }}
    >
      <h3 className={`text-lg font-bold ${COLORS.baseText} mb-4 flex items-center`}>
        <Share2 className={`mr-2 ${COLORS.primary}`} /> Share Progress
      </h3>

      <motion.button
        onClick={handleShare}
        className={`w-full px-4 py-3 ${COLORS.secondaryBg} text-white rounded-xl font-semibold shadow-md hover:bg-sky-600 flex items-center justify-center gap-2`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <>
          <Share2 size={18} />
          Share Progress
        </>
      </motion.button>
    </motion.div>
  );
};
