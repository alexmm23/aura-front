import { useEffect } from "react";
import { Text, View } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../hooks/useAuth"; // We'll create this hook

export default function Index() {
  // const { isAuthenticated, isLoading } = useAuth();
  const { isAuthenticated, isLoading } = {
    isAuthenticated: false,
    isLoading: false,
  }; // Mocked for demonstration
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/register" />;
  } else {
    return <Redirect href="/login" />;
  }
}
