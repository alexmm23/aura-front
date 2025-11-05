import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuraText } from "./AuraText";
import { CustomAlert } from "./CustomAlert"; // ✅ Importar CustomAlert
import SafeImage from "./SafeImage";
import { apiGet, apiPost } from "../utils/fetchWithAuth";
import { API } from "../config/api";
import Toast from "react-native-toast-message";

export default function AIOptionsModal({ visible, onClose, notebookId }) {
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [numQuestions, setNumQuestions] = useState("10");

  // ✅ Estado para CustomAlert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "error",
  });

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

      let allPages = data.data || [];
      console.log("📄 Páginas obtenidas:", allPages.length) ;
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

  // ✅ Función mejorada para mostrar alertas según la plataforma
  const showAIErrorAlert = (errorMessage, shouldCloseModal = true) => {
    console.log("🚨 Mostrando error de IA:", errorMessage);
    
    // ✅ Mensaje genérico para el usuario (sin detalles técnicos)
    const userFriendlyMessage = "Hubo un problema al procesar tu información con IA. Por favor, intenta nuevamente o contacta con soporte si el problema persiste.";
    
    // ✅ Cerrar el modal ANTES de mostrar la alerta
    if (shouldCloseModal) {
      handleClose();
    }
    
    // ✅ Pequeño delay para que el modal se cierre primero
    setTimeout(() => {
      if (Platform.OS === 'web') {
        // ✅ Para WEB: Usar CustomAlert
        setAlertConfig({
          visible: true,
          title: "⚠️ Error de Procesamiento",
          message: userFriendlyMessage,
          type: "error",
        });
      } else {
        // ✅ Para MÓVIL: Usar Alert nativo
        Alert.alert(
          "⚠️ Error de Procesamiento",
          userFriendlyMessage,
          [{ text: "Cerrar", style: "cancel" }],
          { cancelable: true }
        );
      }
    }, 300); // Delay de 300ms para que el modal se cierre primero
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
        const errorMsg = errorData.error || errorData.message || "Error desconocido";
        
        console.error("❌ Error de IA (respuesta no OK):", errorMsg);
        setProcessing(false);
        showAIErrorAlert(errorMsg); // ✅ Cierra el modal automáticamente
        return;
      }

      const result = await response.json();
      console.log("✅ Resultado de IA:", result);

      // ✅ VALIDAR: Verificar si el procesamiento fue exitoso
      if (result.data) {
        const { successful, failed, results } = result.data;
        
        console.log("📊 Estadísticas:", { successful, failed, results });

        // Si todas las páginas fallaron
        if (failed > 0 && successful === 0) {
          console.log("❌ Todas las páginas fallaron");
          
          // ✅ Log detallado del error para debugging (solo en consola)
          const failedResults = results.filter(r => !r.success);
          failedResults.forEach(r => {
            console.error(`Página ${r.page_id} falló:`, r.error);
          });
          
          setProcessing(false);
          showAIErrorAlert("No se pudo procesar ninguna página"); // ✅ Mensaje genérico
          return;
        }

        // Si algunas páginas fallaron pero otras sí funcionaron
        if (failed > 0 && successful > 0) {
          console.log("⚠️ Procesamiento parcial");
          Toast.show({
            type: "warning",
            text1: "⚠️ Procesamiento parcial",
            text2: `${successful} exitosas, ${failed} fallidas`,
            visibilityTime: 5000,
          });
        }
      }
      if (selectedOption === "ocr") {
        const hasTopLevelText =
          !!result.text ||
          !!result.extracted_text ||
          !!result.texto_extraido ||
          !!result.texto_corregido;

        const resultsArray = result.data?.results || result.results || [];
        const hasResultsText =
          Array.isArray(resultsArray) &&
          resultsArray.some((r) => {
        return (
          r.success &&
          (
            !!r.texto_extraido ||
            !!r.texto_corregido ||
            (r.estadisticas && (r.estadisticas.palabras_extraidas || 0) > 0)
          )
        );
          });

        const hasText = hasTopLevelText || hasResultsText;

        if (!hasText) {
          console.log("❌ No se extrajo texto");
          setProcessing(false);
          showAIErrorAlert("La IA no pudo extraer texto");
          return;
        }

        let extractedWordCount = 0;

        if (Array.isArray(resultsArray) && resultsArray.length > 0) {
          extractedWordCount = resultsArray.reduce((sum, r) => {
        if (r.estadisticas && typeof r.estadisticas.palabras_extraidas === "number") {
          return sum + r.estadisticas.palabras_extraidas;
        }
        if (r.texto_extraido) {
          return sum + (String(r.texto_extraido).split(/\s+/).filter(Boolean).length || 0);
        }
        if (r.texto_corregido) {
          return sum + (String(r.texto_corregido).split(/\s+/).filter(Boolean).length || 0);
        }
        return sum;
          }, 0);
        } else {
          // Fallback a campos top-level
          if (result.texto_extraido) {
        extractedWordCount = String(result.texto_extraido).split(/\s+/).filter(Boolean).length;
          } else if (result.texto_corregido) {
        extractedWordCount = String(result.texto_corregido).split(/\s+/).filter(Boolean).length;
          } else if (result.text || result.extracted_text) {
        const txt = result.text || result.extracted_text;
        extractedWordCount = String(txt).split(/\s+/).filter(Boolean).length;
          }
        }

        console.log("✅ OCR exitoso - palabras aproximadas extraídas:", extractedWordCount);
        Toast.show({
          type: "success",
          text1: "✅ Texto extraído",
          text2:
        extractedWordCount > 0
          ? `${extractedWordCount} palabras extraídas`
          : "El texto se procesó correctamente",
          visibilityTime: 3000,
        });
      } else if (selectedOption === "study") {
        const hasQuestions = result.questions || 
                            (result.data?.results && 
                             result.data.results.some(r => r.success && r.data?.questions));
        
        const questionCount = result.questions?.length || 
                             result.data?.results?.reduce((sum, r) => 
                               sum + (r.data?.questions?.length || 0), 0) || 0;

        if (!hasQuestions || questionCount === 0) {
          console.log("❌ No se generaron preguntas");
          setProcessing(false);
          showAIErrorAlert("La IA no pudo generar preguntas"); // ✅ Mensaje genérico
          return;
        }

        console.log("✅ Preguntas generadas:", questionCount);
        Toast.show({
          type: "success",
          text1: "✅ Preguntas generadas",
          text2: `${questionCount} preguntas creadas exitosamente`,
          visibilityTime: 3000,
        });
      }

      // ✅ ÉXITO: Limpiar y cerrar
      setSelectedPages([]);
      setSelectedOption(null);
      setNumQuestions("10");
      
      console.log("✅ Enviando resultado al padre:", result);
      
      // Delay para que el usuario vea el toast de éxito
      setTimeout(() => {
        onClose(result);
      }, 800);

    } catch (error) {
      console.error("❌ Error processing AI (catch):", error);
      setProcessing(false);
      showAIErrorAlert(error.message); // ✅ Cierra el modal automáticamente
    } finally {
      // Resetear processing después de un delay
      setTimeout(() => {
        setProcessing(false);
      }, 100);
    }
  };

  const handleClose = () => {
    setSelectedPages([]);
    setSelectedOption(null);
    setNumQuestions("10");
    setProcessing(false); // ✅ Asegurar que se resetea processing
    onClose();
  };

  return (
    <>
      {/* ✅ CustomAlert para WEB - Ahora se ve por encima del modal cerrado */}
      {Platform.OS === 'web' && (
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
          confirmText="Cerrar"
        />
      )}

      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            isLargeScreen && styles.modalContentLarge,
            !isLargeScreen && { 
              maxHeight: height * 0.85, 
              minHeight: height * 0.70,
              width: width * 0.92 
            }
          ]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="sparkles" size={24} color="#007bff" />
                <AuraText text="Procesamiento con IA" style={styles.title} />
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={true}
            >
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
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionHeader}>
                      <View style={[
                        styles.optionIconContainer,
                        selectedOption === option.id && styles.optionIconContainerSelected
                      ]}>
                        <Ionicons
                          name={option.icon}
                          size={24}
                          color={selectedOption === option.id ? "#007bff" : "#666"}
                        />
                      </View>
                      <View style={styles.optionTextContainer}>
                        <AuraText
                          text={option.title}
                          style={[
                            styles.optionTitle,
                            selectedOption === option.id &&
                              styles.optionTitleSelected,
                          ]}
                        />
                        <AuraText
                          text={option.description}
                          style={styles.optionDescription}
                        />
                      </View>
                      {selectedOption === option.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={28}
                          color="#007bff"
                        />
                      )}
                    </View>
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
                      placeholderTextColor="#999"
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
                      size={64}
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
                        activeOpacity={0.7}
                      >
                        {page.data ? (
                          <SafeImage
                            uri={page.data}
                            style={styles.pageImage}
                            resizeMode="cover"
                            fallbackIcon="document"
                          />
                        ) : (
                          <View style={styles.pageImagePlaceholder}>
                            <Ionicons name="document" size={40} color="#ccc" />
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
                              size={28}
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
                activeOpacity={0.8}
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
                activeOpacity={0.8}
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
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  modalContentLarge: {
    maxWidth: 700,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
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
    padding: 8,
    borderRadius: 8,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    marginBottom: 12,
    backgroundColor: "#fff",
    minHeight: 80,
  },
  optionCardSelected: {
    borderColor: "#007bff",
    backgroundColor: "#f0f7ff",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  optionIconContainerSelected: {
    backgroundColor: "#e7f3ff",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: "#007bff",
  },
  optionDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  questionOptions: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
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
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  pagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pageCard: {
    width: "30%",
    borderRadius: 12,
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
    height: 130,
    backgroundColor: "#f8f9fa",
  },
  pageImagePlaceholder: {
    width: "100%",
    height: 130,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    padding: 10,
  },
  selectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#007bff",
    borderRadius: 14,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    gap: 12,
    backgroundColor: "#fff",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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