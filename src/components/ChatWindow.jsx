'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Bot } from 'lucide-react';

// Voice Assistant Hook using Web Speech API
const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    setVoiceSupported(speechRecognitionSupported && speechSynthesisSupported);

    if (speechSynthesisSupported) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const startListening = (onResult, onError) => {
    if (!voiceSupported) {
      onError?.('Voice recognition is not supported in your browser');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult?.(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        onError?.(event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      onError?.(error.message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text, onEnd) => {
    if (!voiceSupported || !synthesisRef.current) {
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      onEnd?.();
    };

    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isListening,
    isSpeaking,
    voiceSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
};

// Component to format assistant messages with better structure
const FormattedMessage = ({ text, sender, buttons }) => {
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
      
      {/* Render buttons if provided */}
      {buttons && buttons.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {buttons.map((button, index) => (
            <a
              key={index}
              href={button.url}
              className="inline-flex items-center px-5 py-2.5 bg-sanctuary-sage hover:bg-sanctuary-sage-dark text-white text-sm font-quicksand font-medium rounded-full transition-sanctuary shadow-sanctuary hover:shadow-sanctuary-hover touch-target"
            >
              {button.icon && <span className="mr-2">{button.icon}</span>}
              {button.label}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// Avatar component for professional appearance
const Avatar = ({ sender }) => {
  if (sender === 'user') {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
        U
      </div>
    );
  }
  
  // Handle both 'ai' and 'assistant' sender types
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
      🧠
    </div>
  );
};

export default function ChatWindow({ messages = [], onSend, isLoading = false, autoSpeakResponse = false }) {
  const [inputMessage, setInputMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [lastUserMessageWasVoice, setLastUserMessageWasVoice] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageCountRef = useRef(messages.length);

  // Voice assistant hook
  const {
    isListening,
    isSpeaking,
    voiceSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  } = useVoiceAssistant();

  // Effect to auto-scroll to the bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  // Auto-speak AI responses if the last user message was voice
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      const latestMessage = messages[messages.length - 1];
      
      if (latestMessage.sender === 'ai' && (lastUserMessageWasVoice || autoSpeakResponse)) {
        // Speak the AI response automatically
        speak(latestMessage.text);
      }
      
      lastMessageCountRef.current = messages.length;
    }
  }, [messages, lastUserMessageWasVoice, autoSpeakResponse, speak]);

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
      setLastUserMessageWasVoice(false); // Text message, not voice
    }
  };

  const handleVoiceSend = () => {
    startListening(
      (transcript) => {
        if (transcript && onSend) {
          onSend(transcript);
          setLastUserMessageWasVoice(true); // Voice message
        }
      },
      (error) => {
        console.error('Voice input error:', error);
        alert('Voice input failed. Please check your microphone permissions.');
      }
    );
  };

  const handleReadAloud = (text) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-sanctuary-sand rounded-3xl shadow-sanctuary border border-sanctuary-misty/30">
      {/* Header - Glassmorphism */}
      <div className="glass-morphism text-sanctuary-slate p-3 sm:p-4 md:p-5 rounded-t-3xl border-b border-sanctuary-misty/20">
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-3xl bg-sanctuary-sage/20 flex items-center justify-center transition-sanctuary hover:bg-sanctuary-sage/30">
            <span className="text-xl sm:text-2xl">🌿</span>
          </div>
          <div className="text-center">
            <h3 className="font-quicksand font-semibold text-lg sm:text-xl text-sanctuary-slate">Mental Buddy</h3>
            <p className="text-sanctuary-slate/70 text-xs sm:text-sm leading-relaxed">Your Digital Sanctuary</p>
          </div>
        </div>
      </div>

      {/* Messages Container - Fixed height with scroll */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 min-h-0 sanctuary-scrollbar relative bg-sanctuary-sand"
      >
        {messages.length === 0 ? (
          <div className="text-center text-sanctuary-slate mt-6 sm:mt-12 px-2">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-sanctuary-sage/10 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-4 sm:mb-6 neumorphic">
              🌿
            </div>
            <h3 className="text-xl sm:text-2xl font-quicksand font-semibold mb-2 sm:mb-3 text-sanctuary-slate px-2">Welcome to Your Digital Sanctuary</h3>
            <p className="text-sanctuary-slate/70 max-w-md mx-auto leading-relaxed sm:leading-loose font-nunito text-sm sm:text-base px-2">
              This is your safe, private space for mental wellness. 
              Share what's on your mind—I'm here to listen without judgment.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
              <span className="bg-sanctuary-sage/20 text-sanctuary-slate px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-quicksand transition-sanctuary hover:bg-sanctuary-sage/30">🔒 Confidential</span>
              <span className="bg-sanctuary-misty/30 text-sanctuary-slate px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-quicksand transition-sanctuary hover:bg-sanctuary-misty/50">💚 Empathetic</span>
              <span className="bg-sanctuary-sage-light/20 text-sanctuary-slate px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-quicksand transition-sanctuary hover:bg-sanctuary-sage-light/30">🤝 Non-judgmental</span>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 sm:space-x-3 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <Avatar sender={message.sender} />
              </div>
              <div className={`flex flex-col min-w-0 flex-1 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-full sm:max-w-md lg:max-w-lg px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-sanctuary transition-sanctuary ${
                    message.sender === 'user'
                      ? 'bg-[#52796F] text-white rounded-br-md shadow-lg'
                      : 'neumorphic text-sanctuary-slate rounded-bl-md'
                  }`}
                >
                  <div className={`${message.sender === 'user' ? 'text-white' : 'text-sanctuary-slate'}`}>
                    <FormattedMessage text={message.text} sender={message.sender} buttons={message.buttons} />
                  </div>
                  
                  {/* Read Aloud Button */}
                  {voiceSupported && (
                    <button
                      onClick={() => handleReadAloud(message.text)}
                      className={`mt-1.5 sm:mt-2 flex items-center space-x-1 text-xs ${
                        message.sender === 'user' 
                          ? 'text-white/80 hover:text-white' 
                          : 'text-slate-500 hover:text-slate-700'
                      } transition-colors`}
                      title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                    >
                      {isSpeaking ? (
                        <>
                          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                          <span>Read aloud</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className={`mt-1 sm:mt-2 px-1 sm:px-2 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <span className="text-xs text-sanctuary-slate/60 font-quicksand font-medium">
                    {message.sender === 'user' ? 'You' : 'Your Companion'}
                  </span>
                  <span className="text-xs text-sanctuary-slate/40 ml-1 sm:ml-2 font-nunito">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="flex-shrink-0">
              <Avatar sender="assistant" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="neumorphic px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl rounded-bl-md">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 bg-sanctuary-sage rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-sanctuary-sage rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2.5 h-2.5 bg-sanctuary-sage rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <span className="text-xs sm:text-sm text-sanctuary-slate/70 font-nunito">Reflecting...</span>
                </div>
              </div>
              <div className="mt-1 sm:mt-2 px-1 sm:px-2">
                <span className="text-xs text-sanctuary-slate/60 font-quicksand font-medium">Your Companion</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 bg-sanctuary-sage hover:bg-sanctuary-sage-dark text-black p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-sanctuary hover:shadow-sanctuary-hover transition-sanctuary z-10 touch-target"
            title="Scroll to bottom"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Input Area - Fixed at bottom with glassmorphism */}
      <div className="border-t border-sanctuary-misty/20 p-3 sm:p-4 md:p-6 flex-shrink-0 glass-morphism rounded-b-3xl">
        {/* Voice Input Status */}
        {isListening && (
          <div className="mb-2 sm:mb-3 flex items-center justify-center space-x-2 text-xs sm:text-sm text-sanctuary-sage animate-pulse">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <span className="font-quicksand font-medium">Listening... Speak now</span>
          </div>
        )}
        
        <div className="flex space-x-2 sm:space-x-3">
          {/* Voice Input Button */}
          {voiceSupported && (
            <button
              onClick={isListening ? stopListening : handleVoiceSend}
              disabled={isLoading}
              className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl font-quicksand font-medium shadow-lg transition-sanctuary flex items-center space-x-1.5 sm:space-x-2 touch-target text-sm sm:text-base ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white pulse-gentle'
                  : 'bg-[#52796F] hover:bg-[#3d5a52] text-white shadow-sanctuary-hover'
              } disabled:bg-sanctuary-misty/50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Voice</span>
                </>
              )}
            </button>
          )}
          
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            disabled={isListening}
            className="flex-1 min-w-0 px-4 py-2.5 sm:px-6 sm:py-3 border border-sanctuary-misty/40 text-sanctuary-slate rounded-full focus:outline-none focus-sanctuary transition-sanctuary bg-white/90 shadow-sanctuary disabled:bg-sanctuary-misty/20 disabled:cursor-not-allowed font-nunito leading-relaxed placeholder:text-sanctuary-slate/40 text-sm sm:text-base"
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading || isListening}
            className={`w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center bg-[#52796F] text-white rounded-full hover:bg-[#3d5a52] disabled:bg-sanctuary-misty/50 disabled:cursor-not-allowed transition-sanctuary shadow-lg hover:shadow-xl touch-target flex-shrink-0 ${
              inputMessage.trim() && !isLoading && !isListening ? 'pulse-gentle' : ''
            }`}
            title="Send message"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendHorizonal className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
        <div className="mt-2 sm:mt-3 text-xs text-sanctuary-slate/50 text-center flex flex-wrap items-center justify-center gap-1 sm:gap-2 font-nunito">
          <span className="flex items-center space-x-1">
            <span>🔒</span>
            <span>Your conversations are private and confidential</span>
          </span>
          {voiceSupported && (
            <>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span>Voice enabled</span>
              </span>
            </>
          )}
        </div>
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