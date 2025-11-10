import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost, apiDelete } from '@/utils/fetchWithAuth';
import { API, isWeb } from '@/config/api';

const PUSH_TOKEN_STORAGE_KEY = 'aura:pushToken';
let handlerConfigured = false;

if (!handlerConfigured) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  handlerConfigured = true;
}

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const getProjectId = () =>
  Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.easConfig?.projectId ||
  Constants.expoConfig?.extra?.projectId ||
  Constants.manifest?.extra?.eas?.projectId ||
  Constants.expoConfig?.slug ||
  null;

const getStoredToken = async () => {
  if (isWeb()) {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    }
    return null;
  }
  return AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
};

const setStoredToken = async (token) => {
  if (isWeb()) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    }
    return;
  }
  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
};

export const removeStoredPushToken = async () => {
  if (isWeb()) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
    }
    return;
  }
  await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
};

const ensureAndroidChannelAsync = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    lightColor: '#FFCB8D',
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
};

const requestPermissionsAsync = async () => {
  const permissions = await Notifications.getPermissionsAsync();
  let status = permissions.status;

  if (status !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    status = request.status;
  }

  if (status !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return false;
  }

  return true;
};

const getExpoPushTokenAsync = async () => {
  if (!Device.isDevice && Platform.OS !== 'web') {
    console.warn('[Notifications] Physical device required for push notifications');
    return null;
  }

  const hasPermission = await requestPermissionsAsync();
  if (!hasPermission) {
    return null;
  }

  await ensureAndroidChannelAsync();

  const projectId = getProjectId();
  if (!projectId) {
    console.warn('[Notifications] Missing EAS projectId. Skipping token registration.');
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResponse.data || tokenResponse;
};

export const registerDevicePushToken = async ({ force = false } = {}) => {
  try {
    const token = await getExpoPushTokenAsync();
    if (!token) {
      return null;
    }

    const storedToken = await getStoredToken();
    if (!force && storedToken === token) {
      return token;
    }

    const payload = {
      token,
      deviceType: Device.osName || Platform.OS,
      deviceName: Device.deviceName || Device.modelName || null,
      platform: Platform.OS,
      pushProvider: 'expo',
      appIdentifier: getProjectId(),
      appOwnership: Constants.appOwnership || null,
      timezone:
        typeof Intl !== 'undefined' && Intl.DateTimeFormat
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : null,
      experienceId: Constants.experienceId || null,
    };

    const response = await apiPost(API.ENDPOINTS.NOTIFICATIONS.TOKENS, payload);
    if (!response.ok) {
      const errorData = await parseJsonSafe(response);
      throw new Error(errorData?.error || 'No se pudo registrar el token de notificaciones');
    }

    await setStoredToken(token);
    return token;
  } catch (error) {
    console.warn('[Notifications] Error registering push token:', error);
    return null;
  }
};

export const unregisterDevicePushToken = async () => {
  try {
    const storedToken = await getStoredToken();
    if (!storedToken) {
      await removeStoredPushToken();
      return;
    }

    const response = await apiDelete(API.ENDPOINTS.NOTIFICATIONS.TOKENS, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: storedToken }),
    });

    if (!response.ok) {
      const errorData = await parseJsonSafe(response);
      console.warn('[Notifications] Failed to unregister push token:', errorData?.error || response.status);
    }
  } catch (error) {
    console.warn('[Notifications] Error unregistering push token:', error);
  } finally {
    await removeStoredPushToken();
  }
};

export const sendTestPushNotification = async (payload = {}) => {
  const response = await apiPost(API.ENDPOINTS.NOTIFICATIONS.TEST, payload);
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data?.error || 'No se pudo enviar la notificación de prueba');
  }

  return data;
};

export const initializeNotificationListeners = ({ onReceive, onResponse } = {}) => {
  const subscriptions = [];

  try {
    const receiveSubscription = Notifications.addNotificationReceivedListener((notification) => {
      if (typeof onReceive === 'function') {
        onReceive(notification);
      }
    });
    subscriptions.push(receiveSubscription);
  } catch (error) {
    console.warn('[Notifications] Unable to attach receive listener:', error);
  }

  try {
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (typeof onResponse === 'function') {
        onResponse(response);
      }
    });
    subscriptions.push(responseSubscription);
  } catch (error) {
    console.warn('[Notifications] Unable to attach response listener:', error);
  }

  try {
    const tokenSubscription = Notifications.addPushTokenListener((event) => {
      const nextToken = event?.data;
      if (!nextToken) {
        return;
      }

      registerDevicePushToken({ force: true }).catch((error) => {
        console.warn('[Notifications] Failed to refresh push token registration', error);
      });
    });
    subscriptions.push(tokenSubscription);
  } catch (error) {
    console.warn('[Notifications] Unable to attach push token listener:', error);
  }

  return () => {
    subscriptions.forEach((subscription) => {
      try {
        Notifications.removeNotificationSubscription(subscription);
      } catch (error) {
        if (subscription?.remove) {
          subscription.remove();
        }
      }
    });
  };
};
