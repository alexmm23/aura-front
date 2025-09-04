import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_URL } from '@env';

// Get configuration from app.config.js and .env
const { apiUrl, apiProduction }=Constants.expoConfig?.extra||{};

// Determine current environment
const getCurrentEnvironment=() => {
  // For Expo Go
  if (__DEV__) {
    return 'development';
  }
  // For production builds
  return 'production';
};

// Get the base API URL depending on environment
const getBaseUrl=() => {
  const environment=getCurrentEnvironment();
  // For Android emulator, localhost refers to the emulator itself, not your machine
  const devUrl=Platform.OS==='android'
    ? 'http://192.168.0.128:3000/api'
    :'http://localhost:3000/api'; // TODO: Change to your local dev URL
  console.log('API URL:', devUrl);

  // Environments configuration
  const urls={
    development: devUrl,
    production: apiProduction||'https://back.aurapp.com.mx/api',
  };

  return urls[environment]||urls.development;
};

// API endpoints
export const API={
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/users/create',
      VERIFY_TOKEN: '/auth/token/verify',
      REFRESH_TOKEN: '/auth/token/refresh',
      GOOGLE: '/auth/google',
      RESET_PASSWORD: '/auth/reset-password',
      LOGOUT: '/auth/logout',
      TEAMS: '/oauth/microsoft',
      PROFILE: '/users/profile',
      AUTH_CHECK: '/auth/check',
      LOGIN_WEB: '/auth/login/web',
      LOGOUT_WEB: '/auth/logout/web',
    },
    // Student endpoints
    STUDENT: {
      HOMEWORK: '/student/homework',
      NOTEBOOKS: '/notebook/list',
      NOTEBOOK_DETAIL: '/notebook/detail',
      NOTEBOOK_CREATE: '/notebook/add',
      NOTEBOOK_UPDATE: '/notebook/edit',
      NOTEBOOK_DELETE: '/notebook/delete',
      NOTES: '/note/list',
      NOTE_CREATE: '/note/images/upload',
    },
    // Task endpoints
    TASKS: {
      LIST: '/tasks/list',
      DETAIL: '/tasks/detail',
      SUBMIT: '/tasks/submit',
      SUBMISSIONS: '/tasks/submissions',
    },
    // Profile endpoints
    PROFILE: {
      LINK_CLASSROOM: '/profile/link-classroom',
      INFO: '/users/profile',
      UPDATE: '/users/update',
    },
  },
};

// Helper function to build full API URLs
export const buildApiUrl=(endpoint) => {
  return `${API.BASE_URL}${endpoint}`;
};

// Utility function to detect if running on web
export const isWeb = () => {
  return Platform.OS === 'web';
};

// Get appropriate login endpoint based on platform
export const getLoginEndpoint = () => {
  return isWeb() ? API.ENDPOINTS.AUTH.LOGIN_WEB : API.ENDPOINTS.AUTH.LOGIN;
};

// Cookie utilities for web platform
export const setCookie = (name, value, options = {}) => {
  if (typeof document !== 'undefined') {
    let cookieString = `${name}=${value}`;
    
    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    if (options.secure) {
      cookieString += `; secure`;
    }
    if (options.httpOnly) {
      cookieString += `; httpOnly`;
    }
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
    
    document.cookie = cookieString;
  }
};

export const getCookie = (name) => {
  if (typeof document !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  return null;
};

export const deleteCookie = (name, path = '/') => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  }
};

// Create fetch options with appropriate credentials
export const createFetchOptions = (options = {}) => {
  const baseOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // For web, include credentials for httpOnly cookies
  if (isWeb()) {
    baseOptions.credentials = 'include';
  }

  return baseOptions;
};

/**
 * Universal fetch wrapper that automatically handles:
 * - Web: httpOnly cookies (credentials: 'include')
 * - Mobile: JWT tokens in Authorization headers
 */
export const universalFetch = async (url, options = {}) => {
  // Import here to avoid circular dependency
  const { fetchWithAuth } = await import('../utils/fetchWithAuth');
  return fetchWithAuth(url, options);
};

export default API;
