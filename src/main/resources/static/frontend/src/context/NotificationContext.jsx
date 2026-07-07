import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [tickerMessage, setTickerMessage] = useState("Welcome to Campus Event & Hackathon Platform! Register now for upcoming events.");
  const [activeAlert, setActiveAlert] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const { user, token } = useAuth();
  const wsRef = useRef(null);

  const fetchCoordinators = async () => {
    try {
      const response = await api.get('/api/coordinators');
      setCoordinators(response.data);
    } catch (error) {
      console.error('Error fetching coordinators:', error);
    }
  };

  useEffect(() => {
    if (!token || !user) {
      setCoordinators([]);
      return;
    }
    fetchCoordinators();
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) {
      setNotifications([]);
      if (wsRef.current) wsRef.current.close();
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        const filtered = response.data.filter(n => !n.message || !n.message.startsWith('New registration:'));
        setNotifications(filtered);
        if (filtered.length > 0) setTickerMessage(filtered[0].message);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    const wsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/ws/notifications`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'COORDINATORS_UPDATED') {
          fetchCoordinators();
          return;
        }
        if (data.type === 'SYSTEM') { console.log(data.message); return; }
        if (data.recipientEmail === 'ALL' || data.recipientEmail === user.email) {
          if (data.message && data.message.startsWith('New registration:')) {
            return;
          }
          const newNote = { id: data.id, message: data.message, type: data.type, createdAt: data.createdAt };
          setNotifications(prev => {
            if (prev.some(n => n.id === data.id)) {
              return prev.map(n => n.id === data.id ? newNote : n);
            }
            return [newNote, ...prev];
          });
          setTickerMessage(data.message);
          setActiveAlert({ message: data.message, type: data.type });
          setTimeout(() => setActiveAlert(null), 6000);
        }
      } catch (err) {
        console.log('WS Plain text:', event.data);
      }
    };

    ws.onclose = () => console.log('WebSocket disconnected');

    return () => { if (ws) ws.close(); };
  }, [token, user]);

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const editNotification = async (id, message, type) => {
    try {
      const response = await api.put(`/api/notifications/${id}?message=${encodeURIComponent(message)}&type=${type}`);
      const updated = response.data;
      setNotifications(prev => prev.map(n => n.id === id ? updated : n));
      return updated;
    } catch (error) {
      console.error('Error editing notification:', error);
      throw error;
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, tickerMessage, activeAlert, setTickerMessage, setActiveAlert, deleteNotification, editNotification, coordinators, fetchCoordinators }}>
      {children}
      {activeAlert && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce glass-effect border-l-4 border-sky-500 p-4 rounded-lg shadow-2xl max-w-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {activeAlert.type === 'SUCCESS' ? '🏆' : activeAlert.type === 'ALERT' ? '⚠️' : '📢'}
            </span>
            <div>
              <p className="text-xs uppercase text-sky-400 font-bold tracking-wider">{activeAlert.type} ALERT</p>
              <p className="text-sm font-medium text-slate-100 mt-0.5">{activeAlert.message}</p>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);