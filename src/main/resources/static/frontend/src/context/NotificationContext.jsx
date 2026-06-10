import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [tickerMessage, setTickerMessage] = useState("Welcome to Campus Event & Hackathon Platform! Register now for upcoming events.");
  const [activeAlert, setActiveAlert] = useState(null);
  const { user, token } = useAuth();
  const wsRef = useRef(null);

  useEffect(() => {
    if (!token || !user) {
      setNotifications([]);
      if (wsRef.current) wsRef.current.close();
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        setNotifications(response.data);
        if (response.data.length > 0) setTickerMessage(response.data[0].message);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    const ws = new WebSocket('ws://localhost:8000/ws/notifications');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SYSTEM') { console.log(data.message); return; }
        if (data.recipientEmail === 'ALL' || data.recipientEmail === user.email) {
          const isAdmin = user && user.role === 'ROLE_ADMIN';
          if (!isAdmin && data.message && data.message.startsWith('New registration:')) {
            return;
          }
          const newNote = { id: data.id, message: data.message, type: data.type, createdAt: data.createdAt };
          setNotifications(prev => [newNote, ...prev]);
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

  return (
    <NotificationContext.Provider value={{ notifications, tickerMessage, activeAlert, setTickerMessage, setActiveAlert }}>
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