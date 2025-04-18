import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/Colors";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.apellidos)
      newErrors.apellidos = "Los apellidos son obligatorios";

    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const formErrors = validate();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // TODO: Implementar el registro con la API
    console.log("Form submitted:", formData);

    // Simulate successful registration and login
    const token = "demo-token"; // Replace with actual token from API
    const user = {
      email: formData.email,
      nombre: formData.nombre,
      apellidos: formData.apellidos,
    };

    login(token, user);
    router.replace("/(auth)/login");
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
        <Text style={styles.title}>Registrate</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre(s)"
          value={formData.nombre}
          onChangeText={(text) => handleChange("nombre", text)}
        />
        {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Apellidos"
          value={formData.apellidos}
          onChangeText={(text) => handleChange("apellidos", text)}
        />
        {errors.apellidos && (
          <Text style={styles.errorText}>{errors.apellidos}</Text>
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

        <TextInput
          style={styles.input}
          placeholder="Comprueba la contraseña"
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Registrarme</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.linkText}>
            ¿Ya tienes una cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e4d7c2", // Beige background as shown in image
  },
  header: {
    backgroundColor: "#9068d9", // Purple background for the header
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
    color: "#d987ba", // Pink color for the title
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#e4d7c2", // Beige input background
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
  button: {
    backgroundColor: "#f5b764", // Orange button
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
    color: "#9068d9", // Purple link text
    fontSize: 14,
  },
});
