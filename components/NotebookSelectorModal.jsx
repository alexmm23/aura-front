import React from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuraText } from "./AuraText";

export default function NotebookSelectorModal({
  visible,
  onClose,
  notebooks,
  onSelectNotebook,
  loading = false,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="book" size={24} color="#007bff" />
              <AuraText text="Selecciona un Cuaderno" style={styles.title} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <AuraText
                  text="Cargando cuadernos..."
                  style={styles.loadingText}
                />
              </View>
            ) : notebooks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={64} color="#ccc" />
                <AuraText
                  text="No tienes cuadernos creados"
                  style={styles.emptyText}
                />
                <AuraText
                  text="Crea un cuaderno primero para usar las funciones de IA"
                  style={styles.emptySubtext}
                />
              </View>
            ) : (
              <View style={styles.notebooksGrid}>
                {notebooks.map((notebook) => (
                  <TouchableOpacity
                    key={notebook.id}
                    style={styles.notebookCard}
                    onPress={() => onSelectNotebook(notebook.id)}
                  >
                    <View style={styles.notebookIcon}>
                      <Ionicons name="book" size={32} color="#007bff" />
                    </View>
                    <AuraText
                      text={notebook.title}
                      style={styles.notebookTitle}
                      numberOfLines={2}
                    />
                    <AuraText
                      text={new Date(notebook.created_at).toLocaleDateString()}
                      style={styles.notebookDate}
                    />
                    <View style={styles.selectButton}>
                      <AuraText
                        text="Seleccionar"
                        style={styles.selectButtonText}
                      />
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#007bff"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <AuraText text="Cancelar" style={styles.cancelButtonText} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 600,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  notebooksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  notebookCard: {
    width: "48%",
    margin: "1%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e9ecef",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notebookIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e7f3ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  notebookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 6,
    minHeight: 36,
  },
  notebookDate: {
    fontSize: 11,
    color: "#999",
    marginBottom: 12,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#e7f3ff",
    borderRadius: 6,
    marginTop: 4,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007bff",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
