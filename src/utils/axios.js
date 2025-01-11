// src/utils/axios.js
import axios from 'axios';
import store from '../store';
import { logout } from '../store/authSlice';
import { updateLastUpdate } from '../store/disasterSlice';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor with error handling
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.url.includes('/disasters')) {
      store.dispatch(updateLastUpdate());
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      // You could dispatch a UI action here to show a network error message
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded:', error);
      // You could dispatch a UI action here to show a rate limit message
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;