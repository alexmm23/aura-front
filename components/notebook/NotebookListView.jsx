import React, { useState } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { NotebookItem } from "./NotebookItem";
import { NotebookHeader } from "./NotebookHeader";
import FloatingAIMenu from "@/components/FloatingAIMenu";
import { Ionicons } from "@expo/vector-icons";

export const NotebookListView = ({
  notebooks,
  isLargeScreen,
  onNotebookPress,
  onNotebookLongPress,
  onCreatePress,
  onNewNotePress,
  onDownloadPress, // Puede ser undefined
  onAIOptionPress,
  lastPngDataUrl,
  hasActiveSubscription = false,
  checkingSubscription = false,
  isWeb = Platform.OS === 'web', // ✅ Agregar prop con default
}) => {
  const [showNotebookSelector, setShowNotebookSelector] = useState(false);

  // Función para abrir el selector de cuaderno
  const handleDownloadPress = () => {
    if (notebooks.length === 0) {
      alert("No tienes cuadernos para descargar.");
      return;
    }
    setShowNotebookSelector(true);
  };

  // Función para seleccionar un cuaderno y abrir el modal de descarga
  const handleNotebookSelect = (notebook) => {
    setShowNotebookSelector(false);
    // ✅ Verificar que onDownloadPress existe antes de llamarla
    if (onDownloadPress) {
      onDownloadPress(notebook);
    }
  };

  const containerStyle = isLargeScreen
    ? styles.landscapeContainer
    : styles.container;

  const contentWrapperStyle = isLargeScreen ? styles.contentWrapper : null;

  return (
    <View style={containerStyle}>
      {/* Fondo decorativo con overlay */}
      <View style={styles.backgroundOverlay}>
        <Image
          source={require("@/assets/images/fondonotas.png")}
          style={isLargeScreen ? styles.landscapeImage : styles.backgroundImage}
          resizeMode="contain"
          pointerEvents="none"
        />
      </View>

      <View style={contentWrapperStyle}>
        <NotebookHeader
          onCreatePress={onCreatePress}
          onNewNotePress={onNewNotePress}
          isLargeScreen={isLargeScreen}
        />

        {/* Contenedor con estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="book" size={24} color="#4A90E2" />
            <Text style={styles.statNumber}>{notebooks.length}</Text>
            <Text style={styles.statLabel}>Cuadernos</Text>
          </View>
        </View>

        <FlatList
          key={isLargeScreen ? "large-6" : "small-3"}
          data={notebooks}
          renderItem={({ item }) => (
            <NotebookItem
              notebook={item}
              onPress={onNotebookPress}
              onLongPress={onNotebookLongPress}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={isLargeScreen ? 6 : 3}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>No tienes cuadernos aún</Text>
              <Text style={styles.emptySubtext}>
                Crea tu primer cuaderno para comenzar
              </Text>
            </View>
          }
        />
      </View>

      {/* ✅ Botón de descarga flotante - SOLO EN WEB */}
      {isWeb && onDownloadPress && (
        <TouchableOpacity 
          style={[styles.floatingButton, styles.downloadButton]} 
          onPress={handleDownloadPress}
          activeOpacity={0.8}
        >
          <Ionicons name="download" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* FloatingAIMenu - Solo mostrar si tiene suscripción activa */}
      {!checkingSubscription && hasActiveSubscription && onAIOptionPress && (
        <FloatingAIMenu onAIOptionPress={onAIOptionPress} />
      )}

      {/* ✅ Modal selector de cuaderno - SOLO EN WEB */}
      {isWeb && (
        <Modal
          visible={showNotebookSelector}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowNotebookSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecciona un Cuaderno</Text>
                <TouchableOpacity 
                  onPress={() => setShowNotebookSelector(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.notebookList}>
                {notebooks.map((notebook) => (
                  <TouchableOpacity
                    key={notebook.id}
                    style={styles.notebookOption}
                    onPress={() => handleNotebookSelect(notebook)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="book" size={24} color="#4A90E2" />
                    <Text style={styles.notebookOptionText}>{notebook.title}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
    position: "relative",
  },
  landscapeContainer: {
    flex: 1,
    backgroundColor: "#E6E2D2",
    alignItems: "center",
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    opacity: 0.6,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    transform: [{ rotate: "-45deg" }, { scale: 1.5 }],
  },
  landscapeImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "90%",
    height: "100%",
    marginLeft: "5%",
    zIndex: 0,
  },
  contentWrapper: {
    width: "100%",
    flex: 1,
    zIndex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 4,
    fontWeight: "500",
  },
  notesList: {
    padding: 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "space-evenly",
    gap: 8,
    paddingHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#95a5a6",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#bdc3c7",
    marginTop: 8,
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9998,
  },
  downloadButton: {
    backgroundColor: "#28a745",
  },
  // Estilos del modal selector
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  notebookList: {
    padding: 10,
  },
  notebookOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  notebookOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
});