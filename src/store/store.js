// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { authApi } from './authApi';

// دالة لتحميل الحالة الأولية من localStorage
const loadPreloadedState = () => {
  if (typeof window !== 'undefined') {
    try {
      const authState = localStorage.getItem('authState');
      return authState ? { auth: JSON.parse(authState) } : {};
    } catch (error) {
      console.error('Failed to parse saved state', error);
      return {};
    }
  }
  return {};
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer
  },
  preloadedState: loadPreloadedState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
  devTools: process.env.NODE_ENV !== 'production'
});