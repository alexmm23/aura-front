import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { API, buildApiUrl, isWeb } from "../config/api";
import { apiGet, apiPost, apiPostNoAuth } from "../utils/fetchWithAuth";
import { View, ActivityIndicator, Text } from "react-native";
import { Colors } from "../constants/Colors";
import AppNavigator from "../components/AppNavigator";
import {
  registerDevicePushToken,
  unregisterDevicePushToken,
  initializeNotificationListeners,
  removeStoredPushToken,
} from "@/services/pushNotifications";

const AuthContext = createContext(null);

async function clearAuthData() {
  if (!isWeb()) {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("refreshToken");
  }
  await removeStoredPushToken();
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldPreserveRoute, setShouldPreserveRoute] = useState(false);

  useEffect(() => {
    const cleanup = initializeNotificationListeners({
      onResponse: (response) => {
        const data = response?.notification?.request?.content?.data;
        console.log("[Notifications] Interaction received", data);
      },
    });

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    registerDevicePushToken({ force: true }).catch((error) => {
      console.warn("[Notifications] Failed to sync push token", error);
    });
  }, [isAuthenticated, user?.id]);

  // Verificación inicial de autenticación - SOLO UNA VEZ
  useEffect(() => {
    let isMounted = true;

    // Verificar si estamos en una ruta protegida para preservarla
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    
    // Si estamos en reset-password, no hacer verificación de auth
    if (currentPath === "/reset-password" || currentPath.includes("reset-password")) {
      setIsLoading(false);
      return;
    }
    
    const isProtectedRoute =
      currentPath.startsWith("/(tabs") ||
      currentPath.includes("/classes") ||
      currentPath.includes("/profile") ||
      currentPath.includes("/home");

    setShouldPreserveRoute(isProtectedRoute);
    
    const runAuthCheck = async () => {
      if (isMounted) {
        await checkAuthStatus();
      }
    };

    // Ejecutar solo una vez al montar el componente
    runAuthCheck();

    // Cleanup para evitar actualizaciones si el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, []); // Array de dependencias VACÍO para ejecutar solo una vez

  const checkAuthStatus = async () => {
    try {

      setIsLoading(true);

      if (isWeb()) {
        // Para web, verificar cookies con el servidor - SOLO SI ES NECESARIO
        try {
          const response = await apiGet(API.ENDPOINTS.AUTH.AUTH_CHECK);

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (apiError) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // Para móvil, verificar tokens locales SIN LLAMADAS AL API
        const token = await AsyncStorage.getItem("userToken");

        if (token) {
          try {
            // Solo decodificar el token localmente, NO verificar con el servidor
            const decodedUser = jwtDecode(token);

            // Verificar si el token ha expirado
            const currentTime = Date.now() / 1000;
            if (decodedUser.exp && decodedUser.exp > currentTime) {
              setUser(decodedUser);
              setIsAuthenticated(true);
            } else {
              await clearAuthData();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (tokenError) {
            await clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await apiPostNoAuth(API.ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refreshToken: refreshToken,
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.token || data.accessToken;
        const newRefreshToken = data.refreshToken;

        if (newAccessToken && newRefreshToken) {
          await AsyncStorage.setItem("userToken", newAccessToken);
          await AsyncStorage.setItem("refreshToken", newRefreshToken);
          const decodedUser = jwtDecode(newAccessToken);
          setUser(decodedUser);
          setIsAuthenticated(true);
          return true;
        }
      }

      await clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error("Error al renovar token:", error);
      await clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      if (!credentials || !credentials.email || !credentials.password) {
        throw new Error("Email y contraseña son requeridos");
      }

      const endpoint = isWeb()
        ? API.ENDPOINTS.AUTH.LOGIN_WEB
        : API.ENDPOINTS.AUTH.LOGIN;
      const response = await apiPostNoAuth(endpoint, {
        email: credentials.email.trim(),
        password: credentials.password,
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed with error:", errorData);
        throw new Error(errorData.message || "Credenciales inválidas");
      }

      const data = await response.json();

      if (isWeb()) {
        // Para web, el token se maneja con cookies httpOnly
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          return { success: true, message: "Login exitoso" };
        } else {
          throw new Error("No se recibieron datos del usuario");
        }
      } else {
        // Para móvil, manejar tokens JWT
        const { token, refreshToken } = data;

        if (!token) {
          throw new Error("No se recibió el token de autenticación");
        }

        await AsyncStorage.setItem("userToken", token);
        if (refreshToken) {
          await AsyncStorage.setItem("refreshToken", refreshToken);
        }

        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        setIsAuthenticated(true);
        registerDevicePushToken({ force: true }).catch((error) =>
          console.warn("[Notifications] Post-login push registration failed", error)
        );
        return { success: true, message: "Login exitoso" };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error desconocido durante el login",
      };
    }
  };

  const logout = async () => {
    try {
      await unregisterDevicePushToken();
    } catch (error) {
      console.warn("[Notifications] Unable to unregister push token on logout", error);
    }

    try {
      if (isWeb()) {
        await apiPost(`${API.ENDPOINTS.AUTH.LOGOUT}/web`);
      } else {
        await apiPost(API.ENDPOINTS.AUTH.LOGOUT);
        await clearAuthData();
      }
    } catch (error) {
      // Incluso si hay error en el API call, limpiar estado local
      await clearAuthData();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Funciones de utilidad para roles
  const getUserRole = () => (user?.role_id ? parseInt(user.role_id) : null);

  const hasRole = (roleId) => {
    const userRole = getUserRole();
    return userRole === roleId;
  };

  const isStudent = () => hasRole(2);
  const isTeacher = () => hasRole(3);

  const getHomeRoute = () => {
    if (!isAuthenticated || !user) {
      return "/(auth)/login";
    }
    return isTeacher() ? "/(tabs_teacher)/hometeacher" : "/(tabs)/home";
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getUserRole,
    hasRole,
    isStudent,
    isTeacher,
    getHomeRoute,
    checkAuthStatus,
  };

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = [
    "Organizando notas...",
    "Preparando tu espacio...",
    "Cargando contenido...",
    "Sincronizando datos...",
    "Casi listo...",
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(
          (prevIndex) => (prevIndex + 1) % loadingMessages.length
        );
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Reset to index 0 when not loading
      setLoadingMessageIndex(0);
    }
  }, [isLoading, loadingMessages.length]);

  return (
    <AuthContext.Provider value={value}>
      {/* AuthProvider renderiza directamente el navegador apropiado */}
      {/* Eliminamos la verificación redundante en AppNavigator */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.light.background,
          }}
        >
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text
            style={{
              marginTop: 10,
              color: Colors.light.text,
              fontSize: 16,
            }}
          >
            {loadingMessages[loadingMessageIndex]}
          </Text>
        </View>
      ) : (
        <AppNavigator
          isAuthenticated={isAuthenticated}
          user={user}
          shouldPreserveRoute={shouldPreserveRoute}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
