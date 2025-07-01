import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { API, buildApiUrl } from "@/config/api";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import Svg, { Path } from "react-native-svg";
import { AuraText } from "@/components/AuraText";
import { AuraTextInput } from "@/components/AuraTextInput";
import { Image } from "react-native";
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
      height="100%" // mantenemos esto para que escale
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
    }    try {
      const response = await fetch(
        buildApiUrl(API.ENDPOINTS.AUTH.RESET_PASSWORD),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setErrors({ form: data.message || "Error al enviar el correo" });
        return;
      }
      setEmail("");
      setErrors({});
      setIsSubmitted(true);
      router.replace("/(auth)/login");
    } catch (error) {
      setErrors({ form: "Error al procesar la solicitud" });
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
            ? "Hemos enviado un enlace de recuperación a tu correo electrónico"
            : ""
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

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <AuraText style={styles.buttonText} text="Enviar" />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer} />
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {isLandscape || isLargeScreen ? (
        <LandscapeHeader colors={colors} styles={styles}>
          {formularioCompleto}
        </LandscapeHeader>
      ) : (
        <>
          <PortraitHeader colors={colors} styles={styles} />
          {formularioCompleto}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e4d7c2",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    //alignSelf: "center",
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
  },
  headerImageLandscape: {
    width: "100%",
    height: "80%",
    maxHeight: 500,
  },
  // Estilos para modo vertical
  backgroundContainer: {
    height: 920, //AUMENTE PARA DAR ESPACIO
    width: "100%",
    position: "absolute",
    //justifyContent:"flex-end",
  },
  // Estilos para modo horizontal
  backgroundContainerLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "40%", // El header ocupa solo una parte del ancho en modo horizontal
    height: "100%",
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
    height: 350, // igual que el contenedor
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40, //mas espacio arriba
  },
  headerContentLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 30, // mas espacio al rededor
  },
  headerImage: {
    width: "90%",
    height: 250, //altura aumentada
  },
  headerImageLandscape: {
    width: "100%", // Ocupa todo el ancho disponible
    height: "80%", // Ocupa más altura
    maxHeight: 500, // Límite para pantallas grandes
  },
  formContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});

const localStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#e7e1cf", // Fondo general beige
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
    width: "45%", // puedes ajustar
    height: "50%", // o '100%' si quieres que cubra todo el alto del contenedor
    resizeMode: "contain",
    marginBottom: 20,
    zIndex: 2,
    position: "relative",
  },
  slogan: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  rightSide: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 40,
    marginTop: -250,
  },
  title: {
    fontSize: 28,
    color: "#c35f91",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#e7e1cf",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  link: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 20,
    color: "#666",
  },
  loginButton: {
    backgroundColor: "#f4a950",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
  },
  googleLogo: {
    width: 40,
    height: 40,
    alignSelf: "center",
    marginBottom: 10,
  },
  registerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#444",
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
