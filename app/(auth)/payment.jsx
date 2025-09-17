import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { AuraText } from "@/components/AuraText";
import { useRouter } from "expo-router";

// Importación estática para web
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Crea la promesa de Stripe
const stripePromise = loadStripe("pk_test_51S2EFIRwhQTBuCWGg60RzjqoaAoZQKUplUNsEu2xzJ64ujbCJGzrrHACoOJ8JBDE6G4OOwLTepRv9F1o2hcRK9nB00gflAM0c9");

import { apiPost, apiGet } from "../../utils/fetchWithAuth";


export default function PaymentWeb() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      <AuraText style={styles.title} text="Formulario de Pago - $99.00 MXN" />
      <Elements stripe={stripePromise}>
        <CheckoutForm router={router} />
      </Elements>
    </View>
  );
}

const CheckoutForm = ({ router }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      alert("Por favor ingresa los datos de la tarjeta");
      return;
    }

    setProcessing(true);

    // Crea PaymentMethod
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      alert(`Error: ${error.message}`);
      setProcessing(false);
      return;
    }

    // Get your token from context, localStorage, or however you store it
    const token = localStorage.getItem("token"); // or from your auth context

    console.log("Token being sent:", token);
    console.log("Request body:", { paymentMethodId: paymentMethod.id, amount: 9900, currency: "mxn" });

    // Llamada a tu endpoint del backend
    const response = await apiPost("/payment/payments/confirm", { paymentMethodId: paymentMethod.id, amount: 9900, currency: "mxn" });
    // const response = await fetch("http://localhost:3000/api/payment/payments/confirm", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${token}`, // <-- Add this line
    //   },
    //   body: JSON.stringify({ paymentMethodId: paymentMethod.id, amount: 9900, currency: "mxn" }),
    // });
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
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <CardElement options={{ style: { base: { fontSize: "16px", color: "#000" } } }} />
      <button type="submit" style={styles.button} disabled={processing}>
        <AuraText style={styles.buttonText} text={processing ? "Procesando..." : "Pagar $99.00 MXN"} />
      </button>
    </form>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#e4d7c2",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24 },
  button: {
    backgroundColor: "#f5b764",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  buttonText: { fontWeight: "600", fontSize: 20 },
});

