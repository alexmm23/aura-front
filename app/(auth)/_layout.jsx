import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
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
      </Stack>
    </>
  );
}
