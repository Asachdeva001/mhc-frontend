'use client';

import { useState, useRef, useEffect } from 'react';

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

  // Auto-scroll to bottom when new messages arrive
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
                  
                  {/* Read Aloud Button */}
                  {voiceSupported && (
                    <button
                      onClick={() => handleReadAloud(message.text)}
                      className={`mt-2 flex items-center space-x-1 text-xs ${
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
        {/* Voice Input Status */}
        {isListening && (
          <div className="mb-3 flex items-center justify-center space-x-2 text-sm text-blue-600 animate-pulse">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Listening... Speak now</span>
          </div>
        )}
        
        <div className="flex space-x-3">
          {/* Voice Input Button */}
          {voiceSupported && (
            <button
              onClick={isListening ? stopListening : handleVoiceSend}
              disabled={isLoading}
              className={`px-4 py-3 rounded-xl font-medium shadow-md transition-all duration-200 flex items-center space-x-2 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-lg hover:scale-105'
              } disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:hover:scale-100`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Voice</span>
                </>
              )}
            </button>
          )}
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              disabled={isListening}
              className="w-full px-5 py-3 border border-slate-300 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading || isListening}
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
        <div className="mt-2 text-xs text-slate-500 text-center flex items-center justify-center space-x-2">
          <span>Your conversations are private and confidential</span>
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
