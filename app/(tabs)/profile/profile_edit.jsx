import React, { use, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { API, buildApiUrl } from "@/config/api";
import Head from "expo-router/head";
import { AuraText } from "@/components/AuraText";
import { AuraTextInput } from "@/components/AuraTextInput";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/useAuth"; // Hook para manejar la autenticación
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Para manejar el almacenamiento local
import Toast from "react-native-toast-message"; // Para mostrar mensajes de error

export default function Profile() {
  const { logout, userToken } = useAuth(); // Hook para manejar la autenticación
  const { height, width } = useWindowDimensions();
  const { ENDPOINTS } = API;
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const isLandscape = width > height;
  const isLargeScreen = width >= 928;
  const shouldUseLandscapeLayout = isLargeScreen || isLandscape;

  const getProfile = async (token) => {
    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.PROFILE.INFO), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching profile");
      }

      const data = await response.json();
      console.log("Profile data:", data);
      const { user } = data;
      // setEmail(data.email);
      setFormData({
        name: user.name,
        lastName: user.lastname,
        password: "",
        confirmPassword: "",
        email: user.email || "", // Asignar email si está disponible
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const saveProfile = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      console.error("No user token found");
      return;
    }
    // Solo tomar los campos que el usuario ha modificado y no estén vacíos
    const updateFields = {};
    if (formData.name) updateFields.name = formData.name;
    if (formData.lastName) updateFields.lastname = formData.lastName;
    if (formData.password) updateFields.password = formData.password;

    if (Object.keys(updateFields).length === 0) {
      console.warn("No changes to save");
      return;
    }

    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.PROFILE.UPDATE), {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateFields),
      });
      if (!response.ok) {
        console.error("Error updating profile:", response.statusText);
        Toast.show({
          type: "error",
          text1: "Error al actualizar el perfil",
          text2:
            "Error al actualizar el perfil. Por favor, inténtalo de nuevo.",
        });
      }
      // Si la respuesta es exitosa, puedes manejar la respuesta aquí
      Toast.show({
        type: "success",
        text1: "Perfil actualizado correctamente",
      });
      const data = await response.json();
      console.log("Profile updated successfully:", data);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const router = useRouter();
  const formularioCompleto = (
    <>
      <AuraTextInput
        style={styles.input}
        placeholder="Nombre"
        autoCapitalize="none"
        value={formData.name || ""}
        onChangeText={(text) => handleChange("name", text)}
        name="name"
      />

      <AuraTextInput
        style={styles.input}
        placeholder="Apellidos"
        autoCapitalize="none"
        value={formData.lastName || ""}
        onChangeText={(text) => handleChange("lastName", text)}
        name="lastName"
      />

      <AuraTextInput
        style={styles.input}
        placeholder="Nueva Contraseña"
        value={formData.password || ""}
        onChangeText={(text) => handleChange("password", text)}
        autoCapitalize="none"
        autoComplete="password"
        secureTextEntry
        name="password"
      />

      <AuraTextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={formData.confirmPassword || ""}
        onChangeText={(text) => handleChange("confirmPassword", text)}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        name="confirmPassword"
      />
    </>
  );
  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        getProfile(token);
      }
    };
    fetchProfile();
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
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.profileImageContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.profileImage}
          />
        </View>

        {/* ScrollView con diseño adaptativo */}
        <ScrollView
          contentContainerStyle={[
            styles.content,
            shouldUseLandscapeLayout && styles.contentLandscape,
          ]}
        >
          <View style={styles.card}>
            <AuraText style={styles.title} text="Mi Perfil" />
            <AuraText style={styles.email} text={formData.email || ""} />
            {formularioCompleto}
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

// Componente PortraitHeader
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
        d="M285.812 156.109C136.142 156.109 172.653 353.184 -85 214.631C-85 132.862 33.4293 -130 183.099 -130C332.768 -130 457 132.862 457 214.631C457 296.401 435.481 156.109 285.812 156.109Z"
        fill={colors.purple}
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  toastContainer: {
    ...(Platform.OS === "web" && {
      position: "fixed",
      top: 50,
      right: 20,
      zIndex: 9999,
    }),
  },
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
    backgroundColor: "linear-gradient(90deg, #B065C4 0%, #F4A45B 100%)",
    backgroundImage: "linear-gradient(90deg, #B065C4, #F4A45B)", // Web fallback
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
    fontSize: 18,
    color: "#919191",
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
  iconRow: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#F4A45B",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: "80%",
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#E1A3CE",
  },
  logoutText: {
    fontSize: 16,
    color: "#822C7D",
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
  backgroundContainerLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "40%",
    height: "100%",
  },
  headerContentLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  headerImageLandscape: {
    width: "100%",
    height: "80%",
    maxHeight: 500,
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
    paddingTop: 40, //mas espacio arriba
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
    marginBottom: 20,
    marginTop: 15,
  },
  headerImageLandscape: {
    width: "100%", // Ocupa todo el ancho disponible
    height: "80%", // Ocupa más altura
    maxHeight: 500, // Límite para pantallas grandes
  },
  contentLandscape: {
    flexDirection: "row", // para poner el contenido en horizontal
    justifyContent: "center", // puedes ajustar esto según tu diseño
    alignItems: "flex-start", // opcional, si quieres alinear arriba
    gap: 20, // separación entre elementos si agregas más
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
});
