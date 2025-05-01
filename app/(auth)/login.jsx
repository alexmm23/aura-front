import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/Colors";
import Svg, { Path } from "react-native-svg";
import { AuraText } from "@/components/AuraText";
import { AuraTextInput } from "@/components/AuraTextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { GoogleIconSvg } from "@/components/LinkIcons";
export default function Login() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const { login } = useAuth();
  const colors = Colors.light;
  const styles = createStyles(colors, isLandscape);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    router.replace("/homeScreen");

    /* Basic validation
    const newErrors = {};
    if (!formData.email)
      newErrors.email = "El correo electrónico es obligatorio";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    
    try {
      // TODO: Replace with your actual API call
      // const response = await fetch('your-api-url/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password,
      //   }),
      // });

      // const data = await response.json();

      // if (response.ok) {
      //   // Store token and user data
      //   await login(data.token, data.user);
      //   router.replace('/(tabs)');
      // } else {
      //   setErrors({ form: data.message || 'Credenciales inválidas' });
      // }

      // For demo purposes, simulate successful login
      await login("demo-token", {
        email: formData.email,
        name: "Usuario Demo",
      });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ form: "Error de conexión" });
    }*/
  };

  return (
    <>
      <Head>
        <title>AURA - Iniciar Sesión</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="light" />

        {/* Header con SVG */}
        {isLandscape ? (
          <LandscapeHeader colors={colors} styles={styles} />
        ) : (
          <PortraitHeader colors={colors} styles={styles} />
        )}

        <View style={styles.card}>
          <AuraText style={styles.title} text="Inicia Sesion" />
          <AuraText style={styles.subtitle} text="Organiza, Estudia, Aprende" />

          {errors.form && (
            <Text style={[styles.errorText, styles.formError]}>
              {errors.form}
            </Text>
          )}

          <AuraTextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <AuraTextInput
            style={styles.input}
            placeholder="Contraseña"
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            secureTextEntry
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => router.replace("/(auth)/forgotPassword")}
          >
            <AuraText
              style={styles.linkTextContraseña}
              text="Olvide mi contraseña"
            ></AuraText>
          </TouchableOpacity>

          <PrimaryButton
            title="Ingresar"
            onPress={handleSubmit}
            disabled={false}
            style={styles}
          />

          <GoogleIconSvg
            styles={styles}
            onPress={() => console.log("Google icon pressed")}
          />

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => router.replace("/(auth)/register")}
          >
            <AuraText
              style={styles.linkText}
              text="¿No tienes una cuenta? Regístrate"
            ></AuraText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const LandscapeHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainerLandscape}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
      style={styles.svg}
    >
      <Path
        d="M411.5 253.452C328 515.452 258 232.5 159 208C30 165 18 390 -31 191.5C-73 -27.5 64.1476 -74.5212 173.5 -74.5212C518 -134.5 291.5 215.452 411.5 253.452Z"
        fill={colors.purple}
      />
    </Svg>

    <View style={styles.headerContentLandscape}>
      <Image
        source={require("../../assets/images/login_students.png")}
        style={styles.headerImageLandscape}
        resizeMode="contain"
      />
    </View>
  </View>
);

const PortraitHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 349 371"
      style={styles.svg}
    >
      <Path
        d="M411.5 253.452C328 515.452 258 232.5 159 208C30 165 18 390 -31 191.5C-73 -27.5 64.1476 -74.5212 173.5 -74.5212C518 -134.5 291.5 215.452 411.5 253.452Z"
        fill={colors.purple}
      />
    </Svg>

    <View style={styles.headerContent}>
      <Image
        source={require("../../assets/images/login_students.png")}
        style={styles.headerImage}
        resizeMode="contain"
      />
    </View>
  </View>
);

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: "#e4d7c2",
      position: "relative",
    },
    header: {
      backgroundColor: "#9068d9",
      height: 180,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 20,
    },
    headerImage: {
      width: "80%",
      height: 120,
    },
    card: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      width: "90%",
      marginTop: -100,
      alignSelf: "center",
      marginBottom: 50,
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
      padding: 14,
      alignItems: "center",
      marginTop: 10,
      width: "90%",
      height: 50,
      justifyContent: "center",
      marginBottom: 10,
    },
    buttonText: {
      fontWeight: "600",
      fontSize: 20,
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
    // Estilos para modo vertical
    backgroundContainer: {
      height: 400,
      width: "100%",
      position: "relative",
    },
    // Estilos para modo horizontal
    backgroundContainerLandscape: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: "40%", // El header ocupa solo una parte del ancho en modo horizontal
      height: "100%",
    },
    svg: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    headerContent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 350, // igual que el contenedor
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 0, //mas espacio arriba
    },
    headerContentLandscape: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      padding: 30, // mas espacio al rededor
    },
    headerImage: {
      width: "90%",
      height: 250, //altura aumentada
    },
    headerImageLandscape: {
      width: "100%", // Ocupa todo el ancho disponible
      height: "80%", // Ocupa más altura
      maxHeight: 500, // Límite para pantallas grandes
    },
  });
};
