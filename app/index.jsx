import { useEffect, useState, useLayoutEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Platform,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuraText } from "@/components/AuraText";
import PrimaryButton from "@/components/PrimaryButton";
import Svg, { Path } from "react-native-svg";
import Head from "expo-router/head";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  // Simple, centered welcome screen without debug info
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D29828" />
            <AuraText style={styles.loadingText} text="Cargando..." />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <>
      <Head>
        <title>AURA - Tu asistente académico</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          {/* Header con SVG */}
          {isLandscape ? (
            <LandscapeHeader styles={styles} />
          ) : (
            <PortraitHeader styles={styles} />
          )}

          <View style={styles.contentContainer}>
            <View style={styles.welcomeCard}>
              <AuraText style={styles.appTitle} text="AURA" />
              <AuraText
                style={styles.appSubtitle}
                text="Tu asistente académico"
              />

              {!isAuthenticated ? (
                <View style={styles.buttonsContainer}>
                  <PrimaryButton
                    title="Iniciar Sesión"
                    onPress={() => router.push("/(auth)/login")}
                    style={styles.primaryButton}
                  />
                  <PrimaryButton
                    title="Registrarse"
                    onPress={() => router.push("/(auth)/register")}
                    style={styles.secondaryButton}
                  />
                </View>
              ) : (
                <View style={styles.buttonsContainer}>
                  <PrimaryButton
                    title="Ir a Home"
                    onPress={() => {
                      const homeRoute =
                        user?.role_id === 3
                          ? "/(tabs_teacher)/hometeacher"
                          : "/(tabs)/home";
                      router.push(homeRoute);
                    }}
                    style={styles.primaryButton}
                  />
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

// Componente PortraitHeader
const PortraitHeader = ({ styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 349 371"
      style={styles.svg}
    >
      <Path
        d="M378.433 23.1915C10.4329 96.1914 276.5 123 113 264C14.4172 264 -55.5672 389.527 -55.5672 296.191C-55.5672 202.855 -287.15 -61.8085 -188.567 -61.8085C-89.9844 -61.8085 378.433 -70.1446 378.433 23.1915Z"
        fill="#D1A8D2"
      />
    </Svg>
  </View>
);

const LandscapeHeader = ({ styles }) => (
  <View style={styles.backgroundContainerLandscape}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
      style={styles.svg}
    >
      <Path
        d="M378.433 23.1915C10.4329 96.1914 276.5 123 113 264C14.4172 264 -55.5672 389.527 -55.5672 296.191C-55.5672 202.855 -287.15 -61.8085 -188.567 -61.8085C-89.9844 -61.8085 378.433 -70.1446 378.433 23.1915Z"
        fill="#D1A8D2"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE6DB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 120, // Dar espacio al header SVG
  },
  welcomeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#D29828",
    marginBottom: 8,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    marginBottom: 0,
  },
  secondaryButton: {
    marginBottom: 0,
  },
  // Estilos para modo vertical
  backgroundContainer: {
    height: 350,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  // Estilos para modo horizontal
  backgroundContainerLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "40%",
    height: "100%",
    zIndex: -1,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
