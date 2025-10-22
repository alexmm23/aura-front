import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuraText } from "./AuraText";

// Componente para los elementos del menú con hover
function HoverableMenuItem({ text, onPress }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const handleMouseEnter = () => {
    if (Platform.OS === "web") {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (Platform.OS === "web") {
      setIsHovered(false);
    }
  };

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const handlePress = () => {
    console.log(`Seleccionado: ${text}`);
    onPress?.(text);
  };

  const getItemStyle = () => {
    let backgroundColor = "transparent";

    if (isPressed) {
      backgroundColor = "#e3f2fd";
    } else if (isHovered && Platform.OS === "web") {
      backgroundColor = "#f5f5f5";
    }

    return {
      padding: 12,
      borderRadius: 6,
      backgroundColor,
      marginVertical: 2,
      transition:
        Platform.OS === "web" ? "background-color 0.2s ease" : undefined,
    };
  };

  const webProps =
    Platform.OS === "web"
      ? {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        }
      : {};

  return (
    <TouchableOpacity
      style={getItemStyle()}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      {...webProps}
    >
      <AuraText
        text={text}
        style={{
          fontSize: 14,
          color: "#333",
          textAlign: "left",
        }}
      />
    </TouchableOpacity>
  );
}

export default function FloatingAIMenu({ onAIOptionPress }) {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleMenuClick = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuItemPress = (text) => {
    console.log(`Acción seleccionada: ${text}`);
    setMenuVisible(false);

    // Si se pasa la función callback, la ejecutamos
    if (onAIOptionPress) {
      onAIOptionPress(text);
    }
  };

  const handleBackdropPress = () => {
    if (Platform.OS === "web") {
      setMenuVisible(false);
    }
  };

  return (
    <View style={{ position: "absolute", bottom: 20, right: 20, zIndex: 9999 }}>
      {/* Backdrop transparente para cerrar el menú */}
      {menuVisible && Platform.OS === "web" && (
        <TouchableOpacity
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
            zIndex: 9998,
          }}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
      )}

      {/* Menú desplegable */}
      {menuVisible && (
        <View
          style={{
            position: "absolute",
            bottom: 80,
            right: 0,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 8,
            elevation: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            minWidth: 200,
            maxWidth: 250,
            zIndex: 9999,
            borderWidth: 1,
            borderColor: "#e0e0e0",
          }}
        >
          {["✍️ Generar recurso"].map((text, idx) => (
            <HoverableMenuItem
              key={idx}
              text={text}
              onPress={handleMenuItemPress}
            />
          ))}
        </View>
      )}

      {/* Botón flotante principal */}
      <TouchableOpacity
        style={{
          backgroundColor: "#007bff",
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          zIndex: 9999,
        }}
        onPress={handleMenuClick}
        activeOpacity={0.8}
      >
        <Ionicons
          name={menuVisible ? "close" : "sparkles"}
          size={26}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}
