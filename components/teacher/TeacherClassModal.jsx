import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Clipboard,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Función helper para codificar IDs en base64 (igual que en TaskDetails)
const encodeBase64 = (str) => {
  if (Platform.OS === "web") {
    return btoa(str);
  } else {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    let i = 0;
    const data = str;

    while (i < data.length) {
      const a = data.charCodeAt(i++);
      const b = i < data.length ? data.charCodeAt(i++) : 0;
      const c = i < data.length ? data.charCodeAt(i++) : 0;

      const bitmap = (a << 16) | (b << 8) | c;

      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += chars.charAt((bitmap >> 6) & 63);
      result += chars.charAt(bitmap & 63);
    }

    return (
      result.substring(
        0,
        result.length - (data.length % 3 ? 3 - (data.length % 3) : 0)
      ) + "===".substring(0, data.length % 3 ? 3 - (data.length % 3) : 0)
    );
  }
};

const TeacherClassModal = ({ visible, onClose, classData }) => {
  const copyToClipboard = async (text) => {
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setString(text);
      }
      Alert.alert("Copiado", "Link copiado al portapapeles");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "No se pudo copiar el link");
    }
  };

  const openGoogleClassroom = (type) => {
    if (!classData) return;

    const encodedCourseId = encodeBase64(classData.id);
    let classroomUrl;

    if (type === "announcement") {
      // URL para la vista de tablón (stream) donde se crean anuncios
      classroomUrl = `https://classroom.google.com/c/${encodedCourseId}`;
    } else if (type === "assignment") {
      // URL para la vista de trabajo de clase (classwork) donde se crean tareas
      classroomUrl = `https://classroom.google.com/w/${encodedCourseId}/t/all`;
    }

    Linking.openURL(classroomUrl).catch(() => {
      Alert.alert("Error", "No se pudo abrir Google Classroom");
    });
  };

  const copyClassroomUrl = async (type) => {
    if (!classData) return;

    const encodedCourseId = encodeBase64(classData.id);
    let classroomUrl;

    if (type === "announcement") {
      classroomUrl = `https://classroom.google.com/c/${encodedCourseId}`;
    } else if (type === "assignment") {
      classroomUrl = `https://classroom.google.com/w/${encodedCourseId}/t/all`;
    }

    await copyToClipboard(classroomUrl);
  };

  if (!classData) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* ✅ Botón de cerrar flotante en la esquina superior derecha */}
          <TouchableOpacity style={styles.closeIconButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#666" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="school-outline" size={32} color="#CB8D27" />
              </View>
              <Text style={styles.modalTitle}>{classData.name}</Text>
              <Text style={styles.modalSubtitle}>
                Selecciona una acción para esta clase
              </Text>
            </View>

            {/* Opciones */}
            <View style={styles.optionsContainer}>
              {/* Opción: Crear Anuncio */}
              <View style={styles.optionCard}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionIconContainer}>
                    <Ionicons
                      name="megaphone-outline"
                      size={24}
                      color="#4285F4"
                    />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>Crear Anuncio</Text>
                    <Text style={styles.optionDescription}>
                      Publica un anuncio para tus estudiantes
                    </Text>
                  </View>
                </View>

                <View style={styles.optionUrlContainer}>
                  <Text style={styles.optionUrlLabel}>Enlace directo:</Text>
                  <Text style={styles.optionUrl} numberOfLines={2}>
                    https://classroom.google.com/c/
                    {encodeBase64(classData.id)}
                  </Text>
                </View>

                <View style={styles.optionActions}>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyClassroomUrl("announcement")}
                  >
                    <Ionicons name="copy-outline" size={16} color="#fff" />
                    <Text style={styles.copyButtonText}>Copiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.openButton, styles.announcementButton]}
                    onPress={() => openGoogleClassroom("announcement")}
                  >
                    <Ionicons name="open-outline" size={16} color="#fff" />
                    <Text style={styles.openButtonText}>Abrir Classroom</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Opción: Crear Tarea */}
              <View style={styles.optionCard}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionIconContainer}>
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color="#34A853"
                    />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>Crear Tarea</Text>
                    <Text style={styles.optionDescription}>
                      Crea una nueva asignación para tus estudiantes
                    </Text>
                  </View>
                </View>

                <View style={styles.optionUrlContainer}>
                  <Text style={styles.optionUrlLabel}>Enlace directo:</Text>
                  <Text style={styles.optionUrl} numberOfLines={2}>
                    https://classroom.google.com/w/
                    {encodeBase64(classData.id)}/t/all
                  </Text>
                </View>

                <View style={styles.optionActions}>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyClassroomUrl("assignment")}
                  >
                    <Ionicons name="copy-outline" size={16} color="#fff" />
                    <Text style={styles.copyButtonText}>Copiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.openButton, styles.assignmentButton]}
                    onPress={() => openGoogleClassroom("assignment")}
                  >
                    <Ionicons name="open-outline" size={16} color="#fff" />
                    <Text style={styles.openButtonText}>Abrir Classroom</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Nota importante */}
            <View style={styles.noteSection}>
              <View style={styles.noteHeader}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#ffc107"
                />
                <Text style={styles.noteTitle}>Nota Importante</Text>
              </View>
              <Text style={styles.noteText}>
                Los enlaces te redirigirán a Google Classroom donde podrás crear
                tus anuncios o tareas. Asegúrate de haber iniciado sesión con tu
                cuenta de Google.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 20,
    position: "relative",
  },
  // ✅ Botón de cerrar flotante (esquina superior derecha)
  closeIconButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  modalHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12, // Espacio para el botón flotante
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF3CD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  optionsContainer: {
    padding: 20,
    gap: 16,
  },
  optionCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  optionUrlContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionUrlLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  optionUrl: {
    fontSize: 12,
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  optionActions: {
    flexDirection: "row",
    gap: 10,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C757D",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 2,
    justifyContent: "center",
  },
  announcementButton: {
    backgroundColor: "#4285F4",
  },
  assignmentButton: {
    backgroundColor: "#34A853",
  },
  openButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  noteSection: {
    padding: 20,
    backgroundColor: "#FFF3CD",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFECB5",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#856404",
    marginLeft: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
  },
});

export default TeacherClassModal;