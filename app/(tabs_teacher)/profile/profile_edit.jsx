import React, { use, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
  Text,
} from "react-native";
import { API, buildApiUrl } from "@/config/api";
import Head from "expo-router/head";
import { AuraText } from "@/components/AuraText";
import { AuraTextInput } from "@/components/AuraTextInput";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { apiGet, apiPatch } from "../../../utils/fetchWithAuth";
import ProgressBar from "@/components/ProgressBar";

export default function Profile() {
  const { height, width } = useWindowDimensions();
  const { ENDPOINTS } = API;
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLandscape = width > height;
  const isLargeScreen = width >= 928;
  const shouldUseLandscapeLayout = isLargeScreen || isLandscape;

  // Función para verificar la fortaleza de la contraseña
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (!password) return 0;

    // Longitud mínima
    if (password.length >= 6) strength += 0.25;
    if (password.length >= 8) strength += 0.25;
    if (password.length >= 12) strength += 0.25;

    // Mayúsculas
    if (/[A-Z]/.test(password)) strength += 0.15;

    // Números
    if (/[0-9]/.test(password)) strength += 0.15;

    // Caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 0.2;

    return Math.min(strength, 1);
  };

  // Función para obtener el color según la fortaleza
  const passwordStrengthColor = (strength) => {
    if (strength < 0.3) return "#E74C3C"; // Rojo - Débil
    if (strength < 0.6) return "#F39C12"; // Naranja - Medio
    if (strength < 0.8) return "#F4A45B"; // Amarillo - Bueno
    return "#27AE60"; // Verde - Fuerte
  };

  // Función para obtener el texto según la fortaleza
  const passwordStrengthText = (strength) => {
    if (strength < 0.3) return "Contraseña débil";
    if (strength < 0.6) return "Contraseña regular";
    if (strength < 0.8) return "Contraseña buena";
    return "Contraseña fuerte";
  };

  const getProfile = async () => {
    try {
      const response = await apiGet(ENDPOINTS.PROFILE.INFO);

      if (!response.ok) {
        throw new Error("Error fetching profile");
      }

      const data = await response.json();
      console.log("Profile data:", data);
      const { user } = data;
      setFormData({
        name: user.name,
        lastName: user.lastname,
        password: "",
        confirmPassword: "",
        email: user.email || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const saveProfile = async () => {
    // Validar que las contraseñas coincidan si se proporcionó una
    if (formData.password && formData.password !== formData.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Las contraseñas no coinciden",
        text2: "Por favor, verifica que ambas contraseñas sean iguales.",
      });
      return;
    }

    const updateFields = {};
    if (formData.name) updateFields.name = formData.name;
    if (formData.lastName) updateFields.lastname = formData.lastName;
    if (formData.password) updateFields.password = formData.password;

    if (Object.keys(updateFields).length === 0) {
      console.warn("No changes to save");
      Toast.show({
        type: "error",
        text1: "Sin cambios",
        text2: "No hay cambios para guardar.",
      });
      return;
    }

    try {
      const response = await apiPatch(ENDPOINTS.PROFILE.UPDATE, updateFields);
      if (!response.ok) {
        console.error("Error updating profile:", response.statusText);
        Toast.show({
          type: "error",
          text1: "Error al actualizar el perfil",
          text2: "Error al actualizar el perfil. Por favor, inténtalo de nuevo.",
        });
        return;
      }

      const data = await response.json();
      console.log("Profile updated successfully:", data);
      Toast.show({
        type: "success",
        text1: "Perfil actualizado correctamente",
      });

      // Limpiar campos de contraseña después de guardar
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setPasswordStrength(0);
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Error al actualizar el perfil",
        text2: "Error al actualizar el perfil. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    // Actualizar fortaleza de contraseña cuando cambia
    if (field === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const router = useRouter();

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <>
      <Head>
        <title>Mi Perfil</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <View style={styles.container}>
        <PortraitHeader />

        <LinearGradient
          colors={["#B065C4", "#F4A45B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardheader}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)/profile")}
          >
            <Image
              source={require("@/assets/images/volver.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.profileImageContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.profileImage}
          />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            shouldUseLandscapeLayout && styles.contentLandscape,
          ]}
        >
          <View style={styles.card}>
            <AuraText style={styles.title} text="Mi Perfil" />
            <AuraText style={styles.email} text={formData.email || ""} />

            {/* Nombre */}
            <AuraTextInput
              style={styles.input}
              placeholder="Nombre"
              autoCapitalize="none"
              value={formData.name || ""}
              onChangeText={(text) => handleChange("name", text)}
              name="name"
            />

            {/* Apellidos */}
            <AuraTextInput
              style={styles.input}
              placeholder="Apellidos"
              autoCapitalize="none"
              value={formData.lastName || ""}
              onChangeText={(text) => handleChange("lastName", text)}
              name="lastName"
            />

            {/* Contraseña con icono de ojo */}
            <View style={styles.passwordContainerWrapper}>
              <AuraTextInput
                placeholder="Nueva Contraseña"
                value={formData.password || ""}
                onChangeText={(text) => handleChange("password", text)}
                autoCapitalize="none"
                autoComplete="password"
                secureTextEntry={!showPassword}
                name="password"
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

            {/* Progress Bar de fortaleza */}
            {formData.password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <ProgressBar
                  progress={passwordStrength}
                  color={passwordStrengthColor(passwordStrength)}
                />
                <Text
                  style={[
                    styles.passwordStrengthText,
                    { color: passwordStrengthColor(passwordStrength) },
                  ]}
                >
                  {passwordStrengthText(passwordStrength)}
                </Text>
              </View>
            )}

            {/* Texto de fortaleza */}
            {formData.password.length > 0 && (
              <Text
                style={[
                  styles.passwordStrengthText,
                  { color: passwordStrengthColor(passwordStrength) },
                ]}
              >
                {passwordStrengthText(passwordStrength)}
              </Text>
            )}

            {/* Confirmar Contraseña con icono de ojo */}
            <View style={styles.passwordContainerWrapper}>
              <AuraTextInput
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword || ""}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password"
                name="confirmPassword"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#919191"
                />
              </TouchableOpacity>
            </View>

            {/* Botón Guardar */}
            <TouchableOpacity style={styles.button} onPress={saveProfile}>
              <AuraText style={styles.buttonText} text="Guardar Cambios" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <Toast />
    </>
  );
}

const PortraitHeader = () => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="280%"
      preserveAspectRatio="none"
      viewBox="0 0 349 371"
      style={styles.svg}
    >
      <Path
        d="M371.479 427.891C362.161 435.719 355.808 440.571 351.601 442.854C349.484 444.003 347.996 444.451 346.986 444.377C346.5 444.341 346.135 444.185 345.85 443.932C345.559 443.672 345.317 443.281 345.138 442.72C344.774 441.584 344.706 439.879 344.88 437.597C345.053 435.328 345.461 432.547 346.008 429.29C347.099 422.789 348.743 414.406 350.138 404.564C355.724 365.153 357.362 302.043 304.209 238.776C277.606 207.111 248.002 194.749 217.716 188.959C202.584 186.066 187.278 184.814 172.107 183.61C156.928 182.405 141.886 181.251 127.236 178.559C97.9607 173.182 70.2773 161.675 46.3861 131.38C22.5031 101.095 2.37702 51.9925 -11.6946 -28.6441C6.91648 -44.1965 40.9355 -62.1664 83.2065 -78.4257C125.632 -94.7445 176.326 -109.325 228.003 -118.009C279.683 -126.693 332.324 -129.476 378.652 -122.214C424.981 -114.952 464.947 -97.6536 491.354 -66.2215C517.762 -34.7886 528.166 7.86949 527.714 55.2181C527.262 102.564 515.957 154.548 499.004 204.568C482.051 254.585 459.46 302.617 436.454 342.051C413.441 381.497 390.039 412.298 371.479 427.891Z"
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
  cardheader: {
    marginLeft: 20,
    borderRadius: 30,
    marginTop: 30,
    marginRight: 20,
    height: "30%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: "#00000020",
    borderRadius: 20,
    padding: 5,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: -60,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#DDD7C2",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    marginTop: 10,
    width: "90%",
    fontSize: 14,
    color: "#000000ff",
  },
  passwordContainer: {
    position: "relative",
    width: "90%",
    marginVertical: 8,
    marginTop: 10,
    color: "#000000ff",
    fontSize: 18,
  },
  passwordContainerWrapper: {
    position: "relative",
    width: "90%",
    height: 45,
    marginVertical: 8,
    marginTop: 10,
    padding:10,
    backgroundColor: "#DDD7C2",
    borderRadius: 8,
    paddingRight: 50,
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 50,
    width: "100%",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{translateY: -12}],
    padding: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#D29828",
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    fontWeight: "regular",
    color: "#919191",
    marginBottom: 20,
  },
  passwordStrengthContainer: {
    width: "90%",
    marginVertical: 8,
  },
  passwordStrengthText: {
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 4,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#F4A45B",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: "80%",
    marginVertical: 8,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 220,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  contentLandscape: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 20,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
});