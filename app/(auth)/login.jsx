import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import { useLogin } from "@/hooks/useLogin";
import { LoginForm } from "@/components/auth/LoginForm";
import { LandscapeLayout } from "@/components/auth/LandscapeLayout";
import { PortraitLayout } from "@/components/auth/PortraitLayout";

export default function Login() {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const isLargeScreen = width >= 928;
  const colors = Colors.light;
  const styles = createStyles(colors, isLandscape);

  const {
    formData,
    errors,
    showPassword,
    isSubmitting,
    handleChange,
    handleSubmit,
    togglePasswordVisibility,
  } = useLogin();

  const formulario = (
    <LoginForm
      formData={formData}
      errors={errors}
      showPassword={showPassword}
      isSubmitting={isSubmitting}
      onChangeText={handleChange}
      onSubmit={handleSubmit}
      onTogglePassword={togglePasswordVisibility}
      styles={styles}
    />
  );

  return (
    <>
      <Head>
        <title>AURA - Iniciar Sesión</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar style="light" />

          {isLargeScreen ? (
            <LandscapeLayout colors={colors}>{formulario}</LandscapeLayout>
          ) : (
            <PortraitLayout colors={colors}>{formulario}</PortraitLayout>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (theme, isLandscape) => {
  return StyleSheet.create({
    card: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      width: isLandscape ? "100%" : "90%",
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      alignItems: "center",
      elevation: 3,
    },
    title: {
      fontSize: 52,
      fontWeight: "200",
      color: "#d987ba",
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      fontWeight: "100",
      color: "#919191",
      marginBottom: 40,
      textAlign: "center",
    },
    input: {
      backgroundColor: "#DDD7C2",
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      marginTop: 25,
      width: "90%",
      fontSize: 18,
      color: "#919191",
    },
    passwordContainer: {
      backgroundColor: "#DDD7C2",
      borderRadius: 8,
      padding: 4,
      position: "relative",
      width: "90%",
      marginVertical: 8,
      marginTop: 20,
      fontSize: 18,
      color: "#919191",
    },
    passwordInput: {
      width: "100%",
      paddingRight: 50,
      marginVertical: 0,
      fontSize: 18,
      color: "#919191",
      outlineColor: "#DDD7C2",
      outlineStyle: "none",
      padding: 8,
    },
    eyeButton: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: [{ translateY: -12 }],
      padding: 4,
      zIndex: 1,
      borderRadius: 4,
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginLeft: 4,
      marginTop: -6,
      marginBottom: 6,
    },
    formError: {
      textAlign: "center",
      marginBottom: 10,
      fontSize: 14,
    },
    button: {
      backgroundColor: "#f5b764",
      borderRadius: 8,
      padding: 15,
      alignItems: "center",
      marginTop: 10,
      width: "90%",
      height: 50,
      justifyContent: "center",
      marginBottom: 10,
    },
    buttonText: {
      fontWeight: "600",
      fontSize: 16,
      color: "#11181C",
    },
    linkContainer: {
      marginTop: 16,
      alignItems: "center",
    },
    linkText: {
      color: "#9068d9",
      fontSize: 14,
    },
    linkTextContraseña: {
      color: "#919191",
      fontSize: 14,
      fontWeight: 600,
      marginTop: 0,
    },
  });
};
