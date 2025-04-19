import { useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../hooks/useAuth"; // We'll create this hook
import { useAuthRedirect } from "../hooks/useAuthRedirect"; // We'll create this hook

export default function Index() {
  // const { isAuthenticated, isLoading } = useAuth();
  const { isAuthenticated, isLoading } = {
    isAuthenticated: false,
    isLoading: false,
  }; // Mocked for demonstration
  useAuthRedirect(isAuthenticated);

  /**
   * Desarrollar una landing page que muestre un mensaje de bienvenida y un botón para iniciar sesión o registrarse.
   *
   *
   */

  return (
    <View>
      <Text>Welcome to the app!</Text>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <Text>{isAuthenticated ? "Logged In" : "Not Logged In"}</Text>
      )}
    </View>
  );
}
