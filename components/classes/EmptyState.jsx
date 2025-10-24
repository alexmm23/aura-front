import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const EmptyState = ({ onConnect }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="school-outline" size={80} color="#ccc" />
    <Text style={styles.emptyText}>No tienes clases registradas</Text>
    <TouchableOpacity style={styles.connectButton} onPress={onConnect}>
      <Ionicons
        name="logo-google"
        size={24}
        color="#fff"
        style={styles.buttonIcon}
      />
      <Text style={styles.connectButtonText}>Conectar Google Classroom</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#999",
    marginTop: 20,
    textAlign: "center",
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 10,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
