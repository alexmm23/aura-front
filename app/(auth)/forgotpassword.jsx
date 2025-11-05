import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { API, buildApiUrl } from "@/config/api";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import Svg, { Path } from "react-native-svg";
import { AuraText } from "@/components/AuraText";
import { AuraTextInput } from "@/components/AuraTextInput";
import { Image } from "react-native";
import { apiPostNoAuth } from "../../utils/fetchWithAuth";

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
          source={require("../../assets/images/books_Forgot.png")}
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
        source={require("../../assets/images/books_Forgot.png")}
        style={styles.headerImageLandscape}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default function ForgotPassword() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const colors = Colors.light;

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const isLargeScreen = width >= 928;
  const isLandscape = width > height;

  const handleSubmit = async () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!validateEmail(email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      const response = await apiPostNoAuth(API.ENDPOINTS.AUTH.RESET_PASSWORD, { email });
      if (response.ok) {
        setEmail("");
        setErrors({});
        setIsSubmitted(true);
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 3000);
      } else {
        setErrors({ form: "Error al procesar la solicitud" });
      }
    } catch (error) {
      console.error('Error enviando reset:', error);
      setErrors({ form: "Error al procesar la solicitud" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const Header = width > height ? LandscapeHeader : PortraitHeader;

  const formularioCompleto = (
    <View style={styles.card}>
      <AuraText style={styles.title} text="¿Olvidaste tu contraseña?" />

      <AuraText
        style={styles.subtitle}
        text={
          isSubmitted
            ? "Hemos enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y spam."
            : "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña"
        }
      />

      {errors.form && (
        <Text style={[styles.errorText, styles.formError]}>{errors.form}</Text>
      )}

      {!isSubmitted ? (
        <>
          <AuraTextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <AuraText 
              style={styles.buttonText} 
              text={isSubmitting ? "Enviando..." : "Enviar"} 
            />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer}>
          <AuraText style={styles.successText} text="✅ Enlace enviado" />
          <AuraText style={styles.successSubtext} text="Serás redirigido al login automáticamente..." />
        </View>
      )}

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.replace("/(auth)/login")}
      >
        <AuraText
          style={styles.linkText}
          text={
            isSubmitted
              ? "Volver al inicio de sesión"
              : "¿Recordaste tu contraseña? Inicia sesión"
          }
        />
      </TouchableOpacity>
    </View>
  );

  // Solo usar TouchableWithoutFeedback en móvil, no en web
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
      {Platform.OS === 'web' ? Content : (
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
  },
  innerContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: Platform.OS === "ios" ? "30%" : "50%",
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
  successContainer: {
    alignItems: "center",
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#f0f9f0",
    borderRadius: 10,
    width: "90%",
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#28a745",
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
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
