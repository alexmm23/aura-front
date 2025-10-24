import { useEffect, useState, useLayoutEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import PrimaryButton from "@/components/PrimaryButton";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState("");
  const Container = Platform.OS === "web" ? ScrollView : View;

  // Añadir información de debug
  useEffect(() => {
    setDebugInfo(
      `Platform: ${
        Platform.OS
      }, Loading: ${isLoading}, Auth: ${isAuthenticated}, User: ${
        user ? "yes" : "no"
      }`
    );
  }, [isLoading, isAuthenticated, user]);

  return (
    <Container style={{ flex: 1, marginHorizontal: 0, marginVertical: "auto" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="large" color="#CB8D27" />
            <Text style={{ marginTop: 16, textAlign: "center" }}>
              Cargando...
            </Text>
            {/* <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "gray",
                textAlign: "center",
              }}
            >
              {debugInfo}
            </Text> */}
          </>
        ) : (
          <>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              ¡Bienvenido a AURA!
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "gray",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {debugInfo}
            </Text>
            {/* Botones de navegación manual */}
            <View style={{ marginTop: 20 }}>
              {!isAuthenticated ? (
                <>
                  <PrimaryButton
                    title="Iniciar Sesión"
                    onPress={() => router.push("/(auth)/login")}
                    style={{ marginBottom: 10 }}
                  />
                  <PrimaryButton
                    title="Registrarse"
                    onPress={() => router.push("/(auth)/register")}
                    style={{}}
                  />
                </>
              ) : (
                <PrimaryButton
                  title="Ir a Home"
                  onPress={() => {
                    const homeRoute =
                      user?.role_id === 3
                        ? "/(tabs_teacher)/hometeacher"
                        : "/(tabs)/home";
                    router.push(homeRoute);
                  }}
                  style={{}}
                />
              )}
            </View>
          </>
        )}
      </View>
    </Container>
  );
}
