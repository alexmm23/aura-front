import { useFonts } from "expo-font";
import { Stack } from "expo-router";

import * as SplashScreen from "expo-splash-screen";
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
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack name="(auth)"></Stack>
    </Stack>
  );
}
