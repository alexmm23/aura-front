import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    // Basic validation
    const newErrors = {};
    if (!formData.email)
      newErrors.email = "El correo electrónico es obligatorio";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Replace with your actual API call
      // const response = await fetch('your-api-url/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password,
      //   }),
      // });

      // const data = await response.json();

      // if (response.ok) {
      //   // Store token and user data
      //   await login(data.token, data.user);
      //   router.replace('/(tabs)');
      // } else {
      //   setErrors({ form: data.message || 'Credenciales inválidas' });
      // }

      // For demo purposes, simulate successful login
      await login("demo-token", {
        email: formData.email,
        name: "Usuario Demo",
      });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ form: "Error de conexión" });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Image
          source={require("../../assets/images/books-illustration.png")}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>

        {errors.form && (
          <Text style={[styles.errorText, styles.formError]}>
            {errors.form}
          </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
          secureTextEntry
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.replace("/(auth)/register")}
        >
          <Text style={styles.linkText}>¿No tienes una cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e4d7c2",
  },
  header: {
    backgroundColor: "#9068d9",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  headerImage: {
    width: "80%",
    height: 120,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#d987ba",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#e4d7c2",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginLeft: 4,
    marginTop: -6,
    marginBottom: 6,
  },
  formError: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#f5b764",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#9068d9",
    fontSize: 14,
  },
});
