import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuraText } from "@/components/AuraText";

export const NotebookHeader = ({
  title = "Mis Cuadernos",
  onCreatePress,
  onNewNotePress,
  isLargeScreen = false,
}) => {
  return (
    <View style={[styles.header, isLargeScreen && styles.headerLarge]}>
      <View style={styles.titleContainer}>
        <Ionicons name="library" size={isLargeScreen ? 48 : 36} color="#CB8D27" />
        <AuraText
          text={title}
          style={[styles.title, isLargeScreen && styles.titleLarge]}
        />
      </View>
      <View
        style={[
          styles.headerButtons,
          !isLargeScreen && styles.headerButtonsMobile,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.createNotebookButton,
            !isLargeScreen && styles.buttonMobile
          ]}
          onPress={onCreatePress}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add-circle"
            size={isLargeScreen ? 20 : 16}
            color="#fff"
          />
          <AuraText
            text={isLargeScreen ? "Crear Cuaderno" : "Crear"}
            style={[styles.createButtonText, !isLargeScreen && styles.buttonTextMobile]}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.newNoteButton,
            !isLargeScreen && styles.buttonMobile
          ]} 
          onPress={onNewNotePress}
          activeOpacity={0.8}
        >
          <Ionicons
            name="create"
            size={isLargeScreen ? 20 : 16}
            color="#fff"
          />
          <AuraText
            text={isLargeScreen ? "Nueva Nota" : "Nota"}
            style={[styles.newNoteText, !isLargeScreen && styles.buttonTextMobile]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginTop: 48,
    marginHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  headerLarge: {
    marginTop: 24,
    width: "95%",
    alignSelf: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#CB8D27",
    flexShrink: 1,
  },
  titleLarge: {
    fontSize: 42,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  headerButtonsMobile: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
    marginLeft: 8,
  },
  createNotebookButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#28a745",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 110,
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonMobile: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 85,
    gap: 4,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonTextMobile: {
    fontSize: 13,
  },
  newNoteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#007bff",
    borderRadius: 12,
    minWidth: 110,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    elevation: 3,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  newNoteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});