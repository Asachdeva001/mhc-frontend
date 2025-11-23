'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
import { clearUserData } from './localStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('mental_buddy_token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('🔐 Existing session found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid data
        localStorage.removeItem('mental_buddy_token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signUp = async (email, password, name) => {
    try {
      const response = await api.auth.signup({ email, password, name });
      
      if (response.sessionToken) {
        setToken(response.sessionToken);
        setUser(response.user);
        
        // Store in localStorage for persistence
        localStorage.setItem('mental_buddy_token', response.sessionToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        console.log('✅ Sign up successful, token saved:', response.sessionToken.substring(0, 20) + '...');
        
        return { success: true, user: response.user };
      }
      
      throw new Error(response.error || 'Signup failed');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await api.auth.signin({ email, password });
      
      if (response.sessionToken) {
        setToken(response.sessionToken);
        setUser(response.user);
        
        // Store in localStorage for persistence using the correct key
        localStorage.setItem('mental_buddy_token', response.sessionToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        console.log('✅ Sign in successful, token saved:', response.sessionToken.substring(0, 20) + '...');
        
        return { success: true, user: response.user };
      }
      
      throw new Error('No token received');
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (idToken) => {
    try {
      const response = await api.auth.googleSignIn({ idToken });
      
      if (response.sessionToken) {
        setToken(response.sessionToken);
        setUser(response.user);
        
        // Store in localStorage for persistence
        localStorage.setItem('mental_buddy_token', response.sessionToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        console.log('✅ Google sign in successful');
        
        return { success: true, user: response.user };
      }
      
      throw new Error('No token received from Google sign-in');
    } catch (error) {
      console.error('Google signin error:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No user data found');
      }

      const userData = JSON.parse(storedUser);
      console.log('🔄 Refreshing token for user:', userData.email);

      // Generate new token by creating a new timestamp
      const newTimestamp = Date.now();
      const newToken = btoa(`${userData.uid}:${newTimestamp}`);
      
      setToken(newToken);
      localStorage.setItem('mental_buddy_token', newToken);
      
      console.log('✅ Token refreshed successfully');
      return newToken;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      // If refresh fails, sign out the user
      await signOut();
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear user data from localStorage
      if (user?.uid) {
        clearUserData(user.uid);
      }
      
      // Clear local state
      setUser(null);
      setToken(null);
      
      // Clear auth localStorage
      localStorage.removeItem('mental_buddy_token');
      localStorage.removeItem('user');
      
      console.log('🔓 User signed out');
      
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  };

  const getCurrentUser = () => {
    return user;
  };

  const getToken = () => {
    return token;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshToken,
    getCurrentUser,
    getToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
