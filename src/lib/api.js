// API configuration for connecting to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to refresh token
const refreshAuthToken = async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw new Error('No user data found');
    }

    const userData = JSON.parse(storedUser);
    const newTimestamp = Date.now();
    const newToken = btoa(`${userData.uid}:${newTimestamp}`);
    
    localStorage.setItem('mental_buddy_token', newToken);
    console.log('🔄 Token refreshed successfully');
    return newToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    throw error;
  }
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}, isRetry = false) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mental_buddy_token');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Sending Token:', token.substring(0, 20) + '... (length: ' + token.length + ')');
      console.log('🌐 API call to:', endpoint);
    } else {
      console.log('⚠️ No auth token found for API call to:', endpoint);
      // If no token and not a public endpoint, redirect to signin
      if (!endpoint.includes('/signin') && !endpoint.includes('/signup')) {
        console.error('❌ Missing token - redirecting to signin');
        window.location.href = '/auth/signin';
        throw new Error('Authentication required');
      }
    }
  }

  try {
    console.log('🌐 Making API call to:', url);
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    console.log('📡 API response status:', response.status, 'for', endpoint);

    // Handle 401 - Token expired
    if (response.status === 401 && !isRetry) {
      console.log('🔐 Token expired, attempting refresh...');
      try {
        await refreshAuthToken();
        // Retry the request with new token
        return apiCall(endpoint, options, true);
      } catch (refreshError) {
        console.error('❌ Token refresh failed, redirecting to signin');
        // Clear auth data and redirect
        localStorage.removeItem('mental_buddy_token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
        throw new Error('Authentication expired. Please sign in again.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      // console.error('❌ API error response:', errorData);
      throw new Error(errorData.error || 'API request failed');
    }

    const data = await response.json();
    console.log('✅ API success for', endpoint, ':', data);
    return data;
  } catch (error) {
    // console.error("API call error ");
    // console.error('❌ API Call Error for', endpoint, ':', error);
    throw error;
  }
};

// API functions
export const api = {
  // Generate AI response
  generateResponse: async (message, messages = [], imageUrl = null, userId = null, facialEmotion = null, multiModalData = null) => {
    return apiCall('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        message,
        messages,
        imageUrl,
        userId,
        facialEmotion,
        multiModalData,
      }),
    });
  },

  // Chat conversation endpoints
  chat: {
    saveConversation: async (messages, sessionId = null) => {
      return apiCall('/api/generate/save-conversation', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          sessionId,
        }),
      });
    },

    getConversations: async (limit = 10) => {
      return apiCall(`/api/generate/conversations?limit=${limit}`);
    },

    getConversation: async (sessionId) => {
      return apiCall(`/api/generate/conversation/${sessionId}`);
    },

    deleteConversation: async (sessionId) => {
      return apiCall(`/api/generate/conversation/${sessionId}`, {
        method: 'DELETE',
      });
    },
  },

  // Auth endpoints
  auth: {
    signup: async (userData) => {
      return apiCall('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    
    signin: async (credentials) => {
      return apiCall('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    
    getProfile: async () => {
      return apiCall('/api/auth/profile');
    },
    
    updateProfile: async (profileData) => {
      return apiCall('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
    
  },

  // Mood endpoints
  mood: {
    logMood: async (moodData) => {
      return apiCall('/api/mood/log', {
        method: 'POST',
        body: JSON.stringify(moodData),
      });
    },
    
    getMoodEntries: async (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      return apiCall(`/api/mood/entries${queryParams ? `?${queryParams}` : ''}`);
    },
    
    getMoodInsights: async (days = 7) => {
      return apiCall(`/api/mood/insights?days=${days}`);
    },
    
    getTodayMood: async () => {
      return apiCall('/api/mood/today');
    },
  },

  // Activities endpoints
  activities: {
    getTodayActivities: async () => {
      // Use custom local activities for now (no backend call)
      const allActivities = [
        {
          id: 'breathing-exercise',
          title: '5-Minute Breathing Exercise',
          description: 'Practice deep breathing to reduce stress and anxiety',
          duration: '5 minutes',
          category: 'Mindfulness',
          difficulty: 'Easy',
          completed: false,
        },
        {
          id: 'meditation',
          title: 'Guided Meditation',
          description: 'Listen to a calming meditation session',
          duration: '10 minutes',
          category: 'Mindfulness',
          difficulty: 'Medium',
          completed: false,
        },
        {
          id: 'doodle',
          title: 'Free-form Doodling',
          description: 'Let your creativity flow with simple drawing',
          duration: '10 minutes',
          category: 'Creative',
          difficulty: 'Easy',
          completed: false,
        },
        {
          id: 'music-listening',
          title: 'Music Therapy',
          description: 'Listen to music that matches or improves your mood',
          duration: '15 minutes',
          category: 'Creative',
          difficulty: 'Easy',
          completed: false,
        },
        {
          id: 'stretching',
          title: 'Gentle Stretching',
          description: 'Release tension with simple stretches',
          duration: '10 minutes',
          category: 'Physical',
          difficulty: 'Easy',
          completed: false,
        },
        {
          id: 'dance-break',
          title: 'Dance Break',
          description: 'Put on your favorite song and move your body',
          duration: '5 minutes',
          category: 'Physical',
          difficulty: 'Easy',
          completed: false,
        },
      ];
      return allActivities;
    },
    
    // Save activity session state (auto-save during activity)
    saveActivitySession: async (sessionData) => {
      return apiCall('/api/activities/session/save', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
    },

    // Retrieve latest activity session
    getActivitySession: async (activityId) => {
      return apiCall(`/api/activities/session/${activityId}`);
    },
    
    completeActivity: async (activityId, notes = '') => {
      // Mock completion success without hitting backend
      return { success: true, activityId, notes };
    },
    
    getActivityHistory: async (days = 7) => {
      return apiCall(`/api/activities/history?days=${days}`);
    },
  },

  // User settings endpoints
  user: {
    getProfile: async () => {
      return apiCall('/api/user/profile');
    },
    
    updateProfile: async (profileData) => {
      return apiCall('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
    
    updatePassword: async (passwordData) => {
      return apiCall('/api/user/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
    },
    
    deleteConversations: async () => {
      return apiCall('/api/user/conversations', {
        method: 'DELETE',
      });
    },
    
    deleteJournals: async () => {
      return apiCall('/api/user/journals', {
        method: 'DELETE',
      });
    },
    
    deleteAccount: async (confirmEmail) => {
      return apiCall('/api/user/account', {
        method: 'DELETE',
        body: JSON.stringify({ confirmEmail }),
      });
    },
  },

  // Health check
  healthCheck: async () => {
    return apiCall('/health');
  },
};

export default api;
