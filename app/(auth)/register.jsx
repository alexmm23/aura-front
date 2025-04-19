import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/Colors";
import FormRegister from "@/components/FormRegister";
import { useRouter } from "expo-router";
import { AuraText } from "@/components/AuraText"; // Adjust the import path as necessary
export default function Register() {
  const Container = Platform.OS === "web" ? ScrollView : SafeAreaView;
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  const router = useRouter();
  const { login } = useAuth();
  const colors = Colors.light;
  const styles = createStyles(colors, isLandscape);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    Object.values(formData).forEach((value, index) => {
      if (!value) {
        const fieldName = Object.keys(formData)[index];
        newErrors[fieldName] = "Este campo es obligatorio";
      }
    });

    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Lógica de registro...
      const token = "demo-token";
      const user = {
        email: formData.email,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
      };

      login(token, user);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error registering:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container contentContainerStyle={styles.container}>
      <StatusBar style="light" />

      {/* Header con SVG */}
      {isLandscape ? (
        <LandscapeHeader colors={colors} styles={styles} />
      ) : (
        <PortraitHeader colors={colors} styles={styles} />
      )}

      <View style={styles.card}>
        <AuraText style={styles.title} text="Registrate" />

        <FormRegister
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </View>
    </Container>
  );
}

const PortraitHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="180"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      style={styles.svg}
    >
      <Path
        d="M0,0 L100,0 L100,60 Q75,80 50,65 Q25,50 0,70 L0,0 Z"
        fill={colors.purple}
      />
    </Svg>

    <View style={styles.headerContent}>
      <Image
        source={require("../../assets/images/books-illustration.png")}
        style={styles.headerImage}
        resizeMode="contain"
      />
    </View>
  </View>
);

// Componente de encabezado para orientación horizontal
const LandscapeHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainerLandscape}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      style={styles.svg}
    >
      <Path
        d="M0,0 L30,0 Q50,50 70,0 L100,0 L100,100 L0,100 Z"
        fill={colors.purple}
      />
    </Svg>

    <View style={styles.headerContentLandscape}>
      <Image
        source={require("../../assets/images/books-illustration.png")}
        style={styles.headerImageLandscape}
        resizeMode="contain"
      />
    </View>
  </View>
);

const createStyles = (theme, isLandscape) => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.beige,
    },
    // Estilos para modo vertical
    backgroundContainer: {
      height: 180,
      width: "100%",
      position: "relative",
    },
    // Estilos para modo horizontal
    backgroundContainerLandscape: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: "30%", // El header ocupa solo una parte del ancho en modo horizontal
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
      height: 180,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 20,
    },
    headerContentLandscape: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    headerImage: {
      width: "80%",
      height: 120,
    },
    headerImageLandscape: {
      width: "80%",
      height: "50%",
    },
    // Ajusta la tarjeta según la orientación
    card: {
      backgroundColor: theme.white,
      borderRadius: 20,
      padding: 20,
      margin: isLandscape ? 10 : 20,
      marginLeft: isLandscape ? "35%" : 20, // En horizontal, la tarjeta comienza después del header
      marginTop: isLandscape ? 10 : -20,
      marginBottom: isLandscape ? 10 : 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      flex: isLandscape ? 1 : undefined, // En horizontal, la tarjeta debe ocupar el espacio disponible
    },
    title: {
      fontSize: 36,
      fontWeight: "300",
      color: theme.pink,
      marginBottom: 20,
      textAlign: "center",
    },
  });
};
