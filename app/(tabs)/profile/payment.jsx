import React, { useState, useEffect } from "react";
import { 
  View, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  useWindowDimensions 
} from "react-native";
import { AuraText } from "@/components/AuraText";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Head from "expo-router/head";

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
  const [phone, setPhone] = useState(''); // Cambio: teléfono en vez de código postal

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      alert("Por favor ingresa los datos de la tarjeta");
      return;
    }

    setProcessing(true);

    // Crea PaymentMethod con información adicional
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        email: email,
        phone: phone, // Cambio: usar teléfono
        address: {
          country: country,
        },
      },
    });

    if (error) {
      alert(`Error: ${error.message}`);
      setProcessing(false);
      return;
    }

    const token = localStorage.getItem("token");
    console.log("Token being sent:", token);
    console.log("Request body:", { 
      paymentMethodId: paymentMethod.id, 
      amount: 9900, 
      currency: "mxn",
      email: email,
      phone: phone // Cambio: usar teléfono
    });

    const response = await apiPost("/payment/payments/confirm", { 
      paymentMethodId: paymentMethod.id, 
      amount: 9900, 
      currency: "mxn",
      email: email,
      phone: phone // Cambio: enviar teléfono
    });
    
    console.log("Response from backend:", response);

    const data = await response.json();
    if (data.success) {
      alert("Pago realizado con éxito");
      router.replace("/home");
    } else {
      alert("Error en el pago: " + data.error);
    }

    setProcessing(false);
  };

  return (
    <View style={styles.form}>
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
        <AuraText style={styles.payButtonText} text={processing ? "Procesando..." : "Pagar"} />
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
  container: {
    flex: 1,
    backgroundColor: "#EDE6DB", // Mismo color de fondo que el perfil
  },
  cardheader: {
    marginLeft: 20,
    borderRadius: 30,
    marginTop: 30,
    marginRight: 20,
    height: "25%", // Reducido para que sea más pequeño
    backgroundColor: "linear-gradient(90deg, #B065C4 0%, #F4A45B 100%)",
    justifyContent: "flex-start", // Cambio para alinear el botón arriba
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
    marginTop: -40, // Ajustado para la nueva altura del header
  },
  cardImage: {
    width: 250, // Más ancha para evitar corte
    height: 150, // Proporcionalmente más alta
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888", // Color gris como pediste
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
    width: "90%", // Más pequeña (era 100%)
    maxWidth: 800, // Límite máximo de ancho
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
    backgroundColor: '#F4A45B', // Mismo color que los botones del perfil
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
