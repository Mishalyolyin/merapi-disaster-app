import { io } from 'socket.io-client';
import store from '../store';
import { updateAdminStats } from '../store/disasterSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (this.socket) return;

    this.socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000
    });

    this.setupEventListeners();
  }

  // Rest of your WebSocket code remains the same...
}

export default new WebSocketService();