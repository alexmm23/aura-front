import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import FormInput from "./FormInput";
import PrimaryButton from "./PrimaryButton";
import Link from "./Link";
import { useRouter } from "expo-router";

const FormRegister = ({
  formData,
  setFormData,
  errors,
  handleSubmit,
  isSubmitting = false,
}) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

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

  // Renderizado condicional basado en la orientación
  return isLandscape ? (
    <LandscapeForm
      formData={formData}
      handleChange={handleChange}
      errors={errors}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      refs={{
        apellidosInputRef,
        emailInputRef,
        passwordInputRef,
        confirmPasswordInputRef,
      }}
      router={router}
    />
  ) : (
    <PortraitForm
      formData={formData}
      handleChange={handleChange}
      errors={errors}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      refs={{
        apellidosInputRef,
        emailInputRef,
        passwordInputRef,
        confirmPasswordInputRef,
      }}
      router={router}
    />
  );
};

// Componente para orientación vertical
const PortraitForm = ({
  formData,
  handleChange,
  errors,
  handleSubmit,
  isSubmitting,
  refs,
  router,
}) => {
  const {
    apellidosInputRef,
    emailInputRef,
    passwordInputRef,
    confirmPasswordInputRef,
  } = refs;

  return (
    <View style={styles.formContainer}>
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

      <FormInput
        placeholder="Contraseña: "
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
        onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
        secureTextEntry
        ref={passwordInputRef}
        error={errors.password}
      />

      <FormInput
        placeholder="Confirmar Contraseña: "
        value={formData.confirmPassword}
        onChangeText={(text) => handleChange("confirmPassword", text)}
        onSubmitEditing={handleSubmit}
        secureTextEntry
        ref={confirmPasswordInputRef}
        error={errors.confirmPassword}
      />

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

// Componente para orientación horizontal
const LandscapeForm = ({
  formData,
  handleChange,
  errors,
  handleSubmit,
  isSubmitting,
  refs,
  router,
}) => {
  const {
    apellidosInputRef,
    emailInputRef,
    passwordInputRef,
    confirmPasswordInputRef,
  } = refs;

  return (
    <View style={styles.landscapeContainer}>
      <View style={styles.landscapeColumn}>
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
      </View>

      <View style={styles.landscapeColumn}>
        <FormInput
          placeholder="Contraseña: "
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
          onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          secureTextEntry
          ref={passwordInputRef}
          error={errors.password}
        />

        <FormInput
          placeholder="Confirmar Contraseña: "
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
          onSubmitEditing={handleSubmit}
          secureTextEntry
          ref={confirmPasswordInputRef}
          error={errors.confirmPassword}
        />

        <View>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
  },
  landscapeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  landscapeColumn: {
    width: "48%", // Deja un pequeño espacio entre columnas
  },
});

export default FormRegister;
