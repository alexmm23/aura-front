import { useEffect, useState, useLayoutEffect } from "react";
import { ScrollView, Text, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import PrimaryButton from "@/components/PrimaryButton";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const Container = Platform.OS === "web" ? ScrollView : View;

  // Usamos useLayoutEffect en lugar de useEffect para navegaciones
  // Esto garantiza que la navegación ocurra antes del pintado
  useLayoutEffect(() => {
    // Solo navegamos cuando ya no estamos cargando
    if (!isLoading) {
      // Pequeño retraso para garantizar que el layout esté montado
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  // Renderizamos una pantalla de carga mientras se verifica el estado de autenticación
  return (
    <Container style={{ flex: 1, marginHorizontal: 0, marginVertical: "auto" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {isLoading ? (
          <Text>Cargando...</Text>
        ) : (
          <>
            <Text>Redirigiendo...</Text>
          </>
        )}
      </View>
    </Container>
  );
}
