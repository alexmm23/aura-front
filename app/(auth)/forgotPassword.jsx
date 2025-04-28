import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import Svg, { Path } from "react-native-svg";
import { AuraText } from "@/components/AuraText";
import { AuraTextInput } from "@/components/AuraTextInput";

export default function ForgotPassword() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const colors = Colors.light;
  
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

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
      // Aquí iría la llamada real a la API
      setIsSubmitted(true);
      setTimeout(() => router.replace("/(auth)/login"), 3000);
    } catch (error) {
      setErrors({ form: "Error al procesar la solicitud" });
    }
  };

  const Header = width > height ? LandscapeHeader : PortraitHeader;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      
      <Header colors={colors} styles={styles} />

      <View style={styles.card}>
        <AuraText 
          style={styles.title} 
          text="¿Olvidaste tu contraseña?" 
        />
        
        <AuraText 
          style={styles.subtitle} 
          text={isSubmitted 
            ? "Hemos enviado un enlace de recuperación a tu correo electrónico" 
            : ""} 
        />

        {errors.form && (
          <Text style={[styles.errorText, styles.formError]}>
            {errors.form}
          </Text>
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
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <AuraText style={styles.buttonText} text="Enviar"/>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.successContainer} />
        )}

<TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.replace("/(auth)/login")}>
          <AuraText 
            style={styles.linkText} 
            text={isSubmitted ? "Volver al inicio de sesión" : "¿Recordaste tu contraseña? Inicia sesión"} 
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const LandscapeHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainerLandscape}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
      style={styles.svg}
    >
      <Path
        d="M285.812 156.109C136.142 156.109 172.653 353.184 -85 214.631C-85 132.862 33.4293 -130 183.099 -130C332.768 -130 457 132.862 457 214.631C457 296.401 435.481 156.109 285.812 156.109Z"
        fill={colors.purple}
      />
    </Svg>

    <View style={styles.headerContentLandscape}>
      
    </View>
  </View>
);

const PortraitHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="150%"
      preserveAspectRatio="none"
      viewBox="0 0 349 371"
      style={styles.svg}
    >
      <Path
        d="M285.812 156.109C136.142 156.109 172.653 353.184 -85 214.631C-85 132.862 33.4293 -130 183.099 -130C332.768 -130 457 132.862 457 214.631C457 296.401 435.481 156.109 285.812 156.109Z"
        fill={colors.purple}
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e4d7c2",
    position: "relative",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginTop: "-20%",
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
    color: "#919191",
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
  backgroundContainer: {
    height: 350,
    width: "100%",
    position: "relative",
  },
  backgroundContainerLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "40%",
    height: "100%",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContentLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  headerImageLandscape: {
    width: "100%",
    height: "80%",
    maxHeight: 500,
  },
});
