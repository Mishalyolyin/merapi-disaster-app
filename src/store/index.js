import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import disasterReducer from './disasterSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    disasters: disasterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

store.subscribe(() => {
  const state = store.getState();
  // You can add any persistence logic here if needed
  console.log('State updated:', state);
});

export default store;