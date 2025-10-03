'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '../../components/ChatWindow';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { chatStorage } from '../../lib/localStorage';
import { messageEncryption, encryptionKeyStorage } from '../../lib/encryption';

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [encryptionPassword, setEncryptionPassword] = useState(null);
  const [isInitializingEncryption, setIsInitializingEncryption] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    } else if (isAuthenticated && user) {
      // Initialize encryption first, then load messages
      initializeEncryption();
    }
  }, [isAuthenticated, loading, router, user]);

  const initializeEncryption = async () => {
    try {
      setIsInitializingEncryption(true);
      // Generate encryption password based on user ID and device info
      const password = await messageEncryption.generateSecurePassword(user.uid);
      setEncryptionPassword(password);
      
      // Store key hash for verification
      const keyHash = await messageEncryption.generateSecurePassword(user.uid + '_hash');
      encryptionKeyStorage.storeKeyHash(user.uid, keyHash);
      
      console.log('🔐 Encryption initialized for user:', user.uid);
      
      // Load saved messages after encryption is ready
      await loadSavedMessages(password);
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      // Fallback: load messages without encryption
      await loadSavedMessages(null);
    } finally {
      setIsInitializingEncryption(false);
    }
  };

  const loadSavedMessages = async (password = null) => {
    try {
      // First try to load from localStorage for immediate display
      const savedMessages = chatStorage.getMessages(user.uid);
      let decryptedMessages = savedMessages;

      // Decrypt messages if encryption is available and messages are encrypted
      if (password && savedMessages && savedMessages.length > 0) {
        try {
          decryptedMessages = await messageEncryption.decryptMessages(savedMessages, password);
        } catch (decryptError) {
          console.warn('Failed to decrypt localStorage messages:', decryptError);
          decryptedMessages = savedMessages;
        }
      }

      if (decryptedMessages && decryptedMessages.length > 0) {
        setMessages(decryptedMessages);
        // Try to get session ID from saved messages
        const lastMessage = decryptedMessages[decryptedMessages.length - 1];
        if (lastMessage?.sessionId) {
          setSessionId(lastMessage.sessionId);
        }
      }

      // Then try to sync with backend
      try {
        const conversations = await api.chat.getConversations(1);
        if (conversations && conversations.length > 0) {
          const latestConversation = conversations[0];
          let backendMessages = latestConversation.messages;

          // Decrypt backend messages if encryption is available
          if (password && backendMessages && backendMessages.length > 0) {
            try {
              backendMessages = await messageEncryption.decryptMessages(backendMessages, password);
            } catch (decryptError) {
              console.warn('Failed to decrypt backend messages:', decryptError);
              // Use encrypted messages as fallback
              backendMessages = latestConversation.messages;
            }
          }

          setMessages(backendMessages);
          setSessionId(latestConversation.sessionId);
          // Update localStorage with decrypted backend data
          chatStorage.saveMessages(user.uid, backendMessages);
        } else if (!decryptedMessages || decryptedMessages.length === 0) {
          // Initialize with welcome message if no saved messages
          const welcomeMessage = {
            text: "Hello! I'm Mental Health Buddy, your AI wellness companion. How are you feeling today?",
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([welcomeMessage]);
          chatStorage.saveMessages(user.uid, [welcomeMessage]);
          
          // Create new session
          const newSessionId = `session_${Date.now()}`;
          setSessionId(newSessionId);
          
          // Save to backend (encrypted if password available)
          try {
            let messagesToSave = [welcomeMessage];
            if (password) {
              messagesToSave = await messageEncryption.encryptMessages([welcomeMessage], password);
            }
            await api.chat.saveConversation(messagesToSave, newSessionId);
          } catch (error) {
            console.error('Error saving initial conversation:', error);
          }
        }
      } catch (error) {
        console.warn('Backend not available, using localStorage only:', error.message);
        // If backend fails, use localStorage data
        if (!decryptedMessages || decryptedMessages.length === 0) {
          const welcomeMessage = {
            text: "Hello! I'm Mental Health Buddy, your AI wellness companion. How are you feeling today?",
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([welcomeMessage]);
          chatStorage.saveMessages(user.uid, [welcomeMessage]);
          
          // Create new session for offline mode
          const newSessionId = `session_${Date.now()}`;
          setSessionId(newSessionId);
        }
      }
    } catch (error) {
      console.error('Error loading saved messages:', error);
      // Fallback welcome message
      const welcomeMessage = {
        text: "Hello! I'm Mental Health Buddy, your AI wellness companion. How are you feeling today?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleSend = async (messageText) => {
    if (!encryptionPassword) {
      console.error('Encryption not initialized');
      return;
    }

    // Add user message
    const userMessage = {
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Save user message immediately (encrypted)
    try {
      const encryptedMessages = await messageEncryption.encryptMessages(updatedMessages, encryptionPassword);
      chatStorage.saveMessages(user.uid, encryptedMessages);
    } catch (error) {
      console.warn('Failed to encrypt messages for localStorage:', error);
      chatStorage.saveMessages(user.uid, updatedMessages);
    }
    
    setIsLoading(true);

    try {
      // Convert messages to the format expected by the API (decrypted for AI processing)
      const apiMessages = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: typeof msg.text === 'object' ? 'Encrypted message' : msg.text
      }));

      // Get AI response from backend
      const response = await api.generateResponse(messageText, apiMessages, null, user?.uid);
      
      const aiResponse = {
        text: response.reply,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      
      // Save the complete conversation (encrypted)
      try {
        const encryptedFinalMessages = await messageEncryption.encryptMessages(finalMessages, encryptionPassword);
        chatStorage.saveMessages(user.uid, encryptedFinalMessages);
        
        // Save to backend (encrypted)
        await api.chat.saveConversation(encryptedFinalMessages, sessionId);
      } catch (encryptError) {
        console.warn('Failed to encrypt messages:', encryptError);
        // Save unencrypted as fallback
        chatStorage.saveMessages(user.uid, finalMessages);
        await api.chat.saveConversation(finalMessages, sessionId);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response if API fails
      const fallbackResponse = {
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, fallbackResponse];
      setMessages(finalMessages);
      
      // Save fallback response (encrypted)
      try {
        const encryptedFallbackMessages = await messageEncryption.encryptMessages(finalMessages, encryptionPassword);
        chatStorage.saveMessages(user.uid, encryptedFallbackMessages);
        await api.chat.saveConversation(encryptedFallbackMessages, sessionId);
      } catch (encryptError) {
        console.warn('Failed to encrypt fallback messages:', encryptError);
        chatStorage.saveMessages(user.uid, finalMessages);
        await api.chat.saveConversation(finalMessages, sessionId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isInitializingEncryption) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-800 mb-2">
            {loading ? 'Loading...' : 'Initializing Encryption...'}
          </div>
          <div className="text-gray-600">
            {loading ? 'Please wait while we authenticate you' : 'Setting up secure messaging...'}
          </div>
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
            {/* Chat Controls */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Chat Controls</h3>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    const welcomeMessage = {
                      text: "Hello! I'm Mental Health Buddy, your AI wellness companion. How are you feeling today?",
                      sender: 'ai',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages([welcomeMessage]);
                    
                    // Create new session
                    const newSessionId = `session_${Date.now()}`;
                    setSessionId(newSessionId);
                    
                    // Save encrypted messages
                    try {
                      if (encryptionPassword) {
                        const encryptedMessages = await messageEncryption.encryptMessages([welcomeMessage], encryptionPassword);
                        chatStorage.saveMessages(user.uid, encryptedMessages);
                        await api.chat.saveConversation(encryptedMessages, newSessionId);
                      } else {
                        chatStorage.saveMessages(user.uid, [welcomeMessage]);
                        await api.chat.saveConversation([welcomeMessage], newSessionId);
                      }
                    } catch (error) {
                      console.warn('Backend sync failed, data saved locally:', error.message);
                    }
                  }}
                  className="w-full px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                >
                  🔄 Clear Chat
                </button>
              </div>
            </div>

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
