import React, { useEffect, useLayoutEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Eliminamos la navegación automática del layout de autenticación
  // La navegación ya se maneja en el archivo index.jsx
  
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
          name="reset-password"
          options={{
            title: "Restablecer Contraseña",
          }}
        />
      </Stack>
    </>
  );
}
