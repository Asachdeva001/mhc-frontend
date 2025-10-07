'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

// --- A custom tooltip for a fully themed experience ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const moodValue = payload[0].value;
    const getMoodEmoji = (mood) => {
      if (mood <= 3) return '😔';
      if (mood <= 6) return '😐';
      if (mood <= 8) return '🙂';
      return '😄';
    };

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/80 p-3">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-lg font-bold text-teal-600 flex items-center">
          {moodValue}/10
          <span className="text-xl ml-2">{getMoodEmoji(moodValue)}</span>
        </p>
      </div>
    );
  }

  return null;
};

export default function MoodGraph({ data = [] }) {
  // If there's no data, render a calming empty state.
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <BarChart3 size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Your mood graph will appear here.</p>
        <p className="text-slate-400 text-sm">Log your first entry to get started.</p>
      </div>
    );
  }

  return (
    // The parent container in DashboardPage provides the dimensions.
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: -10, // Adjust left margin to bring Y-axis labels closer
          bottom: 5,
        }}
      >
        {/* Define the beautiful gradient for our area fill */}
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        
        <YAxis 
          domain={[1, 10]}
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickCount={5} // Fewer ticks for a cleaner look
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Area 
          type="monotone" 
          dataKey="mood" 
          stroke="#14b8a6" // teal-500
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#moodGradient)" // Apply the gradient
          dot={{ stroke: '#14b8a6', strokeWidth: 2, r: 4, fill: '#fff' }}
          activeDot={{ r: 7, fill: '#14b8a6', stroke: '#fff', strokeWidth: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}