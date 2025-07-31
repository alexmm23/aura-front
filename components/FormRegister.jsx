import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "./FormInput";
import PrimaryButton from "./PrimaryButton";
import Link from "./Link";
import { useRouter } from "expo-router";
import ProgressBar from "./ProgressBar";

const FormRegister = ({
  formData,
  setFormData,
  errors,
  handleSubmit,
  isSubmitting = false,
}) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const apellidosInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const router = useRouter();

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Función para calcular fortaleza de contraseña (0 a 1)
  const checkPasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 0.3;
    if (/\d/.test(password)) strength += 0.3;
    if (/[A-Z]/.test(password)) strength += 0.2;
    if (/[^A-Za-z0-9]/.test(password)) strength += 0.2;

    return Math.min(strength, 1); // Asegurar que no pase de 1
  };

  // Función para determinar color según fortaleza
  const passwordStrengthColor = (strength) => {
    if (strength < 0.4) return "#FF5252"; // Rojo - Débil
    if (strength < 0.7) return "#FFA500"; // Naranja - Media
    return "#4CAF50"; // Verde - Fuerte
  };

  // Función para texto descriptivo
  const passwordStrengthText = (strength) => {
    if (strength < 0.4) return "Contraseña débil";
    if (strength < 0.7) return "Contraseña media";
    return "Contraseña fuerte";
  };

  return (
    <View
      style={[styles.formContainer, isLandscape && styles.landscapeAdjustment]}
    >
      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      <FormInput
        placeholder="Nombre: "
        value={formData.nombre}
        onChangeText={(text) => handleChange("nombre", text)}
        onSubmitEditing={() => apellidosInputRef.current?.focus()}
        error={errors.nombre}
        autoFocus
      />

      <FormInput
        placeholder="Apellidos: "
        value={formData.apellidos}
        onChangeText={(text) => handleChange("apellidos", text)}
        onSubmitEditing={() => emailInputRef.current?.focus()}
        ref={apellidosInputRef}
        error={errors.apellidos}
      />

      <FormInput
        placeholder="Correo Electrónico: "
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        ref={emailInputRef}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <View style={styles.passwordContainer}>
        <FormInput
          placeholder="Contraseña: "
          value={formData.password}
          onChangeText={(text) => {
            handleChange("password", text);
            setPasswordStrength(checkPasswordStrength(text));
          }}
          onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          secureTextEntry={!showPassword}
          ref={passwordInputRef}
          error={errors.password}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#919191"
          />
        </TouchableOpacity>
      </View>

      {formData.password.length > 0 && (
        <View style={styles.passwordStrengthContainer}>
          <ProgressBar
            progress={passwordStrength}
            color={passwordStrengthColor(passwordStrength)}
          />
          <Text
            style={[
              styles.passwordStrengthText,
              { color: passwordStrengthColor(passwordStrength) },
            ]}
          >
            {passwordStrengthText(passwordStrength)}
          </Text>
        </View>
      )}

      <View style={styles.passwordContainer}>
        <FormInput
          placeholder="Confirmar Contraseña: "
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
          onSubmitEditing={handleSubmit}
          secureTextEntry={!showConfirmPassword}
          ref={confirmPasswordInputRef}
          error={errors.confirmPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={24}
            color="#919191"
          />
        </TouchableOpacity>
      </View>

      <PrimaryButton
        title="Registrarse"
        onPress={handleSubmit}
        disabled={isSubmitting}
        loading={isSubmitting}
      />

      <Link
        title="¿Ya tienes una cuenta? Inicia sesión"
        onPress={() => router.replace("/(auth)/login")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },
  landscapeAdjustment: {
    maxWidth: 700,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  passwordStrengthContainer: {
    width: "100%",
    marginTop: 5,
    marginBottom: 15,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    justifyContent: "center", // Ayuda a centrar el contenido
  },
  passwordInput: {
    paddingRight: 50, // Espacio para el icono
    marginBottom: 0, // Remover margen para que el contenedor lo maneje
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -12, // La mitad del tamaño del icono (24px / 2 = 12px)
    padding: 8,
    zIndex: 1,
    borderRadius: 4,
  },
  passwordStrengthText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    // Agrega aquí la fuente que uses en tu app
    // fontFamily: 'TuFuente',
  },
});

//export default FormRegister;

export default FormRegister;
