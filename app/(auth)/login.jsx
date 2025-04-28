import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/Colors";
import Svg, { Path } from "react-native-svg";
import { AuraText } from "@/components/AuraText"; // Adjust the import path as necessary
import { AuraTextInput } from "@/components/AuraTextInput"; // Adjust the import path as necessary


export default function Login() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const { login } = useAuth();
  const colors = Colors.light;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    // Basic validation
    const newErrors = {};
    if (!formData.email)
      newErrors.email = "El correo electrónico es obligatorio";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Replace with your actual API call
      // const response = await fetch('your-api-url/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password,
      //   }),
      // });

      // const data = await response.json();

      // if (response.ok) {
      //   // Store token and user data
      //   await login(data.token, data.user);
      //   router.replace('/(tabs)');
      // } else {
      //   setErrors({ form: data.message || 'Credenciales inválidas' });
      // }

      // For demo purposes, simulate successful login
      await login("demo-token", {
        email: formData.email,
        name: "Usuario Demo",
      });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ form: "Error de conexión" });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />

        {/* Header con SVG */}
      {isLandscape ? (
        <LandscapeHeader colors={colors} styles={styles} />
      ) : (
        <PortraitHeader colors={colors} styles={styles} />
      )}


      <View style={styles.card}>
        <AuraText style={styles.title} text="Inicia Sesion" />
        <AuraText style={styles.subtitle} text="Organiza, Estudia, Aprende" />

        {errors.form && (
          <Text style={[styles.errorText, styles.formError]}>
            {errors.form}
          </Text>
        )}

        <AuraTextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <AuraTextInput
          style={styles.input}
          placeholder="Contraseña"
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
          secureTextEntry
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.replace("/(auth)/forgotPassword")}>
          <AuraText style={styles.linkTextContraseña} text="Olvide mi contraseña"></AuraText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <AuraText style={styles.buttonText} text = "Ingresar"/>
        </TouchableOpacity>

        {/*Logo de google en svg se cambia */}
        <Svg width={50} height={50} viewBox="0 0 24 24" style={styles.googleIcon}>
          <Path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <Path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <Path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <Path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </Svg>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.replace("/(auth)/register")}>
          <AuraText style={styles.linkText} text="¿No tienes una cuenta? Regístrate"></AuraText>
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
         d="M411.5 253.452C328 515.452 258 232.5 159 208C30 165 18 390 -31 191.5C-73 -27.5 64.1476 -74.5212 173.5 -74.5212C518 -134.5 291.5 215.452 411.5 253.452Z"
        fill={colors.purple}
      />
    </Svg>

    <View style={styles.headerContentLandscape}>
      <Image
        source={require("../../assets/images/login_students.png")}
        style={styles.headerImageLandscape}
        resizeMode="contain"
      />
    </View>
  </View>
);

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
         d="M411.5 253.452C328 515.452 258 232.5 159 208C30 165 18 390 -31 191.5C-73 -27.5 64.1476 -74.5212 173.5 -74.5212C518 -134.5 291.5 215.452 411.5 253.452Z"
        fill={colors.purple}
      />
    </Svg>

    <View style={styles.headerContent}>
      <Image
        source={require("../../assets/images/login_students.png")}
        style={styles.headerImage}
        resizeMode="contain"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e4d7c2",
    position: "relative",
  },
  header: {
    backgroundColor: "#9068d9",
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
    marginTop: "-60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
    elevation: 3,
  },
  title: {
    fontSize: 52,
    fontWeight: "200",
    color: "#d987ba",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "100",
    color: "#919191",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#DDD7C2",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    marginTop: 25,
    width:"90%",
    fontSize: 18,
    color:"#919191",
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
    marginTop: 10,
    marginBottom: 25,
    width: "65%",
    height:"12%",
  },
  buttonText: {
    color: "#919191",
    fontWeight: "600",
    fontSize: 20,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#9068d9",
    fontSize: 14,
  },
  linkTextContraseña: {
    color: "#919191",
    fontSize: 14,
    fontWeight: 600,
    marginTop: 0,
  },
   // Estilos para modo vertical
   backgroundContainer: {
    height: 600,                //AUMENTE PARA DAR ESPACIO
    width: "100%",
    position: "relative",
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
    height: 350,              // igual que el contenedor
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,          //mas espacio arriba
  },
  headerContentLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 30             // mas espacio al rededor
  },
  headerImage: {
    width: "90%",
    height: 250,            //altura aumentada
    marginBottom: 20,
    marginTop:15,
  },
  headerImageLandscape: {
    width: "100%", // Ocupa todo el ancho disponible
    height: "80%", // Ocupa más altura
    maxHeight: 500, // Límite para pantallas grandes
  },
});
