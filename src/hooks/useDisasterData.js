// src/hooks/useDisasterData.js
import { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import WebSocketService from '../services/websocket';

export const useDisasterData = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/disasters/${id}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateData = async (updatedData) => {
    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:3001/disasters/${id}`, updatedData);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();

      // Connect to WebSocket
      WebSocketService.connect();

      // Subscribe to disaster updates
      const unsubscribe = WebSocketService.subscribe('disaster_update', (updatedDisaster) => {
        if (updatedDisaster.id === parseInt(id)) {
          setData(updatedDisaster);
        }
      });

      // Poll for updates every 30 seconds
      const interval = setInterval(fetchData, 30000);

      return () => {
        unsubscribe();
        clearInterval(interval);
        WebSocketService.disconnect();
      };
    }
  }, [id, fetchData]);

  return { data, loading, error, updateData, refetch: fetchData };
};

export default useDisasterData;