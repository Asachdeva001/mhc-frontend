'use client';

import { useState, useRef, useEffect } from 'react';

// Component to format assistant messages with better structure
const FormattedMessage = ({ text, sender }) => {
  if (sender === 'user') {
    return <p className="leading-relaxed">{text}</p>;
  }

  // Format assistant messages
  const formatAssistantMessage = (message) => {
    // Split message into paragraphs
    const paragraphs = message.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph contains bullet points or numbered lists
      if (paragraph.includes('•') || paragraph.includes('-') || /^\d+\./.test(paragraph)) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="mb-3">
            {lines.map((line, lineIndex) => {
              if (line.trim().startsWith('•') || line.trim().startsWith('-') || /^\s*\d+\./.test(line)) {
                return (
                  <div key={lineIndex} className="flex items-start mb-1">
                    <span className="text-blue-500 mr-2 mt-1 text-xs">●</span>
                    <span className="flex-1 leading-relaxed">{line.replace(/^[•\-\d+\.\s]+/, '')}</span>
                  </div>
                );
              }
              return <p key={lineIndex} className="leading-relaxed mb-2">{line}</p>;
            })}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="leading-relaxed mb-3 last:mb-0">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="prose prose-sm max-w-none">
      {formatAssistantMessage(text)}
    </div>
  );
};

// Avatar component for professional appearance
const Avatar = ({ sender }) => {
  if (sender === 'user') {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
        U
      </div>
    );
  }
  
  // Handle both 'ai' and 'assistant' sender types
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
      🧠
    </div>
  );
};

export default function ChatWindow({ messages = [], onSend, isLoading = false }) {
  const [inputMessage, setInputMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  const handleSend = () => {
    if (inputMessage.trim() && onSend) {
      onSend(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-2xl border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            🧠
          </div>
          <div>
            <h3 className="font-semibold text-lg">Mental Health Companion</h3>
            <p className="text-blue-100 text-sm">Your empathetic wellness guide</p>
          </div>
        </div>
      </div>

      {/* Messages Container - Fixed height with scroll */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 relative" 
        style={{ maxHeight: 'calc(100vh - 250px)' }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-slate-600 mt-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-6 shadow-lg">
              💬
            </div>
            <h3 className="text-xl font-semibold mb-2">Welcome to Your Mental Health Space</h3>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              I'm here to provide a safe, supportive space for your mental wellness journey. 
              Feel free to share what's on your mind.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Confidential</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Empathetic</span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">Non-judgmental</span>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar sender={message.sender} />
              <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-lg px-5 py-4 rounded-2xl shadow-md ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                  }`}
                >
                  <div className={`${message.sender === 'user' ? 'text-white' : 'text-slate-800'}`}>
                    <FormattedMessage text={message.text} sender={message.sender} />
                  </div>
                </div>
                <div className={`mt-1 px-2 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <span className="text-xs text-slate-500 font-medium">
                    {message.sender === 'user' ? 'You' : 'Mental Health Companion'}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <Avatar sender="assistant" />
            <div className="flex flex-col">
              <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-bl-sm shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <span className="text-sm text-slate-600 font-medium">Thinking carefully about your message...</span>
                </div>
              </div>
              <div className="mt-1 px-2">
                <span className="text-xs text-slate-500 font-medium">Mental Health Companion</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10 hover:scale-110"
            title="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-slate-200 p-6 flex-shrink-0 bg-white/70 backdrop-blur-sm rounded-b-xl">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="w-full px-5 py-3 border border-slate-300 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            )}
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500 text-center">
          Your conversations are private and confidential
        </div>
      </div>
    </div>
  );
}
