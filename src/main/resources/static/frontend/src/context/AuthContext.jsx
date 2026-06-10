import React, { createContext, useState, useContext } from 'react';
import api from '../api';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const login = async (email, password) => {
    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 2. Fetch session and details from backend
      const response = await api.post('/api/auth/login', { email, password });
      const data = response.data;

      // Store Firebase ID token so the backend filter validates it
      localStorage.setItem('token', idToken);
      localStorage.setItem('user', JSON.stringify({ email: data.email, role: data.role, teamName: data.teamName }));
      setToken(idToken);
      setUser({ email: data.email, role: data.role, teamName: data.teamName });

      // Register FCM token if stored locally
      try {
        const fcmToken = localStorage.getItem('fcmToken');
        if (fcmToken) {
          await api.put('/api/users/profile/fcm-token', { token: fcmToken });
        }
      } catch (fcmErr) {
        console.warn('Failed to register FCM token during login:', fcmErr);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || error.response?.data?.error || 'Login failed. Please check credentials.' };
    }
  };

  const signup = async (signupData) => {
    try {
      // 1. Create account in Firebase Auth
      await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);

      // 2. Synchronize user creation with backend MongoDB
      const response = await api.post('/api/auth/signup', signupData);
      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ email: data.email, role: data.role, teamName: data.teamName }));
      setToken(data.token);
      setUser({ email: data.email, role: data.role, teamName: data.teamName });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || error.response?.data?.error || 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase signout failed:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfileState = (updatedDetails) => {
    const updatedUser = { ...user, ...updatedDetails };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);