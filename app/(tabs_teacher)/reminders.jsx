import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { AuraText } from "@/components/AuraText";
import { Ionicons } from "@expo/vector-icons";
import Head from "expo-router/head";
import Svg, { Path } from "react-native-svg";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Reminders() {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  const remindersList = [
    {
      id: 1,
      title: "Entrega Proyecto Final",
      date: "2025-06-15",
      time: "14:30",
      hasAlarm: true,
      description: "Preparar presentación del proyecto",
    },
    // Add more reminders as needed
  ];

  return (
    <>
      <Head>
        <title>Recordatorios - AURA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          {/* Header con SVG */}
          {isLandscape ? (
            <LandscapeHeader styles={styles} />
          ) : (
            <PortraitHeader styles={styles} />
          )}

          {/* Título responsive */}
          <View style={styles.contentWrapper}>
            <View style={styles.headerTitle}>
              <AuraText
                text={"Mis Recordatorios"}
                style={isLandscape ? styles.titleLandscape : styles.title}
              />
            </View>
          </View>

          {/* Contenido scrollable */}
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            style={styles.scrollView}
          >
            {remindersList.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <AuraText text={reminder.title} style={styles.reminderTitle} />
                  {reminder.hasAlarm && (
                    <Ionicons name="alarm-outline" size={24} color="#A44076" />
                  )}
                </View>
                <View style={styles.divider} />
                <View style={styles.reminderInfo}>
                  <View style={styles.dateTimeContainer}>
                    <View style={styles.dateTime}>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                      <AuraText text={reminder.date} style={styles.dateTimeText} />
                    </View>
                    <View style={styles.dateTime}>
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <AuraText text={reminder.time} style={styles.dateTimeText} />
                    </View>
                  </View>
                  <AuraText text={reminder.description} style={styles.description} />
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Botón flotante para agregar recordatorio */}
          <TouchableOpacity style={styles.floatingButton} onPress={() => {}}>
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

const LandscapeHeader = ({ styles }) => (
  <View style={styles.backgroundContainerLandscape}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="-200 -210 560 670"
      style={styles.svg}
    >
      <Path
        d="M255.625 387.801C209.254 181.192 -160.246 23.1376 82.0284 -31.2381C324.303 -85.6138 756.693 147.292 499.715 406.644C292.867 538.783 474.159 720.291 259.299 690.506C56.814 617.548 301.996 594.41 255.625 387.801Z"
        fill="#CDAEC4"
        fillOpacity={0.67}
        transform="scale(0.4) translate(180, -50)"
      />
    </Svg>
  </View>
);

const PortraitHeader = ({ styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 500 500"
      style={styles.svg}
    >
      <Path
        d="M255.625 387.801C209.254 181.192 -160.246 23.1376 82.0284 -31.2381C324.303 -85.6138 756.693 147.292 499.715 406.644C292.867 538.783 474.159 720.291 259.299 690.506C56.814 617.548 301.996 594.41 255.625 387.801Z"
        fill="#CDAEC4"
        fillOpacity={0.67}
        transform="scale(0.7) translate(100, -50)"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  scrollView: {
    flex: 1,
    marginTop: 10, // Añadir algo de margen para separar del header
  },
  contentContainer: {
    padding: 300,
    paddingTop: 50, // Reducido de 120 para ajustar al nuevo tamaño del header
  },
  card: {
    width: "100%",
    marginBottom: 30,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 1,
  },
  headerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "left",
  },
  noteCard: {
    backgroundColor: "#E4E3DD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  noteTitle: {
    fontWeight: "bold",
    color: "#A64AC9",
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E4E3DD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  taskSubject: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#E91E63",
  },
  taskDescription: {
    fontSize: 14,
    color: "#555",
  },
  taskDueDate: {
    fontSize: 12,
    color: "#999",
  },
  navbar: {
    flexDirection: "row",
    backgroundColor: "#9C27B0",
    paddingVertical: 10,
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 2,
  },
  // Estilos para modo vertical
  backgroundContainer: {
    height: 250, // Más pequeño que antes (era 350)
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: "hidden", // Importante para que no se desborde
  },
  // Estilos para modo horizontal
  backgroundContainerLandscape: {
    position: "absolute",
    //marginRight:250,
    top: 0,
    right: 0,        // Cambiado de left a right
    width: "80%",    // Ancho relativo
    height: "90%",   // Alto relativo
    zIndex: 0,
    overflow: "hidden",
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
  platformIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  titleLandscape: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "left",
    marginLeft: 200, // Más margen en modo landscape
  },
  classCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,

    flexDirection: "row", // pone los elementos en fila
    justifyContent: "space-between", // separa texto e imagen
    alignItems: "center", // alinea verticalmente
  },
  classContent: {
    flex: 1, // ocupa el espacio restante
    paddingRight: 10, // espacio entre texto e imagen (opcional)
    },
  className: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A44076",
    marginBottom: 10,
  },
  classInfo: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  classPeriod: {
    fontSize: 14,
    color: "#1E1E1E",
    paddingBottom: 15,
    paddingTop: 5,
  },
  teacherName: {
    fontSize: 14,
    color: "#1E1E1E",
    fontStyle: "italic",
  },
  platformIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    },
    divider: {
    height: 1,
    backgroundColor: "#ccc", // gris claro
    marginVertical: 3, // espacio arriba y abajo de la línea
    },

  reminderCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A44076",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  reminderInfo: {
    gap: 10,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateTimeText: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 14,
    color: "#333",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#A44076",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});