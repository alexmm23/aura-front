import React, { useRef } from "react"; // ✅ Agregar useRef
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
      onSubmit();
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

  // Determinar si el botón está deshabilitado
  const isButtonDisabled = isSubmitting || isBlocked;

  return (
    <View style={styles.card}>
      <AuraText style={styles.title} text="Inicia Sesion" />
      <AuraText style={styles.subtitle} text="Organiza, Estudia, Aprende" />

      {errors.form && (
        <Text style={[styles.errorText, styles.formError]}>{errors.form}</Text>
      )}

      <AuraTextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={formData.email}
        onChangeText={(text) => onChangeText("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isButtonDisabled}
        onKeyPress={handleKeyPress}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <View style={styles.passwordContainer}>
        <AuraTextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          value={formData.password}
          onChangeText={(text) => onChangeText("password", text)}
          secureTextEntry={!showPassword}
          editable={!isButtonDisabled}
          onKeyPress={handleKeyPress}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onTogglePassword}
          disabled={isButtonDisabled}
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

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.replace("/(auth)/forgotpassword")}
        disabled={isButtonDisabled}
      >
        <AuraText
          style={styles.linkTextContraseña}
          text="Olvide mi contraseña"
        />
      </TouchableOpacity>

      <PrimaryButton
        title={getButtonText()}
        onPress={onSubmit}
        disabled={isButtonDisabled}
        style={styles}
      />

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.push("/register")}
        disabled={isButtonDisabled}
      >
        <AuraText
          style={styles.linkText}
          text="¿No tienes una cuenta? Regístrate"
        />
      </TouchableOpacity>
    </View>
  );
};