import React, { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { API, buildApiUrl, isWeb, getLoginEndpoint } from "@/config/api";
import { Ionicons } from "@expo/vector-icons";

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
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/Colors";
import Svg, { Path } from "react-native-svg";
import { AuraText } from "@/components/AuraText";
import { AuraTextInput } from "@/components/AuraTextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { GoogleIconSvg } from "@/components/LinkIcons";

function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Manual JWT decode error:", e);
    return null;
  }
}

export default function Login() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const { login, logout, isAuthenticated, user } = useAuth();
  const colors = Colors.light;
  const styles = createStyles(colors, isLandscape);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Debug function para limpiar estado
  const handleDebugReset = async () => {
    console.log("🐛 DEBUG: Resetting auth state...");
    await logout();
    console.log("🐛 DEBUG: Auth state reset complete");
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const isLargeScreen = width >= 928;

  const handleSubmit = async () => {
    // Limpiar errores previos
    setErrors({});

    // Validación básica
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else {
      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Por favor ingresa un email válido";
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      console.log("Attempting login with:", {
        email: formData.email.trim(),
        hasPassword: !!formData.password,
      });

      const credentials = {
        email: formData.email.trim(),
        password: formData.password,
      };

      // Usar el sistema unificado de login
      const result = await login(credentials);

      console.log("Login result received:", result);

      if (result && result.success) {
        console.log(
          "Login successful! AuthContext will handle redirection automatically"
        );
        // El AuthContext y ProtectedRoute se encargarán de la redirección automática
        // No necesitamos hacer redirección manual aquí
      } else {
        // Mostrar error del login
        const errorMessage = result?.message || "Error desconocido en el login";
        console.error("Login failed:", errorMessage);
        setErrors({ form: errorMessage });
      }
    } catch (error) {
      console.error("Login error in component:", error);
      setErrors({
        form: error.message || "Error de conexión. Verifica tu internet.",
      });
    }
  };

  const formularioCompleto = (
    <View style={styles.card}>
      {/* DEBUG: Indicador temporal de estado de autenticación */}
      <View
        style={{
          backgroundColor: isAuthenticated ? "#ff4444" : "#44ff44",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "white", fontSize: 12, textAlign: "center" }}>
          🐛 DEBUG: Auth={isAuthenticated ? "TRUE" : "FALSE"} | User=
          {user?.email || "none"}
        </Text>
        {isAuthenticated && (
          <TouchableOpacity
            onPress={handleDebugReset}
            style={{
              marginTop: 5,
              backgroundColor: "#ffffff33",
              padding: 5,
              borderRadius: 3,
            }}
          >
            <Text style={{ color: "white", fontSize: 10, textAlign: "center" }}>
              Resetear Estado
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <AuraText style={styles.title} text="Inicia Sesion" />
      <AuraText style={styles.subtitle} text="Organiza, Estudia, Aprende" />

      {errors.form && (
        <Text style={[styles.errorText, styles.formError]}>{errors.form}</Text>
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

      <View style={styles.passwordContainer}>
        <AuraTextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color="#919191"
          />
        </TouchableOpacity>
      </View>
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

      {/*<GoogleIconSvg
        styles={styles}
        onPress={() => console.log("Google icon pressed")}
      />*/}

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.push("/register")}
      >
        <AuraText
          style={styles.linkText}
          text="¿No tienes una cuenta? Regístrate"
        ></AuraText>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Head>
        <title>AURA - Iniciar Sesión</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="light" />

        {isLandscape || isLargeScreen ? (
          <LandscapeHeader colors={colors} styles={styles}>
            {formularioCompleto}
          </LandscapeHeader>
        ) : (
          <PortraitHeader colors={colors} styles={styles}>
            {formularioCompleto}
          </PortraitHeader>
        )}
      </ScrollView>
    </>
  );
}

const LandscapeHeader = ({ colors, styles, children }) => {
  return (
    <View style={localStyles.container}>
      {/* Lado Izquierdo con Imagen y Texto */}
      <View style={localStyles.leftSide}>
        <Image
          source={require("../../assets/images/login_students.png")}
          style={localStyles.image}
          resizeMode="contain"
        />
        <Svg
          viewBox="0 0 550 561"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0, // Asegúrate de que esté detrás de la imagen
          }}
        >
          <Path
            d="M0 25C0 11.1929 11.1929 0 25 0H521.935C543.409 0 554.89 25.2886 540.755 41.4552L354.384 254.62C346.365 263.792 346.125 277.41 353.818 286.858L543.797 520.216C557.095 536.55 545.472 561 524.41 561H25C11.1929 561 0 549.807 0 536V25Z"
            fill="#7752CC"
          />
        </Svg>
        <AuraText style={localStyles.slogan}>
          Organiza, Estudia y Aprende
        </AuraText>
      </View>

      {/* Lado Derecho donde se colocará el formulario */}
      <View style={localStyles.rightSide}>{children}</View>
    </View>
  );
};

const PortraitHeader = ({ colors, styles, children }) => (
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

    {/* Aquí renderizamos el formulario */}
    <View style={styles.formContainer}>{children}</View>
  </View>
);

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: "#e4d7c2",
      position: "relative",
      alignItems: "center",
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
      marginTop: 300,
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
      paddingRight: 50, // Espacio para el icono
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
    formContainer: {
      paddingHorizontal: 20,
      marginTop: 20,
      justifyContent: "center",
      alignItems: "center",
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

const localStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#e7e1cf", // Fondo general beige
    borderRadius: 27,
    overflow: "hidden",
    width: "85%",
    //maxHeight: 825,
    marginTop: 40,
    marginBottom: 40,
  },
  leftSide: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "85%", // puedes ajustar
    height: "80%", // o '100%' si quieres que cubra todo el alto del contenedor
    resizeMode: "contain",
    marginBottom: 20,
    zIndex: 2,
    position: "relative",
  },
  slogan: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  rightSide: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 40,
    marginTop: -250,
  },
  title: {
    fontSize: 28,
    color: "#c35f91",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#e7e1cf",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 15,
  },
  passwordInput: {
    width: "100%",
    paddingRight: 50, // Espacio para el icono
    marginBottom: 0,
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
  link: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 20,
    color: "#666",
  },
  loginButton: {
    backgroundColor: "#f4a950",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
  },
  googleLogo: {
    width: 40,
    height: 40,
    alignSelf: "center",
    marginBottom: 10,
  },
  registerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#444",
  },
});
