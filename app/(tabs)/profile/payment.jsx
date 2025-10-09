import React, { useState, useEffect } from "react";
import { 
  View, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  useWindowDimensions,
  Alert // ← Agregar Alert
} from "react-native";
import { AuraText } from "@/components/AuraText";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Head from "expo-router/head";
import { API } from "@/config/api";

// Importación estática para web
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Crea la promesa de Stripe
const stripePromise = loadStripe("pk_test_51S2EFIRwhQTBuCWGg60RzjqoaAoZQKUplUNsEu2xzJ64ujbCJGzrrHACoOJ8JBDE6G4OOwLTepRv9F1o2hcRK9nB00gflAM0c9");

import { apiPost, apiGet } from "../../../utils/fetchWithAuth";

export default function PaymentWeb() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <Head>
        <title>Realizar Pago</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <View style={styles.container}>
        {/* Fondo con PortraitHeader */}
        <PortraitHeader />

        {/* Header con gradiente */}
        <LinearGradient
          colors={["#B065C4", "#F4A45B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardheader}
        >
          {/* Botón volver */}
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

        {/* Imagen de tarjeta superpuesta */}
        <View style={styles.cardImageContainer}>
          <Image
            source={require("@/assets/images/card.png")} // Tu imagen de tarjeta
            style={styles.cardImage}
            resizeMode="contain" // Cambio para que no se corte
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Card principal con formulario */}
          <View style={styles.card}>
            {/* Precio dentro del card */}
            <AuraText style={styles.priceText} text="MXN$99 al mes" />
            <AuraText style={styles.title} text="Realiza tu Pago" />
            
            <Elements stripe={stripePromise}>
              <CheckoutForm router={router} />
            </Elements>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const CheckoutForm = ({ router }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Agregar estados para modal de confirmación:
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCardElement, setPendingCardElement] = useState(null);

  const showSuccessAlert = (message) => {
    setErrorMessage(''); // Limpiar errores
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000); 
  };

  const showErrorAlert = (message) => {
    setSuccessMessage(''); // Limpiar éxitos
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 8000); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    // Validaciones básicas
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

    // ✨ MOSTRAR MODAL DE CONFIRMACIÓN
    setPendingCardElement(cardElement);
    setShowConfirmModal(true);
  };

  // Funciones para el modal:
  const handleConfirmPayment = () => {
    setShowConfirmModal(false);
    processPayment(pendingCardElement);
    setPendingCardElement(null);
  };

  const handleCancelPayment = () => {
    setShowConfirmModal(false);
    setPendingCardElement(null);
  };

  // ✨ Actualizar: función processPayment
  const processPayment = async (cardElement) => {
    setProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Crea PaymentMethod con información adicional
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          email: email, // ← Este es el email del formulario
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

      const token = localStorage.getItem("token");
      console.log("Token being sent:", token);

      // ✨ ACTUALIZAR: Enviar el email del formulario como billingEmail
      const paymentData = {
        paymentMethodId: paymentMethod.id, 
        amount: 9900, 
        currency: "mxn",
        billingEmail: email, // ← Cambiar de 'email' a 'billingEmail' 
        phone: phone,
        country: country,
        sendConfirmationEmail: true
      };

      console.log("Request body:", paymentData);
      console.log("📧 Email del formulario que recibirá la confirmación:", email);

      const response = await apiPost(API.ENDPOINTS.PAYMENT.CONFIRM, paymentData);
      
      console.log("Response from backend:", response);

      const data = await response.json();
      
      if (data.success) {
        showSuccessAlert(
          data.message || 
          `¡Pago realizado con éxito! Bienvenido a AURA Premium 🎉\n📧 Se ha enviado un correo de confirmación a: ${email}`
        );
        
        // ✨ OPCIONAL: Envío manual de email solo si el backend no lo hizo automáticamente
        if (!data.emailSent) {
          console.log('⚠️ Email not sent automatically, sending manually...');
          await sendManualConfirmationEmail(data, email); // ← Usar email del formulario
        } else {
          console.log(`✅ Confirmation email sent automatically to: ${email}`);
        }
        
        // Redirigir después de 5 segundos para que el usuario lea el mensaje
        setTimeout(() => {
          router.replace("/home");
        }, 5000);
      } else {
        showErrorAlert(`Error en el pago: ${data.error || 'Ocurrió un error inesperado'}`);
      }

    } catch (error) {
      console.error('Error during payment:', error);
      showErrorAlert('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  // ACTUALIZAR: Función para envío manual de email (backup)
  const sendManualConfirmationEmail = async (paymentData, userEmail) => {
    try {
      console.log('📧 Sending manual payment confirmation email to:', userEmail);

      const emailResponse = await apiPost(API.ENDPOINTS.SEND_PAYMENT_CONFIRMATION, {
        email: email, // ← Usar email del formulario
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
      // No mostramos error al usuario porque el pago ya fue exitoso
    }
  };

  // ✨ AGREGAR: Función para envío manual por separado (si necesitas)
  const sendManualEmail = async () => {
    try {
      console.log('📧 Sending separate manual email...');
      
      await apiPost("/auth/send-payment-confirmation", {
        email: email,
        paymentData: {
          amount: '99.00',
          currency: 'MXN',
          paymentId: 'manual_request',
          date: new Date().toISOString(),
          phone: phone,
          country: country
        }
      });
      
      showSuccessAlert('📧 Email de confirmación enviado exitosamente');
    } catch (error) {
      console.error('Error sending separate manual email:', error);
      showErrorAlert('Error enviando email de confirmación');
    }
  };

  return (
    <View style={styles.form}>
      {/* Modal de confirmación */}
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

      {/* Información del contacto */}
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

      {/* Información de la tarjeta */}
      <Text style={styles.sectionTitle}>Información de la tarjeta</Text>
      
      {/* Stripe Card Element */}
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

      {/* País/Región */}
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

      {/* Botón de Pago */}
      <TouchableOpacity
        style={[styles.payButton, processing && styles.payButtonDisabled]}
        onPress={handleSubmit}
        disabled={processing}
      >
        <AuraText style={styles.payButtonText} text={processing ? "Procesando..." : "Pagar MXN$99"} />
      </TouchableOpacity>

      {/* Agregar después del botón de pago principal */}
      <TouchableOpacity
        style={[styles.secondaryButton]}
        onPress={sendManualEmail}
        disabled={processing}
      >
        <Text style={styles.secondaryButtonText}>📧 Reenviar Email de Confirmación</Text>
      </TouchableOpacity>
    </View>
  );
};

// Componente PortraitHeader (igual que en el perfil)
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
  // ...estilos existentes...
  
  successAlert: {
    backgroundColor: '#D4F4DD',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
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
  // Estilos del fondo (igual que en perfil)
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
});
