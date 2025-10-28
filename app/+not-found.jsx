import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuraText } from "@/components/AuraText";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Head from "expo-router/head";

export default function NotFound() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  const goHome = () => {
    router.replace("/(tabs)/home");
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      goHome();
    }
  };

  return (
    <>
      <Head>
        <title>Página no encontrada - AURA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          {/* Header con SVG de fondo */}
          {isLandscape ? (
            <LandscapeHeader styles={styles} />
          ) : (
            <PortraitHeader styles={styles} />
          )}

          {/* Contenido principal */}
          <View style={styles.contentContainer}>
            <View style={styles.card}>
              {/* Icono 404 */}
              <View style={styles.iconContainer}>
                <Ionicons name="alert-circle-outline" size={100} color="#D29828" />
              </View>

              {/* Texto principal */}
              <AuraText style={styles.title} text="404" />
              <AuraText style={styles.subtitle} text="Página no encontrada" />
              <AuraText 
                style={styles.description} 
                text="Lo sentimos, la página que buscas no existe o ha sido movida." 
              />

              {/* Logo de AURA */}
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logo}
              />

              {/* Botones de acción */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={goHome}>
                  <Ionicons name="home-outline" size={20} color="#fff" />
                  <AuraText style={styles.primaryButtonText} text="Ir al inicio" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={goBack}>
                  <Ionicons name="arrow-back-outline" size={20} color="#D29828" />
                  <AuraText style={styles.secondaryButtonText} text="Volver atrás" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

// Componentes de header con SVG
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#D29828",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#CB8D27",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 30,
    opacity: 0.8,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  primaryButton: {
    backgroundColor: "#F4A45B",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#D29828",
  },
  secondaryButtonText: {
    color: "#D29828",
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos para el fondo SVG
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  backgroundContainerLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "40%",
    height: "100%",
    zIndex: 1,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});