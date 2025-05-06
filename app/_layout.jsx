import { useFonts } from "expo-font";
import { Stack, Slot } from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack name="(auth)"></Stack>
        <Stack.Screen name="(tabs)" screenOptions={{ headerShown: false }} />
        <Slot />
      </Stack>
    </>
  );
}
