import React from "react";
import { Image, View, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Componente que maneja la carga de imágenes de forma segura
 * en todas las plataformas (web, iOS, Android)
 */
export default function SafeImage({
  uri,
  style,
  resizeMode = "cover",
  fallbackIcon = "image-outline",
  fallbackIconSize = 32,
  fallbackIconColor = "#ccc",
}) {
  const [error, setError] = React.useState(false);

  // Procesar URI para evitar problemas CORS
  const getProcessedUri = (originalUri) => {
    if (!originalUri) return null;

    // Para web, agregar parámetros para evitar CORS
    if (Platform.OS === "web") {
      const separator = originalUri.includes("?") ? "&" : "?";
      return `${originalUri}${separator}t=${Date.now()}`;
    }

    return originalUri;
  };

  const processedUri = getProcessedUri(uri);

  if (!processedUri || error) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Ionicons
          name={fallbackIcon}
          size={fallbackIconSize}
          color={fallbackIconColor}
        />
      </View>
    );
  }

  // Para web, usar elemento img nativo para mejor compatibilidad
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          ...StyleSheet.flatten(style),
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <img
          src={processedUri}
          alt="Página"
          style={{
            width: "100%",
            height: "100%",
            objectFit: resizeMode === "cover" ? "cover" : "contain",
          }}
          onError={() => {
            console.warn("Error cargando imagen web:", processedUri);
            setError(true);
          }}
        />
      </div>
    );
  }

  // Para móvil, usar componente Image normal
  return (
    <Image
      source={{ uri: processedUri }}
      style={style}
      resizeMode={resizeMode}
      onError={(e) => {
        console.warn(
          "Error cargando imagen móvil:",
          processedUri,
          e.nativeEvent?.error
        );
        setError(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
});
