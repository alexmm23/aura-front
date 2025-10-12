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

    if (type === "ocr" && results?.extracted_text) {
      allText = results.extracted_text;
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
            {type === "ocr" && results?.extracted_text && (
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
