import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { API, buildApiUrl } from "@/config/api";
import fetchWithAuth from "@/utils/fetchWithAuth";
import Head from "expo-router/head";
import { AuraText } from "@/components/AuraText";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

// Importaciones de Stripe para React Native
import { StripeProvider, CardField, useStripe } from "@stripe/stripe-react-native";

// ⚠️ Pega aquí tu clave pública de Stripe
const STRIPE_PUBLISHABLE_KEY = "pk_test_xxx"; // Reemplaza con tu clave real

// Componente para manejar el formulario de pago
function StripePaymentForm({ clientSecret, onSuccess, onCancel }) {
  const { confirmSetupIntent } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handlePayment = async () => {
    if (!clientSecret || !cardComplete) {
      Alert.alert("Error", "Por favor completa la información de la tarjeta");
      return;
    }

    setLoading(true);
    
    try {
      const { error, setupIntent } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert("Error de pago", error.message);
      } else if (setupIntent?.status === 'succeeded') {
        Alert.alert(
          "¡Éxito!", 
          "Método de pago actualizado correctamente",
          [{ text: "OK", onPress: onSuccess }]
        );
      }
    } catch (err) {
      Alert.alert("Error", "Ocurrió un error inesperado");
      console.error("Error en pago:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.paymentFormContainer}>
      <AuraText style={styles.paymentTitle} text="Actualizar método de pago" />
      
      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        }}
        style={styles.cardField}
        onCardChange={(cardDetails) => {
          setCardComplete(cardDetails.complete);
        }}
      />

      <View style={styles.paymentButtonsContainer}>
        <TouchableOpacity
          style={[styles.paymentButton, styles.cancelButton]}
          onPress={onCancel}
        >
          <AuraText style={styles.cancelButtonText} text="Cancelar" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.paymentButton, 
            styles.confirmButton,
            (!cardComplete || loading) && styles.disabledButton
          ]}
          onPress={handlePayment}
          disabled={!cardComplete || loading}
        >
          <AuraText 
            style={styles.confirmButtonText} 
            text={loading ? "Procesando..." : "Actualizar tarjeta"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Profile() {
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const router = useRouter();

  const googleLogin = async () => {
    try {
      const response = await fetchWithAuth(
        buildApiUrl(API.ENDPOINTS.AUTH.GOOGLE),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.url) {
        Linking.openURL(data.url);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetchWithAuth(
        buildApiUrl(API.ENDPOINTS.PROFILE.INFO),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log("Perfil obtenido:", data);
      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert(
        "Error",
        "Error al obtener el perfil. Por favor, inténtalo de nuevo más tarde."
      );
    }
  };

  const teamsLogin = async () => {
    try {
      const response = await fetchWithAuth(
        buildApiUrl(API.ENDPOINTS.AUTH.TEAMS),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.url) {
        Linking.openURL(data.url);
      } else {
        Alert.alert("Error", "No se pudo iniciar sesión con Teams");
      }
    } catch (error) {
      console.error("Error during Teams login:", error);
    }
  };

  // Función para manejar la administración de suscripción con Stripe
  const handleAdminSubscription = async () => {
    try {
      // ⚠️ Aquí llamas a tu backend para crear el SetupIntent
      // Ajusta la URL según tu API
      const response = await fetchWithAuth(
        buildApiUrl("/api/subscription/create-setup-intent"), // Ajusta esta URL
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            // Incluye los datos necesarios, como el ID del customer de Stripe
            customerId: profileData?.stripeCustomerId || null,
            // o cualquier otro dato que necesite tu backend
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowStripeModal(true);
      } else {
        Alert.alert("Error", "No se pudo inicializar el proceso de pago");
      }
    } catch (error) {
      console.error("Error creating setup intent:", error);
      Alert.alert("Error", "Error al procesar la solicitud de pago");
    }
  };

  const handlePaymentSuccess = () => {
    setShowStripeModal(false);
    setClientSecret("");
    // Opcional: refrescar los datos del perfil
    fetchProfile();
  };

  const handlePaymentCancel = () => {
    setShowStripeModal(false);
    setClientSecret("");
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <Head>
        <title>Mi Perfil</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <View style={styles.container}>
        {/* Fondo con PortraitHeader */}
        <PortraitHeader />

        {/* Header con botón atrás */}
        <LinearGradient
          colors={["#B065C4", "#F4A45B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardheader}
        />

        {/* Imagen de perfil superpuesta */}
        <View style={styles.profileImageContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.profileImage}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Card principal */}
          <View style={styles.card}>
            <AuraText style={styles.title} text="Mi Perfil" />
            {profileData && (
              <AuraText style={styles.title} text={profileData.user.email} />
            )}
            
            {/* Íconos de plataformas */}
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => googleLogin()}>
                <Image
                  source={require("@/assets/images/classroom.png")}
                  style={styles.classroomIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={teamsLogin}>
                <Image
                  source={require("@/assets/images/teams.png")}
                  style={styles.teamsIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Botones */}
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push({
                  pathname: "/profile/profile_edit",
                })
              }
            >
              <AuraText style={styles.buttonText} text="Editar Perfil" />
            </TouchableOpacity>

            {/* Botón de administrar suscripción - modificado para usar Stripe */}
            <TouchableOpacity 
              style={styles.button}
              onPress={handleAdminSubscription}
            >
              <AuraText
                style={styles.buttonText}
                text="Administrar Suscripción"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={() => logout()}
            >
              <AuraText style={styles.logoutText} text="Cerrar Sesión" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal de Stripe */}
        <Modal
          visible={showStripeModal}
          animationType="slide"
          transparent={true}
          onRequestClose={handlePaymentCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {clientSecret && (
                <StripePaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </StripeProvider>
  );
}

// Componente PortraitHeader (sin cambios)
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
  cardheader: {
    marginLeft: 20,
    borderRadius: 30,
    marginTop: 30,
    marginRight: 20,
    height: "30%",
    backgroundColor: "linear-gradient(90deg, #B065C4 0%, #F4A45B 100%)",
    backgroundImage: "linear-gradient(90deg, #B065C4, #F4A45B)",
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
  iconRow: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  classroomIcon: {
    width: 70,
    height: 70,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  teamsIcon: {
    width: 40,
    height: 40,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#F4A45B",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: "90%",
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
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  headerImage: {
    width: "90%",
    height: 250,
    marginBottom: 20,
    marginTop: 15,
  },
  // Nuevos estilos para Stripe Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  paymentFormContainer: {
    alignItems: "center",
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D29828",
    marginBottom: 20,
    textAlign: "center",
  },
  cardField: {
    width: "100%",
    height: 50,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  paymentButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E1A3CE",
  },
  cancelButtonText: {
    color: "#822C7D",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#F4A45B",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});