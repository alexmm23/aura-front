import { useFonts } from "expo-font";
import { Stack, Slot } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log("RootLayout rendered");
  const [fontsLoaded] = useFonts({
    "fredoka-regular": require("../assets/fonts/Fredoka-Regular.ttf"),
    "fredoka-bold": require("../assets/fonts/Fredoka-Bold.ttf"),
    "fredoka-medium": require("../assets/fonts/Fredoka-Medium.ttf"),
    "fredoka-light": require("../assets/fonts/Fredoka-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <AuthProvider>
      <ProtectedRoute>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs_teacher)" options={{ headerShown: false }} />
          <Stack.Screen name="(profile)" options={{ headerShown: false }} />
        </Stack>
      </ProtectedRoute>
    </AuthProvider>
  );
}
