import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { API, buildApiUrl } from "@/config/api";
import Head from "expo-router/head";
import { AuraText } from "@/components/AuraText";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuraTextInput } from "@/components/AuraTextInput";
import { apiPost, apiGet } from "@/utils/fetchWithAuth";
import Toast from "react-native-toast-message";

export default function LinkMoodle() {
  const { height, width } = useWindowDimensions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await apiGet(API.ENDPOINTS.STUDENT.MOODLE_ACCOUNTS);
      if (response.ok) {
        const data = await response.json();
        setLinkedAccounts(data.data || []);

        // Toast informativo solo si hay cuentas
        if (data.data && data.data.length > 0) {
          Toast.show({
            type: "info",
            text1: `${data.data.length} cuenta${
              data.data.length > 1 ? "s" : ""
            } vinculada${data.data.length > 1 ? "s" : ""}`,
            text2: "Tus cuentas de Moodle están sincronizadas",
            visibilityTime: 2000,
            topOffset: 60,
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error al cargar cuentas",
          text2: "No se pudieron obtener las cuentas vinculadas",
          visibilityTime: 3000,
          topOffset: 60,
        });
      }
    } catch (error) {
      console.error("Error fetching linked accounts:", error);
      Toast.show({
        type: "error",
        text1: "Error de conexión",
        text2: "No se pudieron cargar las cuentas vinculadas",
        visibilityTime: 4000,
        topOffset: 60,
      });
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!email.trim() || !password.trim() || !url.trim()) {
      Toast.show({
        type: "error",
        text1: "Campos incompletos",
        text2: "Por favor completa todos los campos requeridos",
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    // Validar formato de URL básico
    if (!url.includes("http") && !url.includes("www.")) {
      Toast.show({
        type: "error",
        text1: "URL inválida",
        text2:
          "Por favor ingresa una URL válida (ej: https://moodle.ejemplo.com)",
        visibilityTime: 4000,
        topOffset: 60,
      });
      return;
    }

    try {
      setLoading(true);

      Toast.show({
        type: "info",
        text1: "Conectando...",
        text2: "Verificando credenciales de Moodle",
        visibilityTime: 2000,
        topOffset: 60,
      });

      const response = await apiPost(API.ENDPOINTS.STUDENT.LINK_MOODLE, {
        username: email.trim(),
        password: password.trim(),
        moodle_url: url.trim(),
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "¡Cuenta vinculada exitosamente!",
          text2: "Tu cuenta de Moodle se ha conectado correctamente",
          visibilityTime: 4000,
          topOffset: 60,
        });
        setEmail("");
        setPassword("");
        setUrl("");
        fetchLinkedAccounts();
      } else {
        const data = await response.json();
        let errorMessage = "No se pudo vincular la cuenta";

        if (response.status === 401) {
          errorMessage =
            "Credenciales incorrectas. Verifica tu usuario y contraseña";
        } else if (response.status === 404) {
          errorMessage = "URL de Moodle no encontrada. Verifica la dirección";
        } else if (response.status === 409) {
          errorMessage = "Esta cuenta ya está vinculada";
        } else if (data.error) {
          errorMessage = data.error;
        }

        Toast.show({
          type: "error",
          text1: "Error al vincular cuenta",
          text2: errorMessage,
          visibilityTime: 5000,
          topOffset: 60,
        });
      }
    } catch (error) {
      console.error("Error linking account:", error);

      let errorMessage =
        "Error de conexión. Verifica tu internet e inténtalo de nuevo";
      if (error.message.includes("network")) {
        errorMessage = "Sin conexión a internet. Verifica tu conexión";
      } else if (error.message.includes("timeout")) {
        errorMessage = "La conexión tardó demasiado. Inténtalo de nuevo";
      }

      Toast.show({
        type: "error",
        text1: "Error de conexión",
        text2: errorMessage,
        visibilityTime: 5000,
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vincular Cuenta Moodle - AURA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <View style={styles.container}>
        {/* Fondo con degradado SVG */}
        <PortraitHeader />

        {/* Header con botón atrás */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card de vinculación */}
          <View style={[styles.card, width >= 768 && styles.cardWeb]}>
            <AuraText style={styles.title} text="Vincular Cuenta" />

            {/* Logo de Moodle */}
            <Image
              source={require("@/assets/images/moodle.png")}
              style={styles.platformLogo}
            />

            {/* Campos del formulario */}
            <AuraTextInput
              style={styles.input}
              placeholder="Url de la plataforma Moodle"
              autoCapitalize="none"
              keyboardType="email-address"
              value={url}
              onChangeText={setUrl}
              editable={!loading}
              type="url"
            />

            {/* Campos del formulario */}
            <AuraTextInput
              style={styles.input}
              placeholder="Correo Electronico"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            <AuraTextInput
              style={styles.input}
              placeholder="Contraseña"
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            {/* Botón de vincular */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLinkAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AuraText style={styles.buttonText} text="Agregar Cuenta" />
              )}
            </TouchableOpacity>
          </View>

          {/* Card de cuentas vinculadas */}
          <View style={[styles.card, width >= 768 && styles.cardWeb]}>
            <AuraText style={styles.subtitle} text="Mis cuentas" />

            {loadingAccounts ? (
              <ActivityIndicator
                color="#D29828"
                size="large"
                style={styles.loader}
              />
            ) : linkedAccounts.length > 0 ? (
              <View style={styles.accountsGrid}>
                {linkedAccounts.map((account, index) => (
                  <View key={index} style={styles.accountItem}>
                    <View style={styles.accountIconContainer}>
                      <Image
                        source={require("@/assets/images/moodle.png")}
                        style={styles.accountIcon}
                      />
                    </View>
                    <AuraText
                      style={styles.accountText}
                      text={account.username + " en " + account.provider_url}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="link-outline" size={48} color="#D0D0D0" />
                <AuraText
                  style={styles.emptyText}
                  text="No hay cuentas vinculadas"
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Toast Component */}
        <Toast />
      </View>
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
  container: {
    flex: 1,
    backgroundColor: "#EDE6DB",
  },
  headerContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 20,
  },
  cardWeb: {
    maxWidth: 500,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D29828",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D29828",
    marginBottom: 20,
  },
  platformLogo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#DDD7C2",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    width: "100%",
    fontSize: 16,
    color: "#666",
  },
  button: {
    backgroundColor: "#F4A45B",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  buttonDisabled: {
    backgroundColor: "#D0D0D0",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  loader: {
    marginVertical: 20,
  },
  accountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    width: "100%",
  },
  accountItem: {
    alignItems: "center",
    width: 90,
  },
  accountIconContainer: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  accountIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  accountText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
