import { createSlice } from '@reduxjs/toolkit';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 7, // 7 أيام
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

// استعادة الحالة الأولية من localStorage إذا وجدت
const loadInitialState = () => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('authState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  }
  return {
    token: null,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      
      if (token) {
        setCookie('authToken', token, COOKIE_OPTIONS);
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        state.error = null;
        
        // حفظ الحالة في localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authState', JSON.stringify({
            token,
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          }));
        }
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      
      deleteCookie('authToken');
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authState');
        localStorage.clear();
        sessionStorage.clear();
      }
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { setCredentials, logout, setLoading, setError, clearError } = authSlice.actions;

// Selectors
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;