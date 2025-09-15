'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '../../components/ChatWindow';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm Mental Buddy, your AI wellness companion. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, loading, router]);

  const handleSend = async (messageText) => {
    // Add user message
    const userMessage = {
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Convert messages to the format expected by the API
      const apiMessages = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.text
      }));

      // Get AI response from backend
      const response = await api.generateResponse(messageText, apiMessages, null, user?.uid);
      
      const aiResponse = {
        text: response.reply,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response if API fails
      const fallbackResponse = {
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navigation currentPage="chat" />

      {/* Chat Interface */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Chat Window */}
          <div className="lg:col-span-3 h-full">
            <ChatWindow messages={messages} onSend={handleSend} isLoading={isLoading} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSend("I'm feeling anxious")}
                  className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  😰 I&apos;m feeling anxious
                </button>
                <button
                  onClick={() => handleSend("I need help with stress")}
                  className="w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  😤 I need help with stress
                </button>
                <button
                  onClick={() => handleSend("I want to talk about my mood")}
                  className="w-full text-left px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  😔 I want to talk about my mood
                </button>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Resources</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">• National Suicide Prevention: 9152987821</p>
                <a href="https://icallhelpline.org/" className="text-gray-600">• Mental Health India</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
