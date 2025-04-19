import { useEffect } from "react";
import { ScrollView, Text, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../hooks/useAuth"; // We'll create this hook
import { useAuthRedirect } from "../hooks/useAuthRedirect"; // We'll create this hook
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "../components/Link"; // We'll create this component

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  // const { isAuthenticated, isLoading } = {
  //   isAuthenticated: false,
  //   isLoading: false,
  // }; // Mocked for demonstration

  const Container = Platform.OS === "web" ? ScrollView : SafeAreaView;

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
    <Container style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Welcome to the app!</Text>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <Link title="Go to Login" onPress={() => router.replace("/login")} />
        )}
      </View>
    </Container>
  );
}
