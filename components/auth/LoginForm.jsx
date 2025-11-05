import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuraText } from "@/components/AuraText";
import { AuraTextInput } from "@/components/AuraTextInput";
import PrimaryButton from "@/components/PrimaryButton";

export const LoginForm = ({
  formData,
  errors,
  showPassword,
  isSubmitting,
  isBlocked,
  remainingTime,
  onChangeText,
  onSubmit,
  onTogglePassword,
  styles,
}) => {
  const router = useRouter();

  const handleKeyPress = (e) => {
    if (Platform.OS === "web" && e.nativeEvent.key === "Enter") {
      // Solo ejecutar submit si no está bloqueado o enviando
      if (!isSubmitting && !isBlocked) {
        onSubmit();
      }
    }
  };

  // Determinar el texto del botón
  const getButtonText = () => {
    if (isBlocked && remainingTime > 0) {
      return `Bloqueado (${remainingTime}s)`;
    }
    if (isSubmitting) {
      return "Ingresando...";
    }
    return "Ingresar";
  };

  // ✅ Solo el botón de submit está deshabilitado
  const isSubmitDisabled = isSubmitting || isBlocked;

  return (
    <View style={styles.card}>
      <AuraText style={styles.title} text="Inicia Sesion" />
      <AuraText style={styles.subtitle} text="Organiza, Estudia, Aprende" />

      {errors.form && (
        <Text style={[styles.errorText, styles.formError]}>{errors.form}</Text>
      )}

      {/* ✅ Input de email siempre habilitado */}
      <AuraTextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={formData.email}
        onChangeText={(text) => onChangeText("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
        onKeyPress={handleKeyPress}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* ✅ Input de contraseña siempre habilitado */}
      <View style={styles.passwordContainer}>
        <AuraTextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          value={formData.password}
          onChangeText={(text) => onChangeText("password", text)}
          secureTextEntry={!showPassword}
          onKeyPress={handleKeyPress}
        />
        {/* ✅ Botón de ojo siempre habilitado */}
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onTogglePassword}
        >
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color="#919191"
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      {/* ✅ Link de contraseña olvidada siempre habilitado */}
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.replace("/(auth)/forgotpassword")}
      >
        <AuraText
          style={styles.linkTextContraseña}
          text="Olvide mi contraseña"
        />
      </TouchableOpacity>

      {/* ✅ Solo este botón se deshabilita */}
      <PrimaryButton
        title={getButtonText()}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
        style={styles}
      />

      {/* ✅ Link de registro siempre habilitado */}
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.push("/register")}
      >
        <AuraText
          style={styles.linkText}
          text="¿No tienes una cuenta? Regístrate"
        />
      </TouchableOpacity>
    </View>
  );
};