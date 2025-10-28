import React from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Debug logs
  React.useEffect(() => {
    if (visible) {
      console.log('📖 NotebookSelectorModal abierto');
      console.log('📚 Notebooks:', notebooks);
      console.log('📊 Cantidad:', notebooks?.length || 0);
      console.log('🎨 Es array:', Array.isArray(notebooks));
      console.log('🎨 Loading:', loading);
    }
  }, [visible, notebooks, loading]);

  // Renderizar directamente sin condiciones complejas
  const renderContent = () => {
    console.log('🔄 renderContent ejecutándose');
    console.log('🔄 Loading:', loading);
    console.log('🔄 Notebooks length:', notebooks?.length);

    if (loading) {
      console.log('⏳ Mostrando loading...');
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <AuraText
            text="Cargando cuadernos..."
            style={styles.loadingText}
          />
        </View>
      );
    }

    if (!notebooks || notebooks.length === 0) {
      console.log('❌ Mostrando mensaje de vacío...');
      return (
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
      );
    }

    console.log('✅ Mostrando lista de cuadernos...');
    return (
      <View style={styles.notebooksContainer}>
        {notebooks.map((notebook, index) => {
          console.log(`🎯 Renderizando card ${index + 1}:`, notebook.title);
          return (
            <TouchableOpacity
              key={`notebook-${notebook.id}-${index}`}
              style={styles.notebookCard}
              onPress={() => {
                console.log('✅ Notebook seleccionado:', notebook.id, notebook.title);
                onSelectNotebook(notebook.id);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.notebookIcon}>
                <Ionicons name="book" size={32} color="#007bff" />
              </View>
              <View style={styles.notebookInfo}>
                <AuraText
                  text={notebook.title || 'Sin título'}
                  style={styles.notebookTitle}
                  numberOfLines={2}
                />
                <AuraText
                  text={notebook.created_at ? new Date(notebook.created_at).toLocaleDateString('es-ES') : 'Sin fecha'}
                  style={styles.notebookDate}
                />
              </View>
              <View style={styles.selectButtonContainer}>
                <Ionicons name="chevron-forward" size={24} color="#007bff" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          isLargeScreen && styles.modalContentLarge
        ]}>
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
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {renderContent()}
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
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    minHeight: 400, // ✅ AGREGADO - Altura mínima
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContentLarge: {
    maxWidth: 700,
    maxHeight: "80%",
    minHeight: 500, // ✅ AGREGADO
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flexShrink: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1, // ✅ IMPORTANTE - Ocupa el espacio disponible
    backgroundColor: "#f8f9fa",
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 24, // ✅ AGREGADO - Espacio al final
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    minHeight: 200, // ✅ AGREGADO
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    minHeight: 200, // ✅ AGREGADO
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
    paddingHorizontal: 20,
  },
  notebooksContainer: {
    gap: 12,
    paddingBottom: 16, // ✅ AGREGADO - Espacio entre cards y footer
  },
  notebookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 80,
  },
  notebookIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e7f3ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notebookInfo: {
    flex: 1,
    justifyContent: "center",
  },
  notebookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notebookDate: {
    fontSize: 12,
    color: "#999",
  },
  selectButtonContainer: {
    padding: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    backgroundColor: "#fff",
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
