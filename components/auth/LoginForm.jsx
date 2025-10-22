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
        editable={!isSubmitting}
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
          editable={!isSubmitting}
          onKeyPress={handleKeyPress}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onTogglePassword}
          disabled={isSubmitting}
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
        disabled={isSubmitting}
      >
        <AuraText
          style={styles.linkTextContraseña}
          text="Olvide mi contraseña"
        />
      </TouchableOpacity>

      <PrimaryButton
        title={isSubmitting ? "Ingresando..." : "Ingresar"}
        onPress={onSubmit}
        disabled={isSubmitting}
        style={styles}
      />

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.push("/register")}
        disabled={isSubmitting}
      >
        <AuraText
          style={styles.linkText}
          text="¿No tienes una cuenta? Regístrate"
        />
      </TouchableOpacity>
    </View>
  );
};
