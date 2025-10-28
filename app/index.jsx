import { useEffect, useState, useLayoutEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Platform,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuraText } from "@/components/AuraText";
import Svg, { Path } from "react-native-svg";
import Head from "expo-router/head";
import { Ionicons } from '@expo/vector-icons';

// Componente de botón personalizado
const AuthButton = ({ title, onPress, iconName }) => {
  return (
    <TouchableOpacity 
      style={styles.authButton} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={40} color="#000000ff" />
      </View>
      <AuraText style={styles.buttonText} text={title} />
    </TouchableOpacity>
  );
};

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

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
          {isLandscape ? (
            <LandscapeHeader styles={styles} />
          ) : (
            <PortraitHeader styles={styles} />
          )}

          <View style={styles.contentContainer}>
            <View style={styles.welcomeCard}>
              <Image 
                source={require('@/assets/images/LogoSinFondo.png')} 
                style={styles.logo}
              />
              <AuraText
                style={styles.appSubtitle}
                text="Organiza, Estudia y Aprende"
              />

              {!isAuthenticated ? (
                <View style={styles.buttonsContainer}>
                  <AuthButton
                    title="Iniciar Sesión"
                    iconName="log-in-outline"
                    onPress={() => router.push("/(auth)/login")}
                  />
                  <AuthButton
                    title="Registrarse"
                    iconName="person-add-outline"
                    onPress={() => router.push("/(auth)/register")}
                  />
                </View>
              ) : (
                <View style={styles.buttonsContainerSingle}>
                  <AuthButton
                    title="Ir a Home"
                    iconName="home-outline"
                    onPress={() => {
                      const homeRoute =
                        user?.role_id === 3
                          ? "/(tabs_teacher)/hometeacher"
                          : "/(tabs)/home";
                      router.push(homeRoute);
                    }}
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
        fill="#7752cb"
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
        fill="#7752cb"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE6DB",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
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
  appSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  buttonsContainerSingle: {
    width: "50%",
    alignItems: 'center',
  },
  authButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#f5b764',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 12,
  },
  buttonText: {
    color: '#000000ff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  backgroundContainer: {
    height: 350,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
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
