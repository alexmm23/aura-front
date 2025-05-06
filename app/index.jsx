import { useEffect, useState } from "react";
import { ScrollView, Text, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import PrimaryButton from "@/components/PrimaryButton";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false); // Estado para verificar si el componente está montado
  const router = useRouter();
  const Container = Platform.OS === "web" ? ScrollView : View;

  useEffect(() => {
    setIsMounted(true); // Marca el componente como montado
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/login");
      }
    }
  }, [isMounted, isAuthenticated, isLoading, router]);

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
