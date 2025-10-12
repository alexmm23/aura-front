import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuraText } from "./AuraText";
import SafeImage from "./SafeImage";
import { apiGet, apiPost } from "../utils/fetchWithAuth";
import { API } from "../config/api";
import Toast from "react-native-toast-message";

export default function AIOptionsModal({ visible, onClose, notebookId }) {
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [numQuestions, setNumQuestions] = useState("10");

  const aiOptions = [
    {
      id: "ocr",
      title: "📝 Procesar con OCR",
      description: "Extrae texto de las páginas seleccionadas",
      icon: "scan",
    },
    {
      id: "study",
      title: "❓ Generar Preguntas",
      description: "Crea preguntas de estudio automáticamente",
      icon: "help-circle",
    },
  ];

  useEffect(() => {
    if (visible) {
      fetchPages();
    }
  }, [visible]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await apiGet(API.ENDPOINTS.STUDENT.NOTEBOOK_PAGES);

      if (!response.ok) {
        throw new Error("Error al cargar las páginas");
      }

      const data = await response.json();
      console.log(
        "📄 Respuesta completa del servidor:",
        JSON.stringify(data, null, 2)
      );
      console.log("📘 notebookId recibido:", notebookId);

      // Obtener el array de páginas
      let allPages = data.data?.pages || [];
      let filteredPages = allPages;

      setPages(filteredPages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar las páginas",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePageSelection = (pageId) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleProcessAI = async () => {
    if (selectedPages.length === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes seleccionar al menos una página",
      });
      return;
    }

    if (!selectedOption) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes seleccionar una opción de IA",
      });
      return;
    }

    try {
      setProcessing(true);

      let endpoint, payload;

      if (selectedOption === "ocr") {
        endpoint = API.ENDPOINTS.AI.OCR;
        payload = { content_ids: selectedPages };
      } else if (selectedOption === "study") {
        const questions = parseInt(numQuestions) || 10;
        endpoint = API.ENDPOINTS.AI.STUDY_QUESTIONS;
        payload = { page_ids: selectedPages, num_questions: questions };
      }

      console.log("🚀 Procesando con IA:", { endpoint, payload });

      const response = await apiPost(endpoint, payload);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar con IA");
      }

      const result = await response.json();
      console.log("✅ Resultado de IA:", result);

      Toast.show({
        type: "success",
        text1: "¡Éxito!",
        text2:
          selectedOption === "ocr"
            ? "Texto extraído correctamente"
            : `${result.questions?.length || 0} preguntas generadas`,
      });

      // Resetear y cerrar
      setSelectedPages([]);
      setSelectedOption(null);
      setNumQuestions("10");
      onClose(result);
    } catch (error) {
      console.error("Error processing AI:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "No se pudo procesar con IA",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedPages([]);
    setSelectedOption(null);
    setNumQuestions("10");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <AuraText text="Procesamiento con IA" style={styles.title} />
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Opciones de IA */}
            <View style={styles.section}>
              <AuraText
                text="Selecciona una opción:"
                style={styles.sectionTitle}
              />
              {aiOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    selectedOption === option.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedOption(option.id)}
                >
                  <View style={styles.optionHeader}>
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={selectedOption === option.id ? "#007bff" : "#666"}
                    />
                    <AuraText
                      text={option.title}
                      style={[
                        styles.optionTitle,
                        selectedOption === option.id &&
                          styles.optionTitleSelected,
                      ]}
                    />
                    {selectedOption === option.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#007bff"
                        style={styles.checkmark}
                      />
                    )}
                  </View>
                  <AuraText
                    text={option.description}
                    style={styles.optionDescription}
                  />
                </TouchableOpacity>
              ))}

              {/* Opciones adicionales para preguntas */}
              {selectedOption === "study" && (
                <View style={styles.questionOptions}>
                  <AuraText
                    text="Número de preguntas:"
                    style={styles.questionLabel}
                  />
                  <TextInput
                    style={styles.questionInput}
                    value={numQuestions}
                    onChangeText={setNumQuestions}
                    keyboardType="numeric"
                    placeholder="10"
                  />
                </View>
              )}
            </View>

            {/* Selección de páginas */}
            <View style={styles.section}>
              <AuraText
                text={`Selecciona las páginas (${selectedPages.length} seleccionadas):`}
                style={styles.sectionTitle}
              />

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007bff" />
                  <AuraText
                    text="Cargando páginas..."
                    style={styles.loadingText}
                  />
                </View>
              ) : pages.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={48}
                    color="#ccc"
                  />
                  <AuraText
                    text="No hay páginas en este cuaderno"
                    style={styles.emptyText}
                  />
                </View>
              ) : (
                <View style={styles.pagesGrid}>
                  {pages.map((page) => (
                    <TouchableOpacity
                      key={page.id}
                      style={[
                        styles.pageCard,
                        selectedPages.includes(page.id) &&
                          styles.pageCardSelected,
                      ]}
                      onPress={() => togglePageSelection(page.id)}
                    >
                      {page.contents &&
                      page.contents.length > 0 &&
                      page.contents[0].data ? (
                        <SafeImage
                          uri={page.contents[0].data}
                          style={styles.pageImage}
                          resizeMode="cover"
                          fallbackIcon="document"
                        />
                      ) : (
                        <View style={styles.pageImagePlaceholder}>
                          <Ionicons name="document" size={32} color="#ccc" />
                        </View>
                      )}
                      <AuraText
                        text={`Página ${page.id}`}
                        style={styles.pageTitle}
                      />
                      {selectedPages.includes(page.id) && (
                        <View style={styles.selectedBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#fff"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={processing}
            >
              <AuraText text="Cancelar" style={styles.cancelButtonText} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.processButton,
                (processing || selectedPages.length === 0 || !selectedOption) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleProcessAI}
              disabled={
                processing || selectedPages.length === 0 || !selectedOption
              }
            >
              {processing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <AuraText text="Procesar" style={styles.processButtonText} />
              )}
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
    maxHeight: "90%",
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
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  optionCardSelected: {
    borderColor: "#007bff",
    backgroundColor: "#f0f7ff",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  optionTitleSelected: {
    color: "#007bff",
  },
  checkmark: {
    marginLeft: "auto",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    marginLeft: 36,
  },
  questionOptions: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  questionInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  pagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  pageCard: {
    width: "31%",
    margin: "1%",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e9ecef",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  pageCardSelected: {
    borderColor: "#007bff",
    backgroundColor: "#f0f7ff",
  },
  pageImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f8f9fa",
  },
  pageImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    padding: 8,
  },
  selectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#007bff",
    borderRadius: 12,
    padding: 2,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  processButton: {
    backgroundColor: "#007bff",
  },
  processButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
});
