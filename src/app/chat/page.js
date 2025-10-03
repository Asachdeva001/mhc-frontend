'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ChatWindow from '../../components/ChatWindow';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Loader2, Feather, HeartPulse, BrainCircuit, Phone, BookOpen } from 'lucide-react';

const mindfulQuotes = [
  "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
  "Feelings are much like waves, we can't stop them from coming but we can choose which one to surf.",
  "You don't have to control your thoughts. You just have to stop letting them control you.",
  "The best way to capture moments is to pay attention. This is how we cultivate mindfulness."
];

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [dailyQuote] = useState(() => mindfulQuotes[Math.floor(Math.random() * mindfulQuotes.length)]);

  // Effect to set the initial welcome message only once
  useEffect(() => {
    setMessages([
      {
        text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm Buddy, your AI wellness companion. What's on your mind today?`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [user]); // Reruns only if the user object changes

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, loading, router]);

  const handleSend = async (messageText) => {
    const userMessage = {
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsAiTyping(true);

    try {
      const apiMessages = newMessages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.text
      }));

      const response = await api.generateResponse(messageText, apiMessages, null, user?.uid);
      
      const aiResponse = {
        text: response.reply,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const fallbackResponse = {
        text: "I'm sorry, I'm having trouble connecting right now. Please check your connection and try again.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsAiTyping(false);
    }
  };

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-teal-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-50">
      <Navigation currentPage="chat" />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
          
          {/* Main Chat Window */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <ChatWindow messages={messages} onSend={handleSend} isAiTyping={isAiTyping} />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col space-y-6 overflow-y-auto">
            <SidebarCard title="Conversation Starters">
              <SidebarButton icon={Feather} text="I'm feeling anxious" onSend={handleSend} />
              <SidebarButton icon={HeartPulse} text="I need help with stress" onSend={handleSend} />
              <SidebarButton icon={BrainCircuit} text="Let's do a mindfulness exercise" onSend={handleSend} />
            </SidebarCard>
            
            <SidebarCard title="Today's Focus">
                <div className="flex items-start space-x-3">
                    <BookOpen className="h-8 w-8 text-teal-600 flex-shrink-0 mt-1" />
                    <p className="text-slate-600 italic">“{dailyQuote}”</p>
                </div>
            </SidebarCard>

            <SidebarCard title="Find Support">
                <p className="text-sm text-slate-600 mb-3">If you're in distress, please reach out. You are not alone.</p>
                <a href="tel:9152987821" className="flex items-center space-x-3 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                    <Phone size={16}/>
                    <span>Vandrevala Foundation</span>
                </a>
            </SidebarCard>
          </aside>
        </div>
      </main>
    </div>
  );
}

// --- Sidebar Helper Components ---
const SidebarCard = ({ title, children }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 p-5"
    >
        <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
        <div className="space-y-2">{children}</div>
    </motion.div>
);

const SidebarButton = ({ icon: Icon, text, onSend }) => (
    <button
        onClick={() => onSend(text)}
        className="w-full flex items-center space-x-3 text-left px-3 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-200/70 transition-colors"
    >
        <Icon size={18} className="text-teal-600" />
        <span className="text-sm">{text}</span>
    </button>
);