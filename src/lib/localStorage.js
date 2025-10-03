'use client';

// Utility functions for localStorage with error handling and data validation

export const storage = {
  // Get data from localStorage with fallback
  get: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  // Set data in localStorage with error handling
  set: (key, value) => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },

  // Remove data from localStorage
  remove: (key) => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
      return false;
    }
  },

  // Clear all localStorage data (be careful with this)
  clear: () => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Specific storage keys for the app
export const STORAGE_KEYS = {
  CHAT_MESSAGES: 'mentalBuddy_chatMessages',
  ACTIVITIES: 'mentalBuddy_activities',
  MOOD_ENTRIES: 'mentalBuddy_moodEntries',
  MOOD_INSIGHTS: 'mentalBuddy_moodInsights',
  TODAY_MOOD: 'mentalBuddy_todayMood',
  USER_PREFERENCES: 'mentalBuddy_userPreferences'
};

// Chat messages storage
export const chatStorage = {
  getMessages: (userId) => {
    const messages = storage.get(`${STORAGE_KEYS.CHAT_MESSAGES}_${userId}`, []);
    return messages;
  },

  saveMessages: (userId, messages) => {
    return storage.set(`${STORAGE_KEYS.CHAT_MESSAGES}_${userId}`, messages);
  },

  clearMessages: (userId) => {
    return storage.remove(`${STORAGE_KEYS.CHAT_MESSAGES}_${userId}`);
  }
};

// Activities storage
export const activitiesStorage = {
  getActivities: (userId) => {
    const activities = storage.get(`${STORAGE_KEYS.ACTIVITIES}_${userId}`, []);
    return activities;
  },

  saveActivities: (userId, activities) => {
    return storage.set(`${STORAGE_KEYS.ACTIVITIES}_${userId}`, activities);
  },

  clearActivities: (userId) => {
    return storage.remove(`${STORAGE_KEYS.ACTIVITIES}_${userId}`);
  }
};

// Mood entries storage
export const moodStorage = {
  getEntries: (userId) => {
    const entries = storage.get(`${STORAGE_KEYS.MOOD_ENTRIES}_${userId}`, []);
    return entries;
  },

  saveEntries: (userId, entries) => {
    return storage.set(`${STORAGE_KEYS.MOOD_ENTRIES}_${userId}`, entries);
  },

  getInsights: (userId) => {
    const insights = storage.get(`${STORAGE_KEYS.MOOD_INSIGHTS}_${userId}`, null);
    return insights;
  },

  saveInsights: (userId, insights) => {
    return storage.set(`${STORAGE_KEYS.MOOD_INSIGHTS}_${userId}`, insights);
  },

  getTodayMood: (userId) => {
    const todayMood = storage.get(`${STORAGE_KEYS.TODAY_MOOD}_${userId}`, null);
    return todayMood;
  },

  saveTodayMood: (userId, todayMood) => {
    return storage.set(`${STORAGE_KEYS.TODAY_MOOD}_${userId}`, todayMood);
  },

  clearMoodData: (userId) => {
    storage.remove(`${STORAGE_KEYS.MOOD_ENTRIES}_${userId}`);
    storage.remove(`${STORAGE_KEYS.MOOD_INSIGHTS}_${userId}`);
    storage.remove(`${STORAGE_KEYS.TODAY_MOOD}_${userId}`);
  }
};

// User preferences storage
export const preferencesStorage = {
  getPreferences: (userId) => {
    const preferences = storage.get(`${STORAGE_KEYS.USER_PREFERENCES}_${userId}`, {
      theme: 'light',
      notifications: true,
      autoSave: true
    });
    return preferences;
  },

  savePreferences: (userId, preferences) => {
    return storage.set(`${STORAGE_KEYS.USER_PREFERENCES}_${userId}`, preferences);
  }
};

// Cleanup function to remove old or invalid data
export const cleanupStorage = (userId) => {
  if (!userId) return;
  
  // Remove any data that doesn't belong to the current user
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('mentalBuddy_') && !key.includes(`_${userId}`)) {
      // Check if this is old data (older than 30 days)
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.timestamp) {
          const dataAge = Date.now() - new Date(data.timestamp).getTime();
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (dataAge > thirtyDays) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // If we can't parse the data, remove it
        localStorage.removeItem(key);
      }
    }
  });
};

// Export a function to clear all app data for a user
export const clearUserData = (userId) => {
  if (!userId) return;
  
  chatStorage.clearMessages(userId);
  activitiesStorage.clearActivities(userId);
  moodStorage.clearMoodData(userId);
  storage.remove(`${STORAGE_KEYS.USER_PREFERENCES}_${userId}`);
};
