import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  useWindowDimensions,
  Alert,
  Platform,
  Linking,
  ActivityIndicator
} from "react-native";
import { AuraText } from "@/components/AuraText";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Head from "expo-router/head";
import { API } from "@/config/api";

import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51S2EFIRwhQTBuCWGg60RzjqoaAoZQKUplUNsEu2xzJ64ujbCJGzrrHACoOJ8JBDE6G4OOwLTepRv9F1o2hcRK9nB00gflAM0c9");

import { apiPost, apiGet } from "../../../utils/fetchWithAuth";

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export default function PaymentWeb() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

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
      console.log('📧 Sending separate manual email...');
      
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
        showSuccessAlert('📧 Email de confirmación enviado exitosamente');
      } else {
        showErrorAlert('Error enviando email de confirmación');
      }
    } catch (error) {
      console.error('Error sending separate manual email:', error);
      showErrorAlert('Error enviando email de confirmación');
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
        console.log('❌ Sesión expirada, redirigiendo al login...');
        setHasActiveSubscription(false);
        return;
      }

      const data = await response.json();
      console.log('📊 Estado de suscripción:', data);
      
      if (data.success && data.hasActiveSubscription && data.subscriptionData) {
        setHasActiveSubscription(data.hasActiveSubscription);
        setSubscriptionStatus(data.subscriptionData);
        console.log('✅ Suscripción activa encontrada:', data.subscriptionData);
      } else {
        setHasActiveSubscription(false);
        setSubscriptionStatus(null);
        console.log('❌ No se encontró suscripción activa');
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

  // ✅ Listener para deep links
  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('🔗 Deep link recibido:', url);

      // Verificar si es un deep link de pago exitoso
      if (url.includes('payment/success') || url.includes('session_id')) {
        console.log('✅ Pago exitoso detectado');
        showSuccessAlert('¡Pago realizado con éxito! Actualizando suscripción...');
        
        // Actualizar el estado después de 1 segundo
        setTimeout(() => {
          checkSubscriptionStatus();
        }, 1000);
      } 
      // Verificar si es un pago cancelado
      else if (url.includes('payment/cancel')) {
        console.log('❌ Pago cancelado');
        showErrorAlert('Pago cancelado. Puedes intentarlo nuevamente.');
      }
    };

    // Suscribirse a eventos de deep link
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Verificar si la app se abrió con un deep link inicial
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 App abierta con URL inicial:', url);
        handleDeepLink({ url });
      }
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <>
        <Head>
          <title>Verificando Suscripción</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <View style={styles.container}>
          <PortraitHeader />
          <View style={styles.loadingContainer}>
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
                  <AuraText style={styles.infoLabel} text="Estado:" />
                  <AuraText style={styles.infoValue} text={subscriptionStatus.status || "Activa"} />
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
                    <AuraText style={styles.infoLabel} text="Próxima renovación:" />
                    <AuraText style={styles.infoValue} text={new Date(subscriptionStatus.endDate).toLocaleDateString('es-MX')} />
                  </View>
                )}
                
                {subscriptionStatus.paymentMethod && (
                  <View style={styles.infoRow}>
                    <AuraText style={styles.infoLabel} text="Método de pago:" />
                    <AuraText style={styles.infoValue} text={`**** ${subscriptionStatus.paymentMethod.last4 || '****'}`} />
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
            
            {isMobile ? (
              <MobileCheckoutButton 
                router={router} 
                checkSubscriptionStatus={checkSubscriptionStatus}
                showSuccessAlert={showSuccessAlert}
                showErrorAlert={showErrorAlert}
              />
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  router={router} 
                  checkSubscriptionStatus={checkSubscriptionStatus} 
                />
              </Elements>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const MobileCheckoutButton = ({ router, checkSubscriptionStatus, showSuccessAlert, showErrorAlert }) => {
  const [processing, setProcessing] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  // ✅ Función de polling para verificar el estado
  const startPolling = () => {
    console.log('🔄 Iniciando polling para verificar estado de pago...');
    setPollingActive(true);

    let attempts = 0;
    const maxAttempts = 60; // 5 minutos máximo (60 intentos x 5 segundos)

    const pollInterval = setInterval(async () => {
      attempts++;
      console.log(`🔍 Verificando estado del pago... (Intento ${attempts}/${maxAttempts})`);

      try {
        const response = await apiGet(API.ENDPOINTS.PAYMENT.SUBSCRIPTION_STATUS);
        
        if (response.status === 401) {
          clearInterval(pollInterval);
          setPollingActive(false);
          Alert.alert(
            'Sesión Expirada',
            'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            [{ text: 'OK', onPress: () => router.push("/(auth)/login") }]
          );
          return;
        }

        const data = await response.json();
        
        // ✅ Si se detecta una suscripción activa, detener el polling
        if (data.success && data.hasActiveSubscription) {
          console.log('✅ ¡Pago detectado! Suscripción activada');
          clearInterval(pollInterval);
          setPollingActive(false);
          
          showSuccessAlert('¡Pago confirmado exitosamente! 🎉');
          
          // Actualizar el estado después de 1 segundo
          setTimeout(() => {
            checkSubscriptionStatus();
          }, 1000);
        }
        
        // Si alcanzamos el máximo de intentos, detenemos
        if (attempts >= maxAttempts) {
          console.log('⏱️ Tiempo de espera agotado');
          clearInterval(pollInterval);
          setPollingActive(false);
          
          Alert.alert(
            'Verificación Manual',
            'No se detectó el pago automáticamente. Por favor, verifica tu estado de suscripción manualmente o espera unos minutos.',
            [
              {
                text: 'Verificar Ahora',
                onPress: () => checkSubscriptionStatus()
              },
              {
                text: 'Cerrar',
                style: 'cancel'
              }
            ]
          );
        }
      } catch (error) {
        console.error('❌ Error en polling:', error);
      }
    }, 5000); // Verificar cada 5 segundos

    // Guardar el intervalo para limpiarlo si es necesario
    return pollInterval;
  };

  const handleMobileCheckout = async () => {
    try {
      setProcessing(true);
      console.log('📱 Creando sesión de Stripe Checkout para móvil...');

      const response = await apiPost(API.ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
        successUrl: `https://back.aurapp.com.mx/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `https://back.aurapp.com.mx/payment/cancel`,
      });

      if (response.status === 401) {
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          [{ text: 'OK', onPress: () => router.push("/(auth)/login") }]
        );
        return;
      }

      if (response.status === 409) {
        const data = await response.json();
        Alert.alert(
          'Ya tienes una suscripción',
          data.message || 'Ya tienes una membresía activa.',
          [{ text: 'OK' }]
        );
        return;
      }

      const data = await response.json();
      console.log('📦 Respuesta del servidor:', data);

      if (data.success && data.url) {
        console.log('✅ URL de Stripe Checkout obtenida:', data.url);
        
        const supported = await Linking.canOpenURL(data.url);
        
        if (supported) {
          // ✅ INICIAR POLLING INMEDIATAMENTE antes de abrir Stripe
          startPolling();
          
          // ✅ Abrir Stripe
          await Linking.openURL(data.url);
          console.log('🌐 Redirigiendo a Stripe Checkout...');
          console.log('🔄 Polling iniciado automáticamente');
          
          // Opcional: Mostrar un toast o notificación sutil
          // en lugar de un Alert que requiera confirmación
        } else {
          console.error('❌ No se puede abrir la URL:', data.url);
          Alert.alert(
            'Error',
            'No se pudo abrir el navegador. Por favor intenta de nuevo.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.error('❌ Respuesta sin URL:', data);
        Alert.alert(
          'Error',
          data.error || 'No se recibió la URL de pago',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error creando sesión de checkout:', error);
      
      Alert.alert(
        'Error',
        error.message || 'Error de conexión. Por favor intenta nuevamente.',
        [{ text: 'OK' }]
      );
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
          <Text style={styles.pollingText}>
            🔄 Verificando estado del pago...
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.payButton, 
          (processing || pollingActive) && styles.payButtonDisabled
        ]}
        onPress={handleMobileCheckout}
        disabled={processing || pollingActive}
      >
        <AuraText 
          style={styles.payButtonText} 
          text={
            processing 
              ? "Redirigiendo..." 
              : pollingActive 
                ? "Verificando pago..." 
                : "🔒 Ir a Stripe para Pagar MXN$99"
          } 
        />
      </TouchableOpacity>

      {processing && (
        <ActivityIndicator size="large" color="#F4A45B" style={{ marginTop: 20 }} />
      )}
    </View>
  );
};

const CheckoutForm = ({ router, checkSubscriptionStatus }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCardElement, setPendingCardElement] = useState(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    if (!email.trim()) {
      showErrorAlert('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!country.trim()) {
      showErrorAlert('Por favor ingresa tu país/región');
      return;
    }

    if (!phone.trim()) {
      showErrorAlert('Por favor ingresa tu número de teléfono');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      showErrorAlert('Por favor ingresa los datos de la tarjeta');
      return;
    }

    setPendingCardElement(cardElement);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmModal(false);
    processPayment(pendingCardElement);
    setPendingCardElement(null);
  };

  const handleCancelPayment = () => {
    setShowConfirmModal(false);
    setPendingCardElement(null);
  };

  const processPayment = async (cardElement) => {
    setProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          email: email,
          phone: phone,
          address: {
            country: country,
          },
        },
      });

      if (error) {
        showErrorAlert(`Error en la tarjeta: ${error.message}`);
        setProcessing(false);
        return;
      }

      const paymentData = {
        paymentMethodId: paymentMethod.id, 
        amount: 9900, 
        currency: "mxn",
        billingEmail: email, 
        phone: phone,
        country: country,
        sendConfirmationEmail: true
      };

      console.log("Request body:", paymentData);
      console.log("📧 Email del formulario que recibirá la confirmación:", email);

      const response = await apiPost(API.ENDPOINTS.PAYMENT.CONFIRM, paymentData);
      
      if (response.status === 401) {
        showErrorAlert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        setTimeout(() => {
          router.push("/(auth)/login");
        }, 2000);
        return;
      }

      console.log("Response from backend:", response);

      const data = await response.json();
      
      if (data.success) {
        showSuccessAlert(
          data.message || 
          `¡Pago realizado con éxito! Bienvenido a AURA Premium 🎉\n📧 Se ha enviado un correo de confirmación a: ${email}`
        );
        
        if (!data.emailSent) {
          console.log('⚠️ Email not sent automatically, sending manually...');
          await sendManualConfirmationEmail(data, email);
        } else {
          console.log(`✅ Confirmation email sent automatically to: ${email}`);
        }
        
        console.log('🔄 Actualizando estado de suscripción después del pago...');
        
        setTimeout(async () => {
          try {
            await checkSubscriptionStatus();
            console.log('✅ Estado de suscripción actualizado exitosamente');
          } catch (error) {
            console.error('❌ Error actualizando estado de suscripción:', error);
          }
        }, 2000);
        
      } else {
        showErrorAlert(`Error en el pago: ${data.error || 'Ocurrió un error inesperado'}`);
      }

    } catch (error) {
      console.error('Error during payment:', error);
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showErrorAlert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        setTimeout(() => {
          router.push("/(auth)/login");
        }, 2000);
      } else {
        showErrorAlert('Error de conexión. Por favor intenta nuevamente.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const sendManualConfirmationEmail = async (paymentData, userEmail) => {
    try {
      console.log('📧 Sending manual payment confirmation email to:', userEmail);

      const emailResponse = await apiPost(API.ENDPOINTS.PAYMENT.SEND_CONFIRMATION, {
        email: email,
        paymentData: {
          amount: 99,
          currency: 'MXN',
          paymentId: paymentData.paymentId || paymentData.id || 'N/A',
          date: new Date().toISOString(),
          phone: phone,
          country: country
        }
      });

      if (emailResponse.ok) {
        console.log('✅ Manual payment confirmation email sent successfully');
      } else {
        console.error('❌ Failed to send manual payment confirmation email');
      }
    } catch (error) {
      console.error('❌ Error sending manual payment confirmation email:', error);
    }
  };

  return (
    <View style={styles.form}>
      {showConfirmModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💳 Confirmar Pago</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas proceder con el pago de MXN$99?
            </Text>
            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailText}>📧 Correo: {email}</Text>
              <Text style={styles.modalDetailText}>📱 Teléfono: {phone}</Text>
              <Text style={styles.modalDetailText}>🌍 País: {country}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancelPayment}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirmPayment}
              >
                <Text style={styles.confirmButtonText}>Confirmar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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

      <Text style={styles.sectionTitle}>Información del contacto</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.sectionTitle}>Información de la tarjeta</Text>
      
      <View style={styles.stripeCardContainer}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#666',
                fontFamily: 'System',
                '::placeholder': {
                  color: '#999',
                },
                backgroundColor: 'transparent',
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
              },
            },
            hidePostalCode: false,
          }}
        />
      </View>

      <Text style={styles.sectionTitle}>País/Región</Text>
      <TextInput
        style={styles.input}
        placeholder="MX/EU/US"
        placeholderTextColor="#999"
        value={country}
        onChangeText={setCountry}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor="#999"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={[styles.payButton, processing && styles.payButtonDisabled]}
        onPress={handleSubmit}
        disabled={processing}
      >
        <AuraText style={styles.payButtonText} text={processing ? "Procesando..." : "Pagar MXN$99"} />
      </TouchableOpacity>
    </View>
  );
};

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
  successAlert: {
    backgroundColor: '#D4F4DD',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  successText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorAlert: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDetails: {
    width: '100%',
    marginBottom: 20,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '48%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    height: "25%",
    backgroundColor: "linear-gradient(90deg, #B065C4 0%, #F4A45B 100%)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 15,
    paddingLeft: 20,
  },
  backButton: {
    backgroundColor: "#00000020",
    borderRadius: 20,
    padding: 8,
    marginTop: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  cardImageContainer: {
    alignItems: "center",
    marginTop: -40,
  },
  cardImage: {
    width: 250,
    height: 150,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 10,
    textAlign: "center",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    width: "90%",
    maxWidth: 800,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D29828",
    marginBottom: 25,
    textAlign: "center",
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stripeCardContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 50,
    justifyContent: 'center',
  },
  payButton: {
    backgroundColor: '#F4A45B',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },
  payButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  payButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  secondaryButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  renewButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
  },
  renewButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  subscriptionInfo: {
    width: '100%',
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'center',
    marginBottom: 20,
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
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
  mobileCheckoutContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  mobileInfoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  pollingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
