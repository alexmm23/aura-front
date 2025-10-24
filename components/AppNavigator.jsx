import React, { useEffect } from "react";
import { Stack } from "expo-router";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

// Función para manejar URLs entrantes
const handleIncomingURL = (url) => {
  console.log("🔗 Handling incoming URL:", url);

  // EXCLUIR páginas de prueba
  if (
    url.includes("static-reset-password") ||
    url.includes("test-reset-password") ||
    url.includes("ultra-simple")
  ) {
    console.log("🔗 Ignoring test page URL - no processing needed");
    return null;
  }

  // Parsear la URL
  const parsed = Linking.parse(url);
  console.log("🔗 Parsed URL:", JSON.stringify(parsed, null, 2));

  // Verificar si es reset-password (SOLO el original, no las páginas de prueba)
  if (
    parsed.path === "/reset-password" ||
    (url.includes("reset-password") &&
      !url.includes("static-") &&
      !url.includes("test-") &&
      !url.includes("ultra-"))
  ) {
    console.log("🔗 Reset password URL detected");

    // Extraer el token
    const token = parsed.queryParams?.token || extractTokenFromUrl(url);
    console.log("🔗 Extracted token:", token);

    return {
      route: "reset-password",
      params: { token },
    };
  }

  return null;
};

// Función auxiliar para extraer token de diferentes formatos de URL
const extractTokenFromUrl = (url) => {
  const patterns = [
    /token=([^&]+)/,
    /reset-password\/([^?]+)/,
    /reset-password\?.*token=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

// Navegador para rutas públicas (no autenticadas)
const PublicNavigator = () => {
  const router = useRouter();

  // Listener para URLs entrantes (deep links) en rutas públicas
  useEffect(() => {
    const handleUrl = (event) => {
      const url = event.url;

      const currentUrl = window?.location?.href || "";
      if (url === currentUrl) {
        return;
      }

      const result = handleIncomingURL(url);

      if (result && result.route === "reset-password") {
        setTimeout(() => {
          router.push(`/reset-password?token=${result.params.token}`);
        }, 100);
      }
    };
    // Listener para URLs cuando la app está abierta
    const subscription = Linking.addEventListener("url", handleUrl);
    return () => subscription?.remove();
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* SOLO RUTAS PÚBLICAS - No incluir ninguna ruta protegida */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen
        name="static-reset-password"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="test-reset-password"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ultra-simple" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="unauthorized" options={{ headerShown: false }} />

      {/* DEBUG: Página temporal para debuggear */}
      <Stack.Screen name="debug-auth" options={{ headerShown: false }} />

      {/* NO INCLUIR: (tabs), (tabs_teacher), (profile), home, etc. */}
    </Stack>
  );
};

// Navegador para rutas protegidas (autenticadas)
const ProtectedNavigator = ({ user, shouldPreserveRoute }) => {
  const router = useRouter();

  console.log("🔒 Rendering PROTECTED Navigator for user:", user?.email);

  // Redirigir a home apropiado SOLO si estamos en una ruta no válida Y no debemos preservar la ruta
  useEffect(() => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    console.log(
      "🔒 PROTECTED NAVIGATOR - Current path:",
      currentPath,
      "shouldPreserveRoute:",
      shouldPreserveRoute
    );

    // Si debemos preservar la ruta (F5 en ruta protegida), no redirigir
    if (shouldPreserveRoute) {
      console.log(
        "🔒 PROTECTED NAVIGATOR - Preserving current route:",
        currentPath
      );
      return;
    }

    // Solo redirigir si estamos en rutas de auth o la raíz
    const shouldRedirect =
      currentPath === "/" ||
      currentPath.startsWith("/(auth)") ||
      currentPath === "/login" ||
      currentPath === "/register" ||
      currentPath === "/forgotPassword";

    if (shouldRedirect) {
      const homeRoute =
        user?.role_id === 3 ? "/(tabs_teacher)/hometeacher" : "/(tabs)/home";
      console.log(
        "🔒 PROTECTED NAVIGATOR - Redirecting from",
        currentPath,
        "to:",
        homeRoute
      );
      router.replace(homeRoute);
    } else {
      console.log(
        "🔒 PROTECTED NAVIGATOR - Staying on current route:",
        currentPath
      );
    }
  }, [user, router, shouldPreserveRoute]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* SOLO RUTAS PROTEGIDAS que requieren autenticación */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs_teacher)" options={{ headerShown: false }} />
      <Stack.Screen name="(profile)" options={{ headerShown: false }} />

      {/* Incluir también rutas públicas para acceso desde usuario autenticado */}
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="unauthorized" options={{ headerShown: false }} />
    </Stack>
  );
};

// Componente principal SIMPLIFICADO - solo recibe props del AuthProvider
const AppNavigator = ({ isAuthenticated, user, shouldPreserveRoute }) => {
  console.log("🧭 AppNavigator - Received props:", {
    isAuthenticated,
    userEmail: user?.email || "none",
    userRole: user?.role_id || "none",
    shouldPreserveRoute,
  });

  // SIMPLE: Solo renderizar basado en props (sin verificaciones redundantes)
  if (isAuthenticated && user) {
    console.log("🔒 AppNavigator - Rendering PROTECTED Navigator");
    return (
      <ProtectedNavigator
        user={user}
        shouldPreserveRoute={shouldPreserveRoute}
      />
    );
  } else {
    return <PublicNavigator />;
  }
};

export default AppNavigator;
