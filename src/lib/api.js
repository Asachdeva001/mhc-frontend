// API configuration for connecting to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Using auth token for API call to:', endpoint);
    } else {
      console.log('⚠️ No auth token found for API call to:', endpoint);
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('❌ API error response:', errorData);
      throw new Error(errorData.error || 'API request failed');
    }

    const data = await response.json();
    console.log('✅ API success for', endpoint, ':', data);
    return data;
  } catch (error) {
    console.error('❌ API Call Error for', endpoint, ':', error);
    throw error;
  }
};

// API functions
export const api = {
  // Generate AI response
  generateResponse: async (message, messages = [], imageUrl = null, userId = null) => {
    return apiCall('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        message,
        messages,
        imageUrl,
        userId,
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
          id: 'gratitude-journal',
          title: 'Gratitude Journaling',
          description: 'Write down three things you are grateful for today',
          duration: '10 minutes',
          category: 'Reflection',
          difficulty: 'Easy',
          completed: false,
        },
        {
          id: 'walk-outside',
          title: 'Take a Walk Outside',
          description: 'Get some fresh air and gentle movement',
          duration: '15 minutes',
          category: 'Physical',
          difficulty: 'Easy',
          completed: false,
        },
        {
          id: 'guided-meditation',
          title: 'Guided Meditation',
          description: 'Listen to a calming meditation session',
          duration: '10 minutes',
          category: 'Mindfulness',
          difficulty: 'Medium',
          completed: false,
        },
      ];
      return allActivities;
    },
    
    completeActivity: async (activityId, notes = '') => {
      // Mock completion success without hitting backend
      return { success: true, activityId, notes };
    },
    
    getActivityHistory: async (days = 7) => {
      return apiCall(`/api/activities/history?days=${days}`);
    },
  },

  // Health check
  healthCheck: async () => {
    return apiCall('/health');
  },
};

export default api;
