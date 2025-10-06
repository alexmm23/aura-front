import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get configuration from app.config.js and environment variables
const { apiUrl, environment, customConfig }=Constants.expoConfig?.extra||{};

// Get the base API URL depending on environment
const getBaseUrl=() => {
  // 1. Primero intentamos usar la variable de entorno del sistema directamente
  if (typeof process!=='undefined'&&process.env.API_URL) {
    console.log('API URL from process.env:', process.env.API_URL);
    return process.env.API_URL;
  }
  // 2. Luego intentamos obtener la URL desde app.config.js
  if (apiUrl) {
    console.log('API URL from config:', apiUrl);
    return apiUrl;
  }

  // 3. Fallback para desarrollo cuando no hay configuración
  const devUrl=Platform.OS==='android'
    ? 'http://192.168.0.128:3000/api'
    :'http://localhost:3000/api';

  console.log('API URL fallback:', devUrl);
  return devUrl;
};

// Configuración de debug y logging
export const CONFIG={
  API_URL: getBaseUrl(),
  ENVIRONMENT: environment||'development',
  DEBUG_MODE: customConfig?.debugMode||__DEV__,
  LOG_LEVEL: customConfig?.logLevel||'info',
  API_TIMEOUT: customConfig?.apiTimeout||5000
};

// API endpoints

export const API={
  BASE_URL: CONFIG.API_URL,
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
    },
    // Teacher endpoints
    TEACHER: {
      CLASSES: '/teacher/classes',
      CLASS_DETAIL: '/teacher/classes/:id',
      POSTS: '/teacher/classes/:id/posts',
      ASSIGNMENTS: '/teacher/classes/:id/assignments',
      STUDENTS: '/teacher/classes/:id/students',
      LOGOUT_ALL: '/auth/logout/all',
      TEAMS: '/oauth/microsoft',
      PROFILE: '/users/profile',
      AUTH_CHECK: '/auth/check',
      LOGIN_WEB: '/auth/login/web',
    },
    // Student endpoints
    STUDENT: {
      HOMEWORK: '/student/homework',
      HOMEWORK_SUBMIT_FILE: '/student/homework/:courseId/:courseWorkId/submit-file',
      COURSES: '/student/courses/list',
      NOTEBOOKS: '/notebook/list',
      NOTEBOOK_DETAIL: '/notebook/detail',
      NOTEBOOK_CREATE: '/notebook/add',
      NOTEBOOK_UPDATE: '/notebook/edit',
      NOTEBOOK_DELETE: '/notebook/delete',
      NOTES: '/note/list',
      NOTE_CREATE: '/note/images/upload',
      NOTE_SHOW: '/note/show',
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
    // Forums endpoints
    FORUMS: {
      LIST: '/forums',
      CREATE: '/forums',
      DETAIL: '/forums/:id',
      UPDATE: '/forums/:id',
      DELETE: '/forums/:id',
      POSTS: '/forums/:id/posts',
      CREATE_POST: '/forums/:id/posts',
    },
    // Posts endpoints
    POSTS: {
      DETAIL: '/forums/posts/:id',
      UPDATE: '/forums/posts/:id',                    // ✅ Cambiado
      DELETE: '/forums/posts/:id',                    // ✅ Cambiado
      TOGGLE_RESPONSES: '/forums/posts/:id/toggle-responses',
      COMMENTS: '/forums/posts/:id/comments',
      CREATE_COMMENT: '/forums/posts/:id/comments',
    },
    // Comments endpoints
    COMMENTS: {
      UPDATE: '/comments/:id',
      DELETE: '/comments/:id',
    },
    // Attachments endpoints
    ATTACHMENTS: {
      DELETE: '/attachments/:id',
    },
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/users/create',
      VERIFY_TOKEN: '/auth/token/verify',
      REFRESH_TOKEN: '/auth/token/refresh',
      GOOGLE: '/auth/google',
      RESET_PASSWORD: '/auth/reset-password', // ✅ Ya lo tienes
      VERIFY_RESET_TOKEN: '/auth/verify-reset-token', // ➕ Agregar este
      CONFIRM_RESET_PASSWORD: '/auth/confirm-reset-password', // ➕ Agregar este
      LOGOUT: '/auth/logout',
      LOGOUT_ALL: '/auth/logout/all',
      TEAMS: '/oauth/microsoft',
      PROFILE: '/users/profile',
      AUTH_CHECK: '/auth/check',
      LOGIN_WEB: '/auth/login/web',
    },
  },
};

// Helper function to build full API URLs
export const buildApiUrl=(endpoint) => {
  return `${API.BASE_URL}${endpoint}`;
};

// Utility function to detect if running on web
export const isWeb=() => {
  return Platform.OS==='web';
};

// Get appropriate login endpoint based on platform
export const getLoginEndpoint=() => {
  return isWeb()? API.ENDPOINTS.AUTH.LOGIN_WEB:API.ENDPOINTS.AUTH.LOGIN;
};

// Cookie utilities for web platform
export const setCookie=(name, value, options={}) => {
  if (typeof document!=='undefined') {
    let cookieString=`${name}=${value}`;

    if (options.maxAge) {
      cookieString+=`; max-age=${options.maxAge}`;
    }
    if (options.path) {
      cookieString+=`; path=${options.path}`;
    }
    if (options.secure) {
      cookieString+=`; secure`;
    }
    if (options.httpOnly) {
      cookieString+=`; httpOnly`;
    }
    if (options.sameSite) {
      cookieString+=`; samesite=${options.sameSite}`;
    }

    document.cookie=cookieString;
  }
};

export const getCookie=(name) => {
  if (typeof document!=='undefined') {
    const value=`; ${document.cookie}`;
    const parts=value.split(`; ${name}=`);
    if (parts.length===2) return parts.pop().split(';').shift();
  }
  return null;
};

export const deleteCookie=(name, path='/') => {
  if (typeof document!=='undefined') {
    document.cookie=`${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  }
};

// Create fetch options with appropriate credentials
export const createFetchOptions=(options={}) => {
  const baseOptions={
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // For web, include credentials for httpOnly cookies
  if (isWeb()) {
    baseOptions.credentials='include';
  }

  return baseOptions;
};

/**
 * Universal fetch wrapper that automatically handles:
 * - Web: httpOnly cookies (credentials: 'include')
 * - Mobile: JWT tokens in Authorization headers
 */
export const universalFetch=async (url, options={}) => {
  // Import here to avoid circular dependency
  const { fetchWithAuth }=await import('../utils/fetchWithAuth');
  return fetchWithAuth(url, options);
};

export default API;
