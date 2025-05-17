import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ya que tú haces tu propio header
        animation: "slide_from_right", // Opcional: animación al navegar
      }}
    >
      {/* Puedes especificar aquí opciones por pantalla si quieres */}
      {/* 
      <Stack.Screen
        name="profile_edit"
        options={{ headerShown: false }}
      />
      */}
    </Stack>
  );
}

