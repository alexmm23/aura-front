import React from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Clipboard,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuraText } from "./AuraText";
import Toast from "react-native-toast-message";

export default function AIResultsModal({ visible, onClose, results, type }) {
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const handleCopyText = (text) => {
    Clipboard.setString(text);
    Toast.show({
      type: "success",
      text1: "Copiado",
      text2: "Texto copiado al portapapeles",
    });
  };

  const handleCopyAll = () => {
    let allText = "";

    if (type === "ocr") {
      if (results?.data?.results && results.data.results.length > 0) {
        allText = results.data.results
          .map((result) => {
            let text = `--- Contenido ${result.content_id} ---\n\n`;
            if (result.texto_corregido) {
              text += `Texto Corregido:\n${result.texto_corregido}\n\n`;
            }
            if (result.texto_extraido) {
              text += `Texto Original:\n${result.texto_extraido}\n`;
            }
            return text;
          })
          .join("\n\n");
      } else if (results?.extracted_text) {
        allText = results.extracted_text;
      }
    } else if (type === "study" && results?.questions) {
      allText = results.questions
        .map((q, idx) => `${idx + 1}. ${q.question}\n   Respuesta: ${q.answer}`)
        .join("\n\n");
    }

    handleCopyText(allText);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
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
              <View style={styles.headerIconContainer}>
                <Ionicons
                  name={type === "ocr" ? "scan" : "help-circle"}
                  size={24}
                  color="#007bff"
                />
              </View>
              <AuraText
                text={
                  type === "ocr" ? "Texto Extraído" : "Preguntas de Estudio"
                }
                style={styles.title}
              />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Copy All Button - Más visible en móvil */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              onPress={handleCopyAll}
              style={styles.copyAllButton}
              activeOpacity={0.8}
            >
              <Ionicons name="copy" size={20} color="#fff" />
              <AuraText text="Copiar todo" style={styles.copyAllText} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
          >
            {type === "ocr" && results?.data?.results && (
              <View style={styles.ocrContainer}>
                {results.data.results.map((result, index) => (
                  <View key={index} style={styles.resultCard}>
                    {/* Header del resultado */}
                    <View style={styles.resultHeader}>
                      <View style={styles.resultHeaderLeft}>
                        <Ionicons name="document-text" size={22} color="#007bff" />
                        <AuraText
                          text={`Contenido ${result.content_id}`}
                          style={styles.resultTitle}
                        />
                      </View>
                      {result.success && (
                        <View style={styles.successBadge}>
                          <Ionicons name="checkmark-circle" size={18} color="#28a745" />
                          <AuraText text="Exitoso" style={styles.successText} />
                        </View>
                      )}
                    </View>

                    {/* Estadísticas */}
                    {result.estadisticas && (
                      <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                          <Ionicons name="text-outline" size={18} color="#666" />
                          <AuraText
                            text={`${result.estadisticas.palabras_extraidas} palabras`}
                            style={styles.statText}
                          />
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="layers-outline" size={18} color="#666" />
                          <AuraText
                            text={`${result.estadisticas.detecciones} detecciones`}
                            style={styles.statText}
                          />
                        </View>
                      </View>
                    )}

                    {/* Texto Corregido */}
                    {result.texto_corregido && (
                      <View style={styles.textSection}>
                        <View style={styles.sectionHeader}>
                          <Ionicons name="create-outline" size={20} color="#28a745" />
                          <AuraText
                            text="Texto Corregido"
                            style={styles.sectionTitle}
                          />
                          <TouchableOpacity
                            onPress={() => handleCopyText(result.texto_corregido)}
                            style={styles.miniCopyButton}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="copy-outline" size={18} color="#007bff" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.textCard}>
                          <AuraText
                            text={result.texto_corregido}
                            style={styles.extractedText}
                          />
                        </View>
                      </View>
                    )}

                    {/* Texto Original */}
                    {result.texto_extraido && (
                      <View style={styles.textSection}>
                        <View style={styles.sectionHeader}>
                          <Ionicons name="scan-outline" size={20} color="#6c757d" />
                          <AuraText
                            text="Texto Original (OCR)"
                            style={[styles.sectionTitle, { color: "#6c757d" }]}
                          />
                          <TouchableOpacity
                            onPress={() => handleCopyText(result.texto_extraido)}
                            style={styles.miniCopyButton}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="copy-outline" size={18} color="#007bff" />
                          </TouchableOpacity>
                        </View>
                        <View style={[styles.textCard, styles.originalTextCard]}>
                          <AuraText
                            text={result.texto_extraido}
                            style={styles.originalText}
                          />
                        </View>
                      </View>
                    )}

                    {/* Detalles opcionales */}
                    {result.detalles && result.detalles.length > 0 && (
                      <TouchableOpacity 
                        style={styles.detailsToggle}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="information-circle-outline" size={18} color="#007bff" />
                        <AuraText
                          text={`Ver ${result.detalles.length} detalles de detección`}
                          style={styles.detailsToggleText}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Formato antiguo de OCR */}
            {type === "ocr" && results?.extracted_text && !results?.data && (
              <View style={styles.ocrContainer}>
                <View style={styles.textCard}>
                  <AuraText
                    text={results.extracted_text}
                    style={styles.extractedText}
                  />
                </View>
              </View>
            )}

            {type === "study" && results?.questions && (
              <View style={styles.questionsContainer}>
                {results.questions.map((question, index) => (
                  <View key={index} style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                      <View style={styles.questionNumber}>
                        <AuraText
                          text={`${index + 1}`}
                          style={styles.questionNumberText}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          handleCopyText(
                            `${question.question}\nRespuesta: ${question.answer}`
                          )
                        }
                        style={styles.copyButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="copy-outline" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <AuraText
                      text={question.question}
                      style={styles.questionText}
                    />

                    <View style={styles.answerContainer}>
                      <AuraText text="Respuesta:" style={styles.answerLabel} />
                      <AuraText
                        text={question.answer}
                        style={styles.answerText}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {!results && (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
                <AuraText
                  text="No hay resultados disponibles"
                  style={styles.emptyText}
                />
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeButtonFooter}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <AuraText text="Cerrar" style={styles.closeButtonText} />
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 700,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  modalContentLarge: {
    maxWidth: 800,
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
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e7f3ff",
    justifyContent: "center",
    alignItems: "center",
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
  actionBar: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  copyAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#007bff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  copyAllText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  ocrContainer: {
    padding: 20,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  resultHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#d4edda",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  successText: {
    fontSize: 13,
    color: "#28a745",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  textSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#28a745",
    flex: 1,
  },
  miniCopyButton: {
    padding: 6,
    backgroundColor: "#e7f3ff",
    borderRadius: 8,
  },
  textCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  extractedText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
  },
  originalTextCard: {
    backgroundColor: "#f1f3f5",
    borderColor: "#dee2e6",
  },
  originalText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#e7f3ff",
    borderRadius: 10,
    marginTop: 10,
  },
  detailsToggleText: {
    fontSize: 13,
    color: "#007bff",
    fontWeight: "500",
  },
  questionsContainer: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  questionNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  questionNumberText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  copyButton: {
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 14,
    lineHeight: 26,
  },
  answerContainer: {
    backgroundColor: "#e7f3ff",
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  answerText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: "#999",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  closeButtonFooter: {
    backgroundColor: "#6c757d",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});