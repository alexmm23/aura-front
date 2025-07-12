import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_URL } from '@env';

// Get configuration from app.config.js and .env
const { apiUrl, apiProduction } = Constants.expoConfig?.extra || {};

// Determine current environment
const getCurrentEnvironment = () => {
  // For Expo Go
  if (__DEV__) {
    return 'development';
  }
  // For production builds
  return 'production';
};

// Get the base API URL depending on environment
const getBaseUrl = () => {
  const environment = getCurrentEnvironment();
  // For Android emulator, localhost refers to the emulator itself, not your machine
  const devUrl = Platform.OS === 'android'
    ? 'http://192.168.0.128:3000/api'
    : 'http://localhost:3000/api'; // TODO: Change to your local dev URL
  console.log('API URL:', devUrl);

  // Environments configuration
  const urls = {
    development: devUrl,
    production: apiProduction || 'https://api.aura-app.com/api',
  };

  return urls[environment] || urls.development;
};

// API endpoints
export const API = {
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
    },
    // Student endpoints
    STUDENT: {
      HOMEWORK: '/student/homework',
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
export const buildApiUrl = (endpoint) => {
  return `${API.BASE_URL}${endpoint}`;
};

export default API;
