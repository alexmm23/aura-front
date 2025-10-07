import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { API, buildApiUrl, isWeb } from "../config/api";
import { apiGet, apiPost, apiPostNoAuth } from "../utils/fetchWithAuth";
import { View, ActivityIndicator, Text } from "react-native";
import { Colors } from "../constants/Colors";
import AppNavigator from "../components/AppNavigator";

const AuthContext = createContext(null);

async function clearAuthData() {
  if (isWeb()) {
    // Para web, no necesitamos limpiar AsyncStorage
    return;
  }
  await AsyncStorage.removeItem("userToken");
  await AsyncStorage.removeItem("refreshToken");
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldPreserveRoute, setShouldPreserveRoute] = useState(false);

  // DEBUG: Log cuando el estado cambia
  useEffect(() => {
    console.log("🔐 AuthContext - State changed:", {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userEmail: user?.email || "none",
      currentPath:
        typeof window !== "undefined" ? window.location.pathname : "unknown",
    });

    // Log adicional cuando el usuario está autenticado
    if (isAuthenticated && user) {
      console.log("🔐 Authenticated user details:", {
        id: user.id || user.userId,
        email: user.email,
        role: user.role_id,
        exp: user.exp ? new Date(user.exp * 1000).toISOString() : "unknown",
      });
    }
  }, [isAuthenticated, isLoading, user]);

  // Verificación inicial de autenticación - SOLO UNA VEZ
  useEffect(() => {
    console.log("🔐 AuthContext - Starting initial auth check (ONCE)");
    let isMounted = true;

    // Verificar si estamos en una ruta protegida para preservarla
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isProtectedRoute =
      currentPath.startsWith("/(tabs") ||
      currentPath.includes("/classes") ||
      currentPath.includes("/profile") ||
      currentPath.includes("/home");

    setShouldPreserveRoute(isProtectedRoute);
    console.log(
      "🔐 AuthContext - Should preserve route:",
      isProtectedRoute,
      "for path:",
      currentPath
    );

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
      console.log("🔐 AuthContext - checkAuthStatus START");

      setIsLoading(true);

      if (isWeb()) {
        // Para web, verificar cookies con el servidor - SOLO SI ES NECESARIO
        try {
          const response = await apiGet(API.ENDPOINTS.AUTH.AUTH_CHECK);

          if (response.ok) {
            const data = await response.json();
            console.log("🔐 Auth check web exitoso:", data);
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            console.log("🔐 No hay sesión web válida");
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (apiError) {
          console.log(
            "🔐 Error en API call, asumiendo no autenticado:",
            apiError.message
          );
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // Para móvil, verificar tokens locales SIN LLAMADAS AL API
        console.log("🔐 Checking mobile tokens locally...");
        const token = await AsyncStorage.getItem("userToken");

        if (token) {
          try {
            // Solo decodificar el token localmente, NO verificar con el servidor
            const decodedUser = jwtDecode(token);

            // Verificar si el token ha expirado
            const currentTime = Date.now() / 1000;
            if (decodedUser.exp && decodedUser.exp > currentTime) {
              console.log("🔐 Token válido localmente");
              setUser(decodedUser);
              setIsAuthenticated(true);
            } else {
              console.log("🔐 Token expirado");
              await clearAuthData();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (tokenError) {
            console.log("🔐 Error decodificando token:", tokenError.message);
            await clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log("🔐 No hay token móvil");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("🔐 AuthContext - Error en checkAuthStatus:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      console.log("🔐 AuthContext - checkAuthStatus COMPLETE");
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
      console.log("=== LOGIN DEBUG START ===");
      console.log("Received credentials:", credentials);
      console.log("Platform:", isWeb() ? "web" : "mobile");

      if (!credentials || !credentials.email || !credentials.password) {
        throw new Error("Email y contraseña son requeridos");
      }

      const endpoint = isWeb()
        ? API.ENDPOINTS.AUTH.LOGIN_WEB
        : API.ENDPOINTS.AUTH.LOGIN_MOBILE;

      console.log("Using endpoint:", endpoint);

      const response = await apiPostNoAuth(endpoint, {
        email: credentials.email.trim(),
        password: credentials.password,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed with error:", errorData);
        throw new Error(errorData.message || "Error en el login");
      }

      const data = await response.json();
      console.log("Login successful, received data:", data);

      if (isWeb()) {
        // Para web, el token se maneja con cookies httpOnly
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          console.log("Web login successful, user set");
          return { success: true, message: "Login exitoso" };
        } else {
          throw new Error("No se recibieron datos del usuario");
        }
      } else {
        // Para móvil, manejar tokens JWT
        const { token, refreshToken } = data;

        if (!token) {
          console.error("No token received in mobile login");
          throw new Error("No se recibió el token de autenticación");
        }

        await AsyncStorage.setItem("userToken", token);
        if (refreshToken) {
          await AsyncStorage.setItem("refreshToken", refreshToken);
        }

        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        setIsAuthenticated(true);

        console.log("Mobile login successful, tokens stored");
        return { success: true, message: "Login exitoso" };
      }
    } catch (error) {
      console.error("Error durante login:", error);
      return {
        success: false,
        message: error.message || "Error desconocido durante el login",
      };
    }
  };

  const logout = async () => {
    try {
      console.log("Starting logout process...");

      if (isWeb()) {
        await apiPost(API.ENDPOINTS.AUTH.LOGOUT);
        console.log("Web logout API call completed");
      } else {
        await apiPost(API.ENDPOINTS.AUTH.LOGOUT);
        await clearAuthData();
        console.log("Mobile logout API call and clear data completed");
      }
    } catch (error) {
      console.error("Error durante logout:", error);
      // Incluso si hay error en el API call, limpiar estado local
      if (!isWeb()) {
        await clearAuthData();
      }
    } finally {
      console.log("Setting user to null and isAuthenticated to false");
      setUser(null);
      setIsAuthenticated(false);
      console.log(
        "Logout completed - user should be null and isAuthenticated should be false"
      );
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
    return isTeacher() ? "/(tabs_teacher)/HomeTeacher" : "/(tabs)/home";
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
            Verificando autenticación...
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
