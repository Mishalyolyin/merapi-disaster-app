// src/services/websocket.js
import { io } from 'socket.io-client';
import store from '../store';
import { updateAdminStats } from '../store/disasterSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.weatherInterval = null;
    this.lastWeatherUpdate = new Date();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (this.socket) return;

    this.socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('WebSocket Connected');
      this.reconnectAttempts = 0;
      this.socket.emit('request_weather');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleReconnect();
    });

    this.setupWeatherHandlers();
    this.setupDisasterHandlers();
    this.setupActivityHandlers();
    this.setupErrorHandlers();
  }

  setupWeatherHandlers() {
    this.socket.on('weather_update', (data) => {
      try {
        const randomizedData = {
          ...data,
          temperature: parseFloat((data.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1)),
          windSpeed: parseFloat((data.windSpeed + (Math.random() * 2 - 1)).toFixed(1)),
          humidity: Math.min(100, Math.max(0, data.humidity + (Math.random() * 5 - 2.5))),
          windDirection: data.windDirection
        };
        
        this.lastWeatherUpdate = new Date();
        this.notifyListeners('weather_update', randomizedData);
      } catch (error) {
        console.error('Error processing weather update:', error);
      }
    });
  }

  setupDisasterHandlers() {
    this.socket.on('disaster_stats_update', (data) => {
      try {
        store.dispatch(updateAdminStats(data));
        this.notifyListeners('disaster_stats_update', data);
      } catch (error) {
        console.error('Error processing disaster stats:', error);
      }
    });

    this.socket.on('disaster_update', (data) => {
      try {
        this.notifyListeners('disaster_update', data);
      } catch (error) {
        console.error('Error processing disaster update:', error);
      }
    });
  }

  setupActivityHandlers() {
    this.socket.on('activity_update', (data) => {
      try {
        this.notifyListeners('activity_update', data);
      } catch (error) {
        console.error('Error processing activity update:', error);
      }
    });
  }

  setupErrorHandlers() {
    this.socket.on('error', (error) => {
      console.error('WebSocket Error:', error);
      this.notifyListeners('error', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket Disconnected:', reason);
      if (this.weatherInterval) {
        clearInterval(this.weatherInterval);
      }
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect automatically
        this.connect();
      }
    });
  }

  handleReconnect() {
    this.reconnectAttempts++;
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      console.log(`Reconnection attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyListeners('error', { message: 'Failed to connect to server' });
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      try {
        this.socket.emit(event, data);
      } catch (error) {
        console.error(`Error emitting ${event}:`, error);
      }
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  disconnect() {
    if (this.socket) {
      if (this.weatherInterval) {
        clearInterval(this.weatherInterval);
      }
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.reconnectAttempts = 0;
    }
  }

  // Helper method to check connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  // Helper method to get last weather update time
  getLastWeatherUpdate() {
    return this.lastWeatherUpdate;
  }
}

export default new WebSocketService();