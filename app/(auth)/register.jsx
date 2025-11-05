import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  Alert,
  KeyboardAvoidingView, 
} from "react-native";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { API, buildApiUrl } from "@/config/api";
import Svg, { Path } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import FormRegister from "@/components/FormRegister";
import { useRouter } from "expo-router";
import { AuraText } from "@/components/AuraText";
import Toast from "react-native-toast-message";

export default function Register() {
  const { height, width } = useWindowDimensions();
  const isLargeScreen = width >= 928;
  const isLandscape = width > height;

  const router = useRouter();
  const colors = Colors.light;
  const styles = useMemo(() => createStyles(colors, isLandscape), [colors, isLandscape]); // ✅ MEMO

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "2",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = "Este campo es obligatorio";
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email no válido";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (formData.role === "") {
      newErrors.role = "Selecciona un rol";
    }

    return newErrors;
  };

  const registerUser = async (user) => {
    const response = await fetch(buildApiUrl(API.ENDPOINTS.AUTH.REGISTER), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    return await response.json();
  };

  const handleSubmit = async () => {
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const user = {
        email: formData.email,
        name: formData.nombre,
        lastname: formData.apellidos,
        password: formData.password,
        role_id: formData.role,
      };
      const response = await registerUser(user);
      Toast.show({
        type: "success",
        text1: "Registro exitoso",
        text2: "Te has registrado correctamente",
        visibilityTime: 5000,
        autoHide: false,
        swipeable: true,
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
      console.log("Response:", response);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error de registro",
        text2: error.message,
      });
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ContainerComponent = Platform.OS === "web" ? View : SafeAreaViewContext;
  const containerProps = Platform.OS === "web" ? {} : { edges: [] };

  return (
    <ContainerComponent style={styles.container} {...containerProps}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} // ✅ CAMBIO: paddingBottom 10 → 20
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16} // ✅ NUEVO: Mejorar rendimiento del scroll
          nestedScrollEnabled={false} // ✅ NUEVO: Evitar conflictos de scroll
        >
          <StatusBar style="light" />

          {isLandscape ? (
            <View style={localStyles.landscapeContainer}>
              {/* Lado Izquierdo con Imagen */}
              <View style={localStyles.leftSide}>
                <Svg
                  width="100%"
                  height="50%"
                  viewBox="0 0 500 500"
                  preserveAspectRatio="xMidYMid meet"
                  style={localStyles.svgBackground}
                >
                  <Path
                    d="M419 42C51.0001 115 326.5 164.5 163 305.5C79.5 368 -15 408.336 -15 315C-15 221.664 -246.583 -43 -148 -43C-49.4172 -43 419 -51.3361 419 42Z"
                    fill="#7752CC"
                  />
                </Svg>
                <Image
                  source={require("../../assets/images/books-illustration.png")}
                  style={localStyles.image}
                  resizeMode="contain"
                />
              </View>

              {/* Lado Derecho con Formulario */}
              <View style={localStyles.rightSide}>
                <View style={styles.cardLandscape}>
                  <AuraText style={styles.title} text="Registrate" />
                  <FormRegister
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />
                </View>
              </View>
            </View>
          ) : (
            <>
              <PortraitHeader colors={colors} styles={styles} />
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
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </ContainerComponent>
  );
}

const PortraitHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="500"
      preserveAspectRatio="none"
      viewBox="0 0 349 371"
      style={styles.svg}
    >
      <Path
        d="M419 42C51.0001 115 326.5 164.5 163 305.5C79.5 368 -15 408.336 -15 315C-15 221.664 -246.583 -43 -148 -43C-49.4172 -43 419 -51.3361 419 42Z"
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

const createStyles = (theme, isLandscape) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#e4d7c2",
    },
    backgroundContainer: {
      height: 180,
      width: "100%",
      position: "relative",
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
    headerImage: {
      width: "80%",
      height: 120,
      marginBottom: 20,
    },
    card: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      width: "90%",
      marginTop: 0,
      alignSelf: "center",
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      alignItems: "center",
      elevation: 3,
    },
    cardLandscape: {
      width: "100%",
      maxWidth: 650,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignItems: "center",
    },
    title: {
      fontSize: 52,
      fontWeight: "300",
      color: theme.pink,
      marginBottom: 20,
      textAlign: "center",
    },
  });
};

const localStyles = StyleSheet.create({
  landscapeContainer: {
    flex: 1,
    flexDirection: "row",
    width: "90%",
    maxWidth: 1300,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 27,
    overflow: "hidden",
    elevation: 3,
    height: "80%",
    marginVertical: 40,
  },
  leftSide: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  rightSide: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#ffffff",
  },
  svgBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    zIndex: -1,
    width: 1000,
    marginTop: "-5%",
    marginLeft: "-40%",
  },
  image: {
    width: "90%",
    height: "60%",
    marginTop: 40,
  },
});
