import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, ActivityIndicator } from "react-native";
import { AuraText } from "@/components/AuraText";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Head from "expo-router/head";
import { API } from "@/config/api";
import { apiPost, apiGet } from "../../../utils/fetchWithAuth";

// Stripe (solo en web)
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PK || "pk_test_replace_me");

export default function PaymentWeb() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccessAlert = (m) => { setErrorMessage(""); setSuccessMessage(m); setTimeout(() => setSuccessMessage(""), 5000); };
  const showErrorAlert = (m) => { setSuccessMessage(""); setErrorMessage(m); setTimeout(() => setErrorMessage(""), 8000); };

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await apiGet(API.ENDPOINTS.PAYMENT.SUBSCRIPTION_STATUS);
      if (response.status === 401) { setHasActiveSubscription(false); return; }
      const data = await response.json();
      if (data.success && data.hasActiveSubscription && data.subscriptionData) {
        setHasActiveSubscription(true);
        setSubscriptionStatus(data.subscriptionData);
      } else {
        setHasActiveSubscription(false);
        setSubscriptionStatus(null);
      }
    } catch {
      setHasActiveSubscription(false);
      setSubscriptionStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkSubscriptionStatus(); }, []);

  if (loading) {
    return (
      <>
        <Head><title>Verificando Suscripción</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /></Head>
        <View style={styles.container}>
          <PortraitHeader />
          <View style={styles.loadingContainer}><AuraText style={styles.loadingText} text="Verificando tu suscripción..." /></View>
        </View>
      </>
    );
  }

  if (hasActiveSubscription && subscriptionStatus) {
    return (
      <>
        <Head><title>Mi Suscripción</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /></Head>
        <View style={styles.container}>
          <PortraitHeader />
          <LinearGradient colors={["#B065C4", "#F4A45B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardheader}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/profile")}>
              <Image source={require("@/assets/images/volver.png")} style={styles.backIcon} />
            </TouchableOpacity>
          </LinearGradient>
          <View style={styles.cardImageContainer}>
            <Image source={require("@/assets/images/card.png")} style={styles.cardImage} resizeMode="contain" />
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <AuraText style={styles.title} text="Tu Suscripción Activa" />
              {successMessage ? (<View style={styles.successAlert}><Text style={styles.successText}>{successMessage}</Text></View>) : null}
              {errorMessage ? (<View style={styles.errorAlert}><Text style={styles.errorText}>{errorMessage}</Text></View>) : null}
              <View style={styles.subscriptionInfo}>
                <View style={styles.statusBadge}><AuraText style={styles.statusText} text="✅ ACTIVA" /></View>
                <View style={styles.infoRow}><AuraText style={styles.infoLabel} text="Plan:" /><AuraText style={styles.infoValue} text={subscriptionStatus.type || "AURA Premium"} /></View>
                <View style={styles.infoRow}><AuraText style={styles.infoLabel} text="Estado:" /><AuraText style={styles.infoValue} text={subscriptionStatus.status || "Activa"} /></View>
                <View style={styles.infoRow}><AuraText style={styles.infoLabel} text="Precio:" /><AuraText style={styles.infoValue} text="MXN$99/mes" /></View>
              </View>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  return (
    <>
      <Head><title>Realizar Pago</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /></Head>
      <View style={styles.container}>
        <PortraitHeader />
        <LinearGradient colors={["#B065C4", "#F4A45B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardheader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/profile")}>
            <Image source={require("@/assets/images/volver.png")} style={styles.backIcon} />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.cardImageContainer}>
          <Image source={require("@/assets/images/card.png")} style={styles.cardImage} resizeMode="contain" />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <AuraText style={styles.priceText} text="MXN$99 al mes" />
            <AuraText style={styles.title} text="Realiza tu Pago" />
            <Elements stripe={stripePromise}>
              <WebCheckoutForm router={router} checkSubscriptionStatus={checkSubscriptionStatus} />
            </Elements>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function WebCheckoutForm({ router, checkSubscriptionStatus }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccessAlert = (m) => { setErrorMessage(""); setSuccessMessage(m); setTimeout(() => setSuccessMessage(""), 5000); };
  const showErrorAlert = (m) => { setSuccessMessage(""); setErrorMessage(m); setTimeout(() => setErrorMessage(""), 8000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!email.trim()) return showErrorAlert("Por favor ingresa tu correo electrónico");
    if (!country.trim()) return showErrorAlert("Por favor ingresa tu país/región");
    if (!phone.trim()) return showErrorAlert("Por favor ingresa tu número de teléfono");

    const card = elements.getElement(CardElement);
    if (!card) return showErrorAlert("Por favor ingresa los datos de la tarjeta");

    try {
      setProcessing(true);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: { email, phone, address: { country } },
      });
      if (error) return showErrorAlert(error.message || "Error en la tarjeta");

      const response = await apiPost(API.ENDPOINTS.PAYMENT.CONFIRM, {
        paymentMethodId: paymentMethod.id,
        amount: 9900,
        currency: "mxn",
        billingEmail: email,
        phone,
        country,
        sendConfirmationEmail: true,
      });

      if (response.status === 401) {
        showErrorAlert("Tu sesión ha expirado. Inicia sesión.");
        setTimeout(() => router.push("/(auth)/login"), 1500);
        return;
      }

      const data = await response.json();
      if (data.success) {
        showSuccessAlert(`¡Pago realizado con éxito! 📧 Confirmación enviada a: ${email}`);
        setTimeout(() => { checkSubscriptionStatus(); }, 1500);
      } else {
        showErrorAlert(data.error || "Ocurrió un error inesperado");
      }
    } catch {
      showErrorAlert("Error de conexión. Intenta nuevamente.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.form}>
      {successMessage ? (<View style={styles.successAlert}><Text style={styles.successText}>{successMessage}</Text></View>) : null}
      {errorMessage ? (<View style={styles.errorAlert}><Text style={styles.errorText}>{errorMessage}</Text></View>) : null}

      <Text style={styles.sectionTitle}>Información del contacto</Text>
      <TextInput style={styles.input} placeholder="Correo Electrónico" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.sectionTitle}>Información de la tarjeta</Text>
      <View style={styles.stripeCardContainer}><CardElement options={{ style: { base: { fontSize: "16px" } } }} /></View>

      <Text style={styles.sectionTitle}>País/Región</Text>
      <TextInput style={styles.input} placeholder="MX/EU/US" placeholderTextColor="#999" value={country} onChangeText={setCountry} />
      <TextInput style={styles.input} placeholder="Teléfono" placeholderTextColor="#999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <TouchableOpacity style={[styles.payButton, processing && styles.payButtonDisabled]} onPress={handleSubmit} disabled={processing}>
        <AuraText style={styles.payButtonText} text={processing ? "Procesando..." : "Pagar MXN$99"} />
      </TouchableOpacity>
    </View>
  );
}

const PortraitHeader = () => (
  <View style={styles.backgroundContainer}>
    <Svg width="100%" height="280%" preserveAspectRatio="none" viewBox="0 0 349 371" style={styles.svg}>
      <Path d="M371.479 427.891C362.161 435.719 355.808 440.571 351.601 442.854C349.484 444.003 347.996 444.451 346.986 444.377C346.5 444.341 346.135 444.185 345.85 443.932C345.559 443.672 345.317 443.281 345.138 442.72C344.774 441.584 344.706 439.879 344.88 437.597C345.053 435.328 345.461 432.547 346.008 429.29C347.099 422.789 348.743 414.406 350.138 404.564C355.724 365.153 357.362 302.043 304.209 238.776C277.606 207.111 248.002 194.749 217.716 188.959C202.584 186.066 187.278 184.814 172.107 183.61C156.928 182.405 141.886 181.251 127.236 178.559C97.9607 173.182 70.2773 161.675 46.3861 131.38C22.5031 101.095 2.37702 51.9925 -11.6946 -28.6441C6.91648 -44.1965 40.9355 -62.1664 83.2065 -78.4257C125.632 -94.7445 176.326 -109.325 228.003 -118.009C279.683 -126.693 332.324 -129.476 378.652 -122.214C424.981 -114.952 464.947 -97.6536 491.354 -66.2215C517.762 -34.7886 528.166 7.86949 527.714 55.2181C527.262 102.564 515.957 154.548 499.004 204.568C482.051 254.585 459.46 302.617 436.454 342.051C413.441 381.497 390.039 412.298 371.479 427.891Z" fill="#D1A8D2" />
    </Svg>
  </View>
);

// Reusa tus estilos actuales (copiados de tu payment.jsx)
const styles = StyleSheet.create({
  // copia aquí tus estilos actuales de payment.jsx
});
