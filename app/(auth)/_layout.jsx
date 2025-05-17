import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/useAuth"; // Hook para manejar la autenticación

export default function AuthLayout() {
  // Aquí puedes agregar lógica para verificar la autenticación
  // y redirigir a la pantalla de inicio de sesión si es necesario.
  const { isAuthenticated, isLoading } = useAuth();
  // Si la autenticación está en proceso, puedes mostrar un indicador de carga
  useEffect(() => {
    if (isLoading) {
      // Mostrar un indicador de carga o realizar alguna acción
    } else {
      // Aquí puedes redirigir a la pantalla de inicio de sesión si no está autenticado
      if (!isAuthenticated) {
        router.replace("/login");
      } else {
        router.replace("/(tabs)/home");
      }
    }
  }, [isAuthenticated, isLoading]);
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#e4d7c2" },
          animation: "fade",
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: "Iniciar Sesión",
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: "Registrarse",
          }}
        />
        <Stack.Screen
          name="forgotPassword"
          options={{
            title: "Recuperar Contraseña",
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: "Perfil",
          }}
        />
      </Stack>
    </>
  );
}
