import { useEffect, useState, useLayoutEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
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

  // Usamos useLayoutEffect en lugar de useEffect para navegaciones
  // Esto garantiza que la navegación ocurra antes del pintado
  useLayoutEffect(() => {
    // Solo navegamos cuando ya no estamos cargando
    if (!isLoading) {
      // Pequeño retraso para garantizar que el layout esté montado
      const timer = setTimeout(() => {
        try {
          if (isAuthenticated) {
            console.log("Navegando a /home");
            router.replace("/home");
          } else {
            console.log("Navegando a /login");
            router.replace("/login");
          }
        } catch (error) {
          console.error("Error en navegación:", error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  // Renderizamos una pantalla de carga mientras se verifica el estado de autenticación
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
              Verificando autenticación...
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "gray",
                textAlign: "center",
              }}
            >
              {debugInfo}
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#CB8D27" />
            <Text style={{ marginTop: 16, textAlign: "center" }}>
              Redirigiendo...
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "gray",
                textAlign: "center",
              }}
            >
              {debugInfo}
            </Text>
            {/* Botón de emergencia por si la navegación falla */}
            <View style={{ marginTop: 20 }}>
              <PrimaryButton
                title="Ir a Login (Manual)"
                // onPress={() => {}}
                onPress={() => router.push("/login")}
                style={{ marginBottom: 10 }}
              />
              <PrimaryButton
                title="Ir a Home (Manual)"
                // onPress={() => {}}
                onPress={() => router.push("/home")}
                style={{}}
              />
            </View>
          </>
        )}
      </View>
    </Container>
  );
}
