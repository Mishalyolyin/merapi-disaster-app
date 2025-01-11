// src/utils/activityLogger.js
import axios from './axios';
import WebSocketService from '../services/websocket';

export const ActivityType = {
  WARNING: 'warning',
  INFO: 'info',
  ALERT: 'alert'
};

export const logActivity = async (type, message, location) => {
  try {
    const activity = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,
      message,
      location,
    };

    const response = await axios.post('/activities', activity);
    
    // Emit melalui WebSocket untuk real-time updates
    WebSocketService.emit('activity_update', response.data);

    return response.data;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

export const getRecentActivities = async (limit = 5) => {
  try {
    const response = await axios.get(`/activities?_sort=timestamp&_order=desc&_limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Jika kurang dari 1 jam, tampilkan dalam menit
  if (hours < 1) {
    if (minutes < 1) return 'Baru saja';
    return `${minutes} menit yang lalu`;
  }
  
  // Jika kurang dari 1 hari, tampilkan dalam jam
  if (days < 1) {
    return `${hours} jam yang lalu`;
  }
  
  // Jika lebih dari 1 hari, tampilkan tanggal lengkap
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getActivityIcon = (type) => {
  switch (type) {
    case ActivityType.WARNING:
      return 'warning';
    case ActivityType.ALERT:
      return 'alert';
    default:
      return 'info';
  }
};

export const getActivityColor = (type) => {
  switch (type) {
    case ActivityType.WARNING:
      return 'yellow';
    case ActivityType.ALERT:
      return 'red';
    default:
      return 'blue';
  }
};