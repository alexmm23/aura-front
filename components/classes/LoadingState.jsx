import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#CB8D27" />
    <Text style={styles.loadingText}>Cargando clases...</Text>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
