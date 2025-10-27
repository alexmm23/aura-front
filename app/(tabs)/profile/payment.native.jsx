import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, ActivityIndicator, Alert, Linking } from "react-native";
import { AuraText } from "@/components/AuraText";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Head from "expo-router/head";
import { API } from "@/config/api";
import { apiPost, apiGet } from "../../../utils/fetchWithAuth";

export default function PaymentNative() {
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

  useEffect(() => {
    checkSubscriptionStatus();
    const handleDeepLink = (event) => {
      const url = event.url || "";
      if (url.includes("payment/success") || url.includes("session_id")) {
        showSuccessAlert("¡Pago realizado con éxito! Actualizando suscripción...");
        setTimeout(() => { checkSubscriptionStatus(); }, 1000);
      } else if (url.includes("payment/cancel")) {
        showErrorAlert("Pago cancelado. Puedes intentarlo nuevamente.");
      }
    };
    const sub = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink({ url }); });
    return () => { sub.remove(); };
  }, []);

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
          <View style={styles.cardImageContainer}><Image source={require("@/assets/images/card.png")} style={styles.cardImage} resizeMode="contain" /></View>
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
        <View style={styles.cardImageContainer}><Image source={require("@/assets/images/card.png")} style={styles.cardImage} resizeMode="contain" /></View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <AuraText style={styles.priceText} text="MXN$99 al mes" />
            <AuraText style={styles.title} text="Realiza tu Pago" />
            <MobileCheckoutButton router={router} checkSubscriptionStatus={checkSubscriptionStatus} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function MobileCheckoutButton({ router, checkSubscriptionStatus, showSuccessAlert, showErrorAlert }) {
  const [processing, setProcessing] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  const startPolling = () => {
    setPollingActive(true);
    let attempts = 0;
    const maxAttempts = 60;
    const id = setInterval(async () => {
      attempts++;
      try {
        const response = await apiGet(API.ENDPOINTS.PAYMENT.SUBSCRIPTION_STATUS);
        if (response.status === 401) { clearInterval(id); setPollingActive(false); Alert.alert("Sesión Expirada","Inicia sesión nuevamente.",[{ text:"OK", onPress:()=>router.push("/(auth)/login") }]); return; }
        const data = await response.json();
        if (data.success && data.hasActiveSubscription) {
          clearInterval(id);
          setPollingActive(false);
          showSuccessAlert("¡Pago confirmado exitosamente! 🎉");
          setTimeout(() => { checkSubscriptionStatus(); }, 1000);
        }
        if (attempts >= maxAttempts) { clearInterval(id); setPollingActive(false); Alert.alert("Verificación Manual","No se detectó el pago automáticamente.",[{ text:"Verificar", onPress:()=>checkSubscriptionStatus() },{ text:"Cerrar", style:"cancel" }]); }
      } catch {}
    }, 5000);
  };

  const handleMobileCheckout = async () => {
    try {
      setProcessing(true);
      const response = await apiPost(API.ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
        successUrl: `https://back.aurapp.com.mx/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `https://back.aurapp.com.mx/payment/cancel`,
      });
      if (response.status === 401) { Alert.alert("Sesión Expirada","Inicia sesión nuevamente.",[{ text:"OK", onPress:()=>router.push("/(auth)/login") }]); return; }
      if (response.status === 409) { const data = await response.json(); Alert.alert("Ya tienes una suscripción", data.message || "Activa.", [{ text:"OK" }]); return; }
      const data = await response.json();
      if (data.success && data.url) {
        const supported = await Linking.canOpenURL(data.url);
        if (supported) { startPolling(); await Linking.openURL(data.url); }
        else { Alert.alert("Error","No se pudo abrir el navegador.",[{ text:"OK" }]); }
      } else {
        Alert.alert("Error", data.error || "No se recibió la URL de pago", [{ text: "OK" }]);
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "Error de conexión.", [{ text: "OK" }]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.mobileCheckoutContainer}>
      <Text style={styles.mobileInfoText}>💳 Serás redirigido a Stripe para completar tu pago de forma segura</Text>
      {pollingActive && (<View style={styles.pollingIndicator}><ActivityIndicator size="small" color="#4CAF50" /><Text style={styles.pollingText}>🔄 Verificando estado del pago...</Text></View>)}
      <TouchableOpacity style={[styles.payButton, (processing || pollingActive) && styles.payButtonDisabled]} onPress={handleMobileCheckout} disabled={processing || pollingActive}>
        <AuraText style={styles.payButtonText} text={processing ? "Redirigiendo..." : pollingActive ? "Verificando pago..." : "🔒 Ir a Stripe para Pagar MXN$99"} />
      </TouchableOpacity>
      {processing && (<ActivityIndicator size="large" color="#F4A45B" style={{ marginTop: 20 }} />)}
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