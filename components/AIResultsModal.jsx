import React from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuraText } from "./AuraText";
import Toast from "react-native-toast-message";

export default function AIResultsModal({ visible, onClose, results, type }) {
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
      // Manejar la nueva estructura de OCR
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
        // Soporte para formato antiguo
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
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons
                name={type === "ocr" ? "scan" : "help-circle"}
                size={24}
                color="#007bff"
              />
              <AuraText
                text={
                  type === "ocr" ? "Texto Extraído" : "Preguntas de Estudio"
                }
                style={styles.title}
              />
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={handleCopyAll}
                style={styles.copyAllButton}
              >
                <Ionicons name="copy" size={20} color="#007bff" />
                <AuraText text="Copiar todo" style={styles.copyAllText} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent}>
            {type === "ocr" && results?.data?.results && (
              <View style={styles.ocrContainer}>
                {results.data.results.map((result, index) => (
                  <View key={index} style={styles.resultCard}>
                    {/* Header del resultado */}
                    <View style={styles.resultHeader}>
                      <View style={styles.resultHeaderLeft}>
                        <Ionicons name="document-text" size={20} color="#007bff" />
                        <AuraText
                          text={`Contenido ${result.content_id}`}
                          style={styles.resultTitle}
                        />
                      </View>
                      {result.success && (
                        <View style={styles.successBadge}>
                          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                          <AuraText text="Exitoso" style={styles.successText} />
                        </View>
                      )}
                    </View>

                    {/* Estadísticas */}
                    {result.estadisticas && (
                      <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                          <Ionicons name="text-outline" size={16} color="#666" />
                          <AuraText
                            text={`${result.estadisticas.palabras_extraidas} palabras`}
                            style={styles.statText}
                          />
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="layers-outline" size={16} color="#666" />
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
                          <Ionicons name="create-outline" size={18} color="#28a745" />
                          <AuraText
                            text="Texto Corregido"
                            style={styles.sectionTitle}
                          />
                          <TouchableOpacity
                            onPress={() => handleCopyText(result.texto_corregido)}
                            style={styles.miniCopyButton}
                          >
                            <Ionicons name="copy-outline" size={16} color="#007bff" />
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
                          <Ionicons name="scan-outline" size={18} color="#6c757d" />
                          <AuraText
                            text="Texto Original (OCR)"
                            style={[styles.sectionTitle, { color: "#6c757d" }]}
                          />
                          <TouchableOpacity
                            onPress={() => handleCopyText(result.texto_extraido)}
                            style={styles.miniCopyButton}
                          >
                            <Ionicons name="copy-outline" size={16} color="#007bff" />
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
                      <TouchableOpacity style={styles.detailsToggle}>
                        <Ionicons name="information-circle-outline" size={16} color="#007bff" />
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
                      >
                        <Ionicons name="copy-outline" size={18} color="#666" />
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
                <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 700,
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  copyAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e7f3ff",
    borderRadius: 6,
  },
  copyAllText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  ocrContainer: {
    padding: 20,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  successText: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  textSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#28a745",
    flex: 1,
  },
  miniCopyButton: {
    padding: 4,
  },
  originalTextCard: {
    backgroundColor: "#f8f9fa",
    borderColor: "#dee2e6",
  },
  originalText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#666",
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#e7f3ff",
    borderRadius: 8,
    marginTop: 8,
  },
  detailsToggleText: {
    fontSize: 12,
    color: "#007bff",
    fontWeight: "500",
  },
  textCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  extractedText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
  questionsContainer: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  copyButton: {
    padding: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    lineHeight: 24,
  },
  answerContainer: {
    backgroundColor: "#e7f3ff",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007bff",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  answerText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  closeButtonFooter: {
    backgroundColor: "#6c757d",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
