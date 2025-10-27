import React, { useState, useEffect } from "react";
import { 
  View, 
  ScrollView, 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Alert,
  Linking,
  ActivityIndicator
} from "react-native";
import { AuraText } from "@/components/AuraText";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Head from "expo-router/head";
import { API } from "@/config/api";
import { apiPost, apiGet } from "../../../utils/fetchWithAuth";

export default function PaymentMobile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showSuccessAlert = (message) => {
    setErrorMessage('');
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000); 
  };

  const showErrorAlert = (message) => {
    setSuccessMessage('');
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 8000); 
  };

  const sendManualEmail = async () => {
    try {
      setProcessing(true);
      console.log('📧 Enviando email de confirmación...');
      
      const response = await apiPost(API.ENDPOINTS.PAYMENT.SEND_CONFIRMATION, {
        email: subscriptionStatus?.email || 'email@ejemplo.com',
        paymentData: {
          amount: '99.00',
          currency: 'MXN',
          paymentId: 'manual_request',
          date: new Date().toISOString(),
          phone: subscriptionStatus?.phone || '',
          country: subscriptionStatus?.country || 'MX'
        }
      });
      
      if (response.ok) {
        showSuccessAlert('📧 Email enviado exitosamente');
      } else {
        showErrorAlert('Error enviando email');
      }
    } catch (error) {
      console.error('Error enviando email:', error);
      showErrorAlert('Error enviando email');
    } finally {
      setProcessing(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Verificando estado de suscripción...');
      
      const response = await apiGet(API.ENDPOINTS.PAYMENT.SUBSCRIPTION_STATUS);
      
      if (response.status === 401) {
        console.log('❌ Sesión expirada');
        setHasActiveSubscription(false);
        return;
      }

      const data = await response.json();
      console.log('📊 Estado de suscripción:', data);
      
      if (data.success && data.hasActiveSubscription && data.subscriptionData) {
        setHasActiveSubscription(true);
        setSubscriptionStatus(data.subscriptionData);
        console.log('✅ Suscripción activa encontrada');
      } else {
        setHasActiveSubscription(false);
        setSubscriptionStatus(null);
        console.log('❌ No hay suscripción activa');
      }
    } catch (error) {
      console.error('❌ Error verificando suscripción:', error);
      setHasActiveSubscription(false);
      setSubscriptionStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  // Listener para deep links
  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('🔗 Deep link recibido:', url);

      if (url.includes('payment/success') || url.includes('session_id')) {
        console.log('✅ Pago exitoso detectado');
        showSuccessAlert('¡Pago realizado con éxito!');
        setTimeout(() => checkSubscriptionStatus(), 1000);
      } else if (url.includes('payment/cancel')) {
        console.log('❌ Pago cancelado');
        showErrorAlert('Pago cancelado');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 App abierta con URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);

  if (loading) {
    return (
      <>
        <Head>
          <title>Verificando Suscripción</title>
        </Head>
        <View style={styles.container}>
          <PortraitHeader />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F4A45B" />
            <AuraText style={styles.loadingText} text="Verificando tu suscripción..." />
          </View>
        </View>
      </>
    );
  }

  if (hasActiveSubscription && subscriptionStatus) {
    return (
      <>
        <Head>
          <title>Mi Suscripción</title>
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
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Image
                source={require("@/assets/images/volver.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.cardImageContainer}>
            <Image
              source={require("@/assets/images/card.png")}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <AuraText style={styles.title} text="Tu Suscripción Activa" />
              
              {successMessage ? (
                <View style={styles.successAlert}>
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              ) : null}

              {errorMessage ? (
                <View style={styles.errorAlert}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}
              
              <View style={styles.subscriptionInfo}>
                <View style={styles.statusBadge}>
                  <AuraText style={styles.statusText} text="✅ ACTIVA" />
                </View>
                
                <View style={styles.infoRow}>
                  <AuraText style={styles.infoLabel} text="Plan:" />
                  <AuraText style={styles.infoValue} text={subscriptionStatus.type || "AURA Premium"} />
                </View>
                
                <View style={styles.infoRow}>
                  <AuraText style={styles.infoLabel} text="Precio:" />
                  <AuraText style={styles.infoValue} text="MXN$99/mes" />
                </View>
                
                {subscriptionStatus.startDate && (
                  <View style={styles.infoRow}>
                    <AuraText style={styles.infoLabel} text="Inicio:" />
                    <AuraText style={styles.infoValue} text={new Date(subscriptionStatus.startDate).toLocaleDateString('es-MX')} />
                  </View>
                )}
                
                {subscriptionStatus.endDate && (
                  <View style={styles.infoRow}>
                    <AuraText style={styles.infoLabel} text="Renovación:" />
                    <AuraText style={styles.infoValue} text={new Date(subscriptionStatus.endDate).toLocaleDateString('es-MX')} />
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.secondaryButton, processing && styles.secondaryButtonDisabled]}
                onPress={sendManualEmail}
                disabled={processing}
              >
                <AuraText style={styles.secondaryButtonText} text={processing ? "Enviando..." : "📧 Enviar recibo"} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.renewButton}
                onPress={checkSubscriptionStatus}
              >
                <AuraText style={styles.renewButtonText} text="🔄 Actualizar Estado" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Realizar Pago</title>
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
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Image
              source={require("@/assets/images/volver.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.cardImageContainer}>
          <Image
            source={require("@/assets/images/card.png")}
            style={styles.cardImage}
            resizeMode="contain"
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <AuraText style={styles.priceText} text="MXN$99 al mes" />
            <AuraText style={styles.title} text="Realiza tu Pago" />
            
            <MobileCheckoutButton 
              router={router} 
              checkSubscriptionStatus={checkSubscriptionStatus}
              showSuccessAlert={showSuccessAlert}
              showErrorAlert={showErrorAlert}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const MobileCheckoutButton = ({ router, checkSubscriptionStatus, showSuccessAlert, showErrorAlert }) => {
  const [processing, setProcessing] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  const startPolling = () => {
    console.log('🔄 Iniciando polling...');
    setPollingActive(true);

    let attempts = 0;
    const maxAttempts = 60;

    const pollInterval = setInterval(async () => {
      attempts++;
      console.log(`🔍 Intento ${attempts}/${maxAttempts}`);

      try {
        const response = await apiGet(API.ENDPOINTS.PAYMENT.SUBSCRIPTION_STATUS);
        
        if (response.status === 401) {
          clearInterval(pollInterval);
          setPollingActive(false);
          Alert.alert('Sesión Expirada', 'Por favor inicia sesión nuevamente.', 
            [{ text: 'OK', onPress: () => router.push("/(auth)/login") }]);
          return;
        }

        const data = await response.json();
        
        if (data.success && data.hasActiveSubscription) {
          console.log('✅ ¡Pago detectado!');
          clearInterval(pollInterval);
          setPollingActive(false);
          showSuccessAlert('¡Pago confirmado exitosamente! 🎉');
          setTimeout(() => checkSubscriptionStatus(), 1000);
        }
        
        if (attempts >= maxAttempts) {
          console.log('⏱️ Timeout');
          clearInterval(pollInterval);
          setPollingActive(false);
          Alert.alert('Verificación Manual', 
            'No se detectó el pago. Por favor verifica manualmente.',
            [
              { text: 'Verificar', onPress: () => checkSubscriptionStatus() },
              { text: 'Cerrar', style: 'cancel' }
            ]);
        }
      } catch (error) {
        console.error('❌ Error en polling:', error);
      }
    }, 5000);

    return pollInterval;
  };

  const handleMobileCheckout = async () => {
    try {
      setProcessing(true);
      console.log('📱 Creando sesión de Stripe...');

      const response = await apiPost(API.ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
        successUrl: `https://aurapp.com.mx/?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `https://aurapp.com.mx/`,
      });

      if (response.status === 401) {
        Alert.alert('Sesión Expirada', 'Por favor inicia sesión nuevamente.',
          [{ text: 'OK', onPress: () => router.push("/(auth)/login") }]);
        return;
      }

      if (response.status === 409) {
        const data = await response.json();
        Alert.alert('Ya tienes suscripción', data.message || 'Ya tienes una membresía activa.', [{ text: 'OK' }]);
        return;
      }

      const data = await response.json();
      console.log('📦 Respuesta:', data);

      if (data.success && data.url) {
        console.log('✅ URL obtenida:', data.url);
        
        const supported = await Linking.canOpenURL(data.url);
        
        if (supported) {
          startPolling();
          await Linking.openURL(data.url);
          console.log('🌐 Redirigiendo a Stripe...');
        } else {
          console.error('❌ No se puede abrir URL');
          Alert.alert('Error', 'No se pudo abrir el navegador.', [{ text: 'OK' }]);
        }
      } else {
        console.error('❌ Sin URL:', data);
        Alert.alert('Error', data.error || 'No se recibió URL de pago', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Error de conexión', [{ text: 'OK' }]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.mobileCheckoutContainer}>
      <Text style={styles.mobileInfoText}>
        💳 Serás redirigido a Stripe para completar tu pago de forma segura
      </Text>

      {pollingActive && (
        <View style={styles.pollingIndicator}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.pollingText}>🔄 Verificando estado del pago...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.payButton, (processing || pollingActive) && styles.payButtonDisabled]}
        onPress={handleMobileCheckout}
        disabled={processing || pollingActive}
      >
        <AuraText 
          style={styles.payButtonText} 
          text={
            processing ? "Redirigiendo..." : 
            pollingActive ? "Verificando pago..." : 
            "🔒 Ir a Stripe para Pagar MXN$99"
          } 
        />
      </TouchableOpacity>

      {processing && (
        <ActivityIndicator size="large" color="#F4A45B" style={{ marginTop: 20 }} />
      )}
    </View>
  );
};

const PortraitHeader = () => (
  <View style={styles.backgroundContainer}>
    <Svg width="100%" height="280%" preserveAspectRatio="none" viewBox="0 0 349 371" style={styles.svg}>
      <Path
        d="M371.479 427.891C362.161 435.719 355.808 440.571 351.601 442.854C349.484 444.003 347.996 444.451 346.986 444.377C346.5 444.341 346.135 444.185 345.85 443.932C345.559 443.672 345.317 443.281 345.138 442.72C344.774 441.584 344.706 439.879 344.88 437.597C345.053 435.328 345.461 432.547 346.008 429.29C347.099 422.789 348.743 414.406 350.138 404.564C355.724 365.153 357.362 302.043 304.209 238.776C277.606 207.111 248.002 194.749 217.716 188.959C202.584 186.066 187.278 184.814 172.107 183.61C156.928 182.405 141.886 181.251 127.236 178.559C97.9607 173.182 70.2773 161.675 46.3861 131.38C22.5031 101.095 2.37702 51.9925 -11.6946 -28.6441C6.91648 -44.1965 40.9355 -62.1664 83.2065 -78.4257C125.632 -94.7445 176.326 -109.325 228.003 -118.009C279.683 -126.693 332.324 -129.476 378.652 -122.214C424.981 -114.952 464.947 -97.6536 491.354 -66.2215C517.762 -34.7886 528.166 7.86949 527.714 55.2181C527.262 102.564 515.957 154.548 499.004 204.568C482.051 254.585 459.46 302.617 436.454 342.051C413.441 381.497 390.039 412.298 371.479 427.891Z"
        fill="#D1A8D2"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  // ... (copiar todos los estilos del archivo original)
  container: { flex: 1, backgroundColor: "#EDE6DB" },
  cardheader: {
    marginLeft: 20, borderRadius: 30, marginTop: 30, marginRight: 20, height: "25%",
    justifyContent: "flex-start", alignItems: "flex-start", paddingTop: 15, paddingLeft: 20,
  },
  backButton: { backgroundColor: "#00000020", borderRadius: 20, padding: 8, marginTop: 10 },
  backIcon: { width: 24, height: 24, tintColor: "#fff" },
  cardImageContainer: { alignItems: "center", marginTop: -40 },
  cardImage: { width: 250, height: 150, borderRadius: 15, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 15, elevation: 8 },
  content: { padding: 20, alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 20, paddingVertical: 25, paddingHorizontal: 20, width: "90%", maxWidth: 800, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  title: { fontSize: 28, fontWeight: "bold", color: "#D29828", marginBottom: 25, textAlign: "center" },
  priceText: { fontSize: 18, fontWeight: "bold", color: "#888", marginBottom: 10, textAlign: "center" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#666', marginTop: 10 },
  subscriptionInfo: { width: '100%', marginBottom: 20 },
  statusBadge: { backgroundColor: '#E8F5E8', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, alignSelf: 'center', marginBottom: 20 },
  statusText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 16, color: '#666', fontWeight: '600' },
  infoValue: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#E0E0E0', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, width: "100%", marginTop: 10, alignItems: "center", borderWidth: 1, borderColor: '#CCCCCC' },
  secondaryButtonText: { fontSize: 16, color: '#666', fontWeight: '600' },
  secondaryButtonDisabled: { backgroundColor: '#CCCCCC', opacity: 0.6 },
  renewButton: { backgroundColor: '#2196F3', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, width: "100%", marginTop: 10, alignItems: "center" },
  renewButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  mobileCheckoutContainer: { width: '100%', alignItems: 'center', paddingVertical: 20 },
  mobileInfoText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25, paddingHorizontal: 20, lineHeight: 24 },
  pollingIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#4CAF50' },
  pollingText: { marginLeft: 10, fontSize: 14, color: '#2E7D32', fontWeight: '600' },
  payButton: { backgroundColor: '#F4A45B', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 30, width: "100%", marginTop: 20, alignItems: "center" },
  payButtonDisabled: { backgroundColor: '#CCC', shadowOpacity: 0 },
  payButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  successAlert: { backgroundColor: '#D4F4DD', borderColor: '#4CAF50', borderWidth: 1, borderRadius: 10, padding: 15, marginBottom: 20, alignItems: 'center', width: '100%' },
  successText: { color: '#2E7D32', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  errorAlert: { backgroundColor: '#FFEBEE', borderColor: '#F44336', borderWidth: 1, borderRadius: 10, padding: 15, marginBottom: 20, alignItems: 'center', width: '100%' },
  errorText: { color: '#C62828', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  backgroundContainer: { position: "absolute", top: 0, left: 0, width: "100%", height: 220 },
  svg: { position: "absolute", top: 0, left: 0 },
});