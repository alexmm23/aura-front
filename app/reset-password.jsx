import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { API, buildApiUrl } from "@/config/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import Svg, { Path } from "react-native-svg";
import { AuraText } from "@/components/AuraText";
import { AuraTextInput } from "@/components/AuraTextInput";
import { Image } from "react-native";
import {
  apiPostForgotPassword,
  apiGetResetToken,
  apiPostResetPassword,
} from "@/utils/resetPasswordApi";

const LandscapeHeader = ({ colors, styles, children }) => {
  return (
    <View style={localStyles.container}>
      {/* Lado Izquierdo con Imagen y Texto */}
      <View style={localStyles.leftSide}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 500 500"
          preserveAspectRatio="xMidYMid meet"
          style={localStyles.svgBackground}
        >
          <Path
            d="M285.812 156.109C136.142 156.109 172.653 353.184 -85 214.631C-85 132.862 -234.669 -290.5 -85 -290.5C64.6692 -290.5 708 -462 457 214.631C457 296.401 435.481 156.109 285.812 156.109Z"
            fill="#7752CC"
          />
        </Svg>
        <Image
          source={require("@/assets/images/books_Forgot.png")}
          style={localStyles.image}
          resizeMode="contain"
        />
      </View>

      {/* Lado Derecho donde se colocará el formulario */}
      <View style={localStyles.rightSide}>{children}</View>
    </View>
  );
};

const PortraitHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 349 371"
      style={styles.svg}
    >
      <Path
        d="M285.812 156.109C136.142 156.109 172.653 353.184 -85 214.631C-85 132.862 33.4293 -130 183.099 -130C332.768 -130 457 132.862 457 214.631C457 296.401 435.481 156.109 285.812 156.109Z"
        fill={colors.purple}
      />
    </Svg>

    <View style={styles.headerContent}>
      <Image
        source={require("@/assets/images/books_Forgot.png")}
        style={styles.headerImageLandscape}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();

  // Refs para prevenir ejecuciones múltiples
  const hasVerifiedToken = useRef(false);
  const renderCount = useRef(0);

  // Incrementar contador de renders
  renderCount.current += 1;
  const { width, height } = useWindowDimensions();
  const colors = Colors.light;

  const [isLandscape, setIsLandscape] = useState(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.screen && window.screen.orientation) {
        return window.screen.orientation.type.startsWith("landscape");
      }
      return window.innerWidth > window.innerHeight;
    }
    return width > height;
  });

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleOrientation = () => {
        if (window.screen && window.screen.orientation) {
          setIsLandscape(window.screen.orientation.type.startsWith("landscape"));
        } else {
          setIsLandscape(window.innerWidth > window.innerHeight);
        }
      };
      window.addEventListener("orientationchange", handleOrientation);
      window.addEventListener("resize", handleOrientation);
      return () => {
        window.removeEventListener("orientationchange", handleOrientation);
        window.removeEventListener("resize", handleOrientation);
      };
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") {
      setIsLandscape(width > height);
    }
  }, [width, height]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLargeScreen = width >= 928;

  const [isSuccess, setIsSuccess] = useState(false); // Agregar este estado

  useEffect(() => {
    if (hasVerifiedToken.current) {
      return;
    }
    const verifyTokenOnce = async () => {
      hasVerifiedToken.current = true; // Marcar como ejecutado INMEDIATAMENTE

      if (!token) {
        setIsLoading(false);
        setErrors({ token: "Token no encontrado" });
        return;
      }

      try {
        setIsLoading(true);

        const response = await apiGetResetToken(
          `${API.ENDPOINTS.AUTH.VERIFY_RESET_TOKEN}/${token}`
        );

        if (response.ok) {
          setIsValidToken(true);
          setUserData(response.data.user);
          setErrors({});
        } else {
          setIsValidToken(false);
          setErrors({
            token: response.data?.error || "Token inválido o expirado",
          });
        }
      } catch (error) {
        setIsValidToken(false);
        setErrors({ token: "Error al verificar el token" });
      } finally {
        setIsLoading(false);
      }
    };

    verifyTokenOnce();
  }, [token]);
  const validatePassword = (pass) => {
    if (pass.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(pass)) {
      return "La contraseña debe contener al menos una minúscula, una mayúscula y un número";
    }

    return null;
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const response = await apiPostResetPassword(
        API.ENDPOINTS.AUTH.CONFIRM_RESET_PASSWORD,
        {
          token,
          password,
          confirmPassword,
        }
      );

      if (response.ok) {
        // Cambiar a estado de éxito
        setIsSuccess(true);
        //setIsValidToken(false); // Para ocultar el formulario
        setErrors({}); // Limpiar errores

        // Mostrar mensaje de éxito y redirigir después de 3 segundos
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 3000);
      } else {
        setErrors({
          form: response.data?.error || "Error al restablecer la contraseña",
        });
      }
    } catch (error) {
      setErrors({ form: "Error al procesar la solicitud" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formularioCompleto = (
    <View style={styles.card}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <AuraText style={styles.title} text="Verificando..." />
          <AuraText
            style={styles.subtitle}
            text="Por favor espera mientras verificamos tu token"
          />
        </View>
      ) : isSuccess ? (
        <View style={styles.loadingContainer}>
          <AuraText style={styles.title} text="¡Contraseña actualizada!" />
          <AuraText
            style={styles.subtitle}
            text="Tu contraseña ha sido restablecida correctamente. Serás redirigido al login en unos segundos..."
          />
        </View>
      ) : !isValidToken ? (
        <View style={styles.errorContainer}>
          <AuraText style={styles.title} text="Token Inválido" />
          <AuraText
            style={styles.subtitle}
            text={errors.token || "El enlace no es válido o ha expirado"}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/(auth)/forgotpassword")}
          >
            <AuraText style={styles.buttonText} text="Solicitar nuevo enlace" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <AuraText style={styles.title} text="Restablecer Contraseña" />

          {userData && (
            <AuraText
              style={styles.subtitle}
              text={`Hola ${userData.name}, ingresa tu nueva contraseña`}
            />
          )}

          {errors.form && (
            <Text style={[styles.errorText, styles.formError]}>
              {errors.form}
            </Text>
          )}

          <AuraTextInput
            style={styles.input}
            placeholder="Nueva Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <AuraTextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          <View style={styles.passwordRequirements}>
            <AuraText
              style={styles.requirementText}
              text="La contraseña debe contener:"
            />
            <AuraText
              style={styles.requirementText}
              text="• Al menos 8 caracteres"
            />
            <AuraText
              style={styles.requirementText}
              text="• Una letra minúscula"
            />
            <AuraText
              style={styles.requirementText}
              text="• Una letra mayúscula"
            />
            <AuraText style={styles.requirementText} text="• Un número" />
          </View>

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <AuraText
              style={styles.buttonText}
              text={isSubmitting ? "Procesando..." : "Restablecer Contraseña"}
            />
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.replace("/(auth)/login")}
      >
        <AuraText style={styles.linkText} text="Volver al inicio de sesión" />
      </TouchableOpacity>
    </View>
  );

  const Content = (
    <View style={styles.innerContainer}>
      <StatusBar style="light" />
      {isLandscape || isLargeScreen ? (
        <LandscapeHeader colors={colors} styles={styles}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {formularioCompleto}
          </ScrollView>
        </LandscapeHeader>
      ) : (
        <>
          <PortraitHeader colors={colors} styles={styles} />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {formularioCompleto}
          </ScrollView>
        </>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {Platform.OS === "web" ? Content : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {Content}
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4d7c2",
    position: "relative",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    marginTop: "50%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
    elevation: 3,
  },
  title: {
    fontSize: 35,
    fontWeight: "200",
    color: "#d987ba",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "100",
    color: "#919191",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#DDD7C2",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    width: "90%",
    fontSize: 18,
    color: "#919191",
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
    marginTop: 20,
    marginBottom: 25,
    width: "80%",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#11181C",
    fontWeight: "600",
    fontSize: 18,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#9068d9",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  passwordRequirements: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    width: "90%",
  },
  requirementText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  headerImageLandscape: {
    width: "100%",
    height: "80%",
    maxHeight: 500,
  },
  backgroundContainer: {
    height: 920,
    width: "100%",
    position: "absolute",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
});

const localStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#e7e1cf",
    borderRadius: 27,
    overflow: "hidden",
    width: "85%",
    maxHeight: 825,
    marginTop: 40,
    marginBottom: 40,
  },
  leftSide: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "45%",
    height: "50%",
    resizeMode: "contain",
    marginBottom: 20,
    zIndex: 2,
    position: "relative",
  },
  rightSide: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 40,
    marginTop: -250,
  },
  svgBackground: {
    position: "absolute",
    width: "130%",
    height: "150%",
    maxHeight: 800,
    marginTop: "-5%",
    marginLeft: "0%",
    zIndex: 0,
  },
});
