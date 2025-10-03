'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Bot } from 'lucide-react';

export default function ChatWindow({ messages = [], onSend, isAiTyping }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Effect to auto-scroll to the bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSend(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Message Display Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <motion.div
            className="space-y-4"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
        >
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          <AnimatePresence>
            {isAiTyping && <TypingIndicator />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </motion.div>
      </div>

      {/* Input Form Area */}
      <div className="p-4 border-t border-slate-200/80">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 w-full px-4 py-2 bg-slate-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            disabled={isAiTyping}
          />
          <button
            type="submit"
            disabled={isAiTyping || !inputText.trim()}
            className="p-2 bg-teal-600 text-white rounded-full transition-colors transform hover:scale-110 disabled:bg-slate-300 disabled:scale-100"
          >
            <SendHorizonal size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Child Components for ChatWindow ---
const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <motion.div
        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
        className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-teal-700"/>
        </div>
      )}
      <div
        className={`max-w-md px-4 py-2 rounded-2xl ${
          isUser
            ? 'bg-teal-600 text-white rounded-br-lg'
            : 'bg-slate-100 text-slate-800 rounded-bl-lg'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-end gap-2"
    >
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-teal-700"/>
        </div>
        <div className="px-4 py-3 rounded-2xl rounded-bl-lg bg-slate-100 flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
        </div>
    </motion.div>
);