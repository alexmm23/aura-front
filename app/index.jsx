import { useEffect } from "react";
import { ScrollView, Text, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../hooks/useAuth"; // We'll create this hook
import PrimaryButton from "@/components/PrimaryButton"; // Adjust the import path as necessary

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  // const { isAuthenticated, isLoading } = {
  //   isAuthenticated: false,
  //   isLoading: false,
  // }; // Mocked for demonstration
  const Container = Platform.OS === "web" ? ScrollView : View;

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated]);

  if (!isLoading && !isAuthenticated) {
    return null; // o una pantalla de carga
  }

  /**
   * Desarrollar una landing page que muestre un mensaje de bienvenida y un botón para iniciar sesión o registrarse.
   *
   *
   */
  return (
    <Container style={{ flex: 1, marginHorizontal: 0, marginVertical: "auto" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Welcome to the app!</Text>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <PrimaryButton
            title="Go to Login"
            onPress={() => router.replace("/login")}
          />
        )}
      </View>
    </Container>
  );
}
