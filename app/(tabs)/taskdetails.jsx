import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  Linking,
  Clipboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API, buildApiUrl } from "@/config/api";
import { AuraText } from "@/components/AuraText";
import * as DocumentPicker from "expo-document-picker";
import { apiGet, apiPost } from "../../utils/fetchWithAuth";

const TaskDetails = () => {
  const router = useRouter();
  const { courseId, courseWorkId, submissionId } = useLocalSearchParams();

  // Función helper para codificar IDs en base64
  const encodeBase64 = (str) => {
    if (Platform.OS === "web") {
      return btoa(str);
    } else {
      // Para React Native, usar una implementación simple de base64
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

  // Estados para los datos de la tarea
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados para el formulario de entrega
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasSubmission, setHasSubmission] = useState(false);

  // Estados para el modal de entrega manual
  const [showManualSubmissionModal, setShowManualSubmissionModal] =
    useState(false);
  const [manualSubmissionData, setManualSubmissionData] = useState(null);

  // Cargar detalles de la tarea
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await apiGet(
          `${API.ENDPOINTS.STUDENT.HOMEWORK}/${courseId}/${courseWorkId}`
        );

        if (response.ok) {
          const data = await response.json();
          setTask(data);
          console.log("Task data:", data);
          setHasSubmission(!!data.submission);
          if (data.submission) {
            setSubmissionText(data.submission.text || "");
          }
        } else {
          console.error("Error fetching task details:", response.status);
          Alert.alert("Error", "No se pudo cargar los detalles de la tarea");
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
        Alert.alert("Error", "Error de conexión al cargar la tarea");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && courseWorkId) {
      console.log("Fetching task details...");
      fetchTaskDetails();
    }
  }, [courseId, courseWorkId]);

  // Función para seleccionar archivo
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  // Función para enviar la tarea
  const submitTask = async () => {
    if (!submissionText.trim() && !selectedFile) {
      Alert.alert(
        "Error",
        "Debes escribir un comentario o adjuntar un archivo"
      );
      return;
    }

    setSubmitting(true);
    try {
      // Preparar datos de la solicitud
      let fileData = null;

      // Si hay archivo, convertirlo a base64
      if (selectedFile) {
        try {
          const response = await fetch(selectedFile.uri);
          const blob = await response.blob();
          const reader = new FileReader();

          const fileBase64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          fileData = {
            name: selectedFile.name,
            mimeType: selectedFile.mimeType,
            size: selectedFile.size,
            data: fileBase64,
          };
        } catch (error) {
          console.error("Error converting file to base64:", error);
          Alert.alert("Error", "No se pudo procesar el archivo");
          return;
        }
      }

      const requestData = {
        submissionId: submissionId,
        text: submissionText.trim() || null,
        file: fileData,
        metadata: {
          platform: Platform.OS,
          version: "1.0",
          submittedAt: new Date().toISOString(),
        },
      };

      // Construir la URL del endpoint con parámetros
      const endpoint = API.ENDPOINTS.STUDENT.HOMEWORK_SUBMIT_FILE.replace(
        ":courseId",
        courseId
      ).replace(":courseWorkId", courseWorkId);

      console.log("Submitting assignment:", {
        endpoint,
        courseId,
        courseWorkId,
        submissionId,
        hasFile: !!fileData,
        hasText: !!requestData.text,
        fileSize: fileData?.size,
      });

      const response = await apiPost(endpoint, requestData);

      if (response.ok) {
        const result = await response.json();
        console.log("Submission successful:", result);

        // Si la respuesta indica que se necesita entrega manual
        if (
          result.message?.includes("manual submission required") ||
          result.fileInfo
        ) {
          console.log("Manual submission required:", result);
          setManualSubmissionData(result);
          setShowManualSubmissionModal(true);
        } else {
          // Entrega exitosa normal
          let message = "Tarea entregada correctamente";

          // Mostrar mensaje específico basado en la respuesta
          if (result.fileLink) {
            message +=
              "\n\nNota: Es posible que necesites compartir el archivo manualmente con tu profesor.";
          }

          if (result.instructions) {
            message += `\n\n${result.instructions}`;
          }

          Alert.alert("Éxito", message, [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } else {
        console.error("Error submitting task:", response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);

        let errorMessage = "No se pudo entregar la tarea";
        if (errorData.error) {
          errorMessage += `\n\n${errorData.error}`;
        }

        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      Alert.alert("Error", "Error de conexión al entregar la tarea");
    } finally {
      setSubmitting(false);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Funciones para el modal de entrega manual
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

  const openGoogleClassroom = () => {
    // URL específica para la tarea en Google Classroom con IDs codificados en base64
    const encodedCourseId = encodeBase64(courseId);
    const encodedCourseWorkId = encodeBase64(courseWorkId);
    const classroomTaskUrl = `https://classroom.google.com/u/4/c/${encodedCourseId}/a/${encodedCourseWorkId}/details`;
    Linking.openURL(classroomTaskUrl).catch(() => {
      // Fallback a la URL general de Classroom si falla
      const classroomUrl = "https://classroom.google.com/u/4";
      Linking.openURL(classroomUrl).catch(() => {
        Alert.alert("Error", "No se pudo abrir Google Classroom");
      });
    });
  };

  const openTaskSubmission = () => {
    // URL directa para entregar la tarea específica con IDs codificados en base64
    const encodedCourseId = encodeBase64(courseId);
    const encodedCourseWorkId = encodeBase64(courseWorkId);
    const taskSubmissionUrl = `https://classroom.google.com/u/4/c/${encodedCourseId}/a/${encodedCourseWorkId}/details`;
    Linking.openURL(taskSubmissionUrl).catch(() => {
      Alert.alert("Error", "No se pudo abrir la tarea en Google Classroom");
    });
  };

  const copyTaskUrl = async () => {
    const encodedCourseId = encodeBase64(courseId);
    const encodedCourseWorkId = encodeBase64(courseWorkId);
    const taskUrl = `https://classroom.google.com/u/4/c/${encodedCourseId}/a/${encodedCourseWorkId}/details`;
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(taskUrl);
      } else {
        await Clipboard.setString(taskUrl);
      }
      Alert.alert("Copiado", "Link de la tarea copiado al portapapeles");
    } catch (error) {
      console.error("Error copying task URL:", error);
      Alert.alert("Error", "No se pudo copiar el link de la tarea");
    }
  };

  const openFileLink = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "No se pudo abrir el archivo");
    });
  };

  const handleManualSubmissionComplete = () => {
    setShowManualSubmissionModal(false);
    setManualSubmissionData(null);
    Alert.alert(
      "¡Perfecto!",
      "Recuerda entregar el archivo en Google Classroom usando el link proporcionado",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  // Función para determinar el estado de la tarea
  const getTaskStatus = () => {
    if (hasSubmission) return { text: "Entregada", color: "#28a745" };

    const dueDate = new Date(task.due_date);
    const today = new Date();

    if (dueDate < today) {
      return { text: "Vencida", color: "#dc3545" };
    } else {
      return { text: "Pendiente", color: "#ffc107" };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CB8D27" />
        <Text style={styles.loadingText}>Cargando tarea...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la tarea</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = getTaskStatus();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con ilustración */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#CB8D27" />
          </TouchableOpacity>
          <View style={styles.headerIllustration}>
            <Image
              source={require("../../assets/images/books-illustration.png")}
              style={styles.booksImage}
              resizeMode="contain"
            />
          </View>
        </View>
        <AuraText
          text={task.courseName || "Análisis de Datos"}
          style={styles.headerTitle}
        />
      </View>

      {/* Card principal de la tarea */}
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.taskIcon}>
            <Ionicons name="document-text-outline" size={24} color="#CB8D27" />
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskSubject}>{task.subject}</Text>
            <View style={styles.dueDateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.dueDate}>
                Fecha de entrega:{" "}
                {task.dueDate &&
                task.dueDate.year &&
                task.dueDate.month &&
                task.dueDate.day
                  ? formatDate(
                      task.dueDate.year +
                        "-" +
                        task.dueDate.month +
                        "-" +
                        task.dueDate.day
                    )
                  : "Sin fecha límite"}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: status.color }]}
            >
              <Text style={styles.statusText}>{status.text}</Text>
            </View>
          </View>
        </View>

        {/* Descripción de la tarea */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {task.description ||
              "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."}
          </Text>
        </View>

        {/* Rúbrica (si existe) */}
        {task.rubric &&
          task.rubric.criteria &&
          task.rubric.criteria.length > 0 && (
            <View style={styles.rubricSection}>
              <Text style={styles.sectionTitle}>Rúbrica de Evaluación</Text>
              <Text style={styles.rubricSubtitle}>
                Criterios de evaluación para esta tarea
              </Text>
              {task.rubric.criteria.map((criterion, index) => {
                const totalPoints =
                  criterion.levels?.reduce(
                    (sum, level) => sum + (level.points || 0),
                    0
                  ) || 0;
                return (
                  <View
                    key={criterion.id || index}
                    style={styles.criterionCard}
                  >
                    <View style={styles.criterionHeader}>
                      <Text style={styles.criterionTitle}>
                        {criterion.title}
                      </Text>
                      <View style={styles.totalPointsBadge}>
                        <Text style={styles.totalPointsText}>
                          {totalPoints} pts
                        </Text>
                      </View>
                    </View>
                    {criterion.levels && criterion.levels.length > 0 && (
                      <View style={styles.levelsContainer}>
                        {criterion.levels.map((level, levelIndex) => (
                          <View
                            key={level.id || levelIndex}
                            style={styles.levelItem}
                          >
                            <View style={styles.pointsBadge}>
                              <Text style={styles.pointsText}>
                                {level.points} pts
                              </Text>
                            </View>
                            <View style={styles.levelContent}>
                              {level.title && (
                                <Text style={styles.levelTitle}>
                                  {level.title}
                                </Text>
                              )}
                              {level.description && (
                                <Text style={styles.levelDescription}>
                                  {level.description}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

        {/* Sección de entrega */}
        {!hasSubmission ? (
          <View style={styles.submissionSection}>
            <Text style={styles.sectionTitle}>Entregar Tarea</Text>

            {/* Campo de texto para comentarios */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Comentarios (opcional)</Text>
              <TextInput
                style={styles.textArea}
                value={submissionText}
                onChangeText={setSubmissionText}
                placeholder="Escribe comentarios sobre tu entrega..."
                multiline={true}
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>

            {/* Selector de archivo */}
            <View style={styles.fileSection}>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={pickDocument}
              >
                <Ionicons name="attach-outline" size={20} color="#007bff" />
                <Text style={styles.filePickerText}>
                  {selectedFile ? "Cambiar archivo" : "Adjuntar archivo"}
                </Text>
              </TouchableOpacity>

              {selectedFile && (
                <View style={styles.selectedFileContainer}>
                  <Ionicons name="document-outline" size={16} color="#28a745" />
                  <Text style={styles.selectedFileName}>
                    {selectedFile.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Ionicons name="close-circle" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Botón de entrega */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (submitting || (!submissionText.trim() && !selectedFile)) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={submitTask}
              disabled={submitting || (!submissionText.trim() && !selectedFile)}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Entregar Tarea</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.submittedSection}>
            <View style={styles.submittedHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#28a745" />
              <Text style={styles.submittedTitle}>Tarea Entregada</Text>
            </View>
            <Text style={styles.submittedDate}>
              Entregada el:{" "}
              {formatDate(task.submission?.submitted_at || new Date())}
            </Text>
            {task.submission?.text && (
              <View style={styles.submissionContent}>
                <Text style={styles.submissionLabel}>Comentarios:</Text>
                <Text style={styles.submissionText}>
                  {task.submission.text}
                </Text>
              </View>
            )}
            {task.submission?.file_url && (
              <TouchableOpacity style={styles.downloadButton}>
                <Ionicons name="download-outline" size={16} color="#007bff" />
                <Text style={styles.downloadText}>Ver archivo entregado</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Modal de entrega manual */}
      <Modal
        visible={showManualSubmissionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualSubmissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header del modal */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={32}
                    color="#CB8D27"
                  />
                </View>
                <Text style={styles.modalTitle}>Archivo Subido a Drive</Text>
                <Text style={styles.modalSubtitle}>
                  Entrega manual requerida
                </Text>
              </View>

              {/* Información del archivo */}
              {manualSubmissionData?.fileInfo && (
                <View style={styles.fileInfoSection}>
                  <Text style={styles.sectionTitle}>Archivo Subido</Text>
                  <View style={styles.fileInfoCard}>
                    <View style={styles.fileIconContainer}>
                      <Ionicons
                        name="document-outline"
                        size={24}
                        color="#28a745"
                      />
                    </View>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName}>
                        {manualSubmissionData.fileInfo.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {Math.round(manualSubmissionData.fileInfo.size / 1024)}{" "}
                        KB
                      </Text>
                      <Text style={styles.fileMimeType}>
                        {manualSubmissionData.fileInfo.mimeType}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Instrucciones */}
              <View style={styles.instructionsSection}>
                <Text style={styles.sectionTitle}>Instrucciones</Text>
                {manualSubmissionData?.instructions?.map(
                  (instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <View style={styles.instructionNumber}>
                        <Text style={styles.instructionNumberText}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  )
                )}
              </View>

              {/* Links del archivo */}
              <View style={styles.linksSection}>
                <Text style={styles.sectionTitle}>Enlaces del Archivo</Text>

                {/* Link de visualización */}
                <View style={styles.linkCard}>
                  <View style={styles.linkHeader}>
                    <Ionicons name="eye-outline" size={20} color="#007bff" />
                    <Text style={styles.linkTitle}>Ver Archivo</Text>
                  </View>
                  <Text style={styles.linkUrl} numberOfLines={2}>
                    {manualSubmissionData?.fileInfo?.viewLink}
                  </Text>
                  <View style={styles.linkActions}>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() =>
                        copyToClipboard(
                          manualSubmissionData?.fileInfo?.viewLink
                        )
                      }
                    >
                      <Ionicons name="copy-outline" size={16} color="#fff" />
                      <Text style={styles.copyButtonText}>Copiar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.openButton}
                      onPress={() =>
                        openFileLink(manualSubmissionData?.fileInfo?.viewLink)
                      }
                    >
                      <Ionicons name="open-outline" size={16} color="#007bff" />
                      <Text style={styles.openButtonText}>Abrir</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Link de descarga */}
                <View style={styles.linkCard}>
                  <View style={styles.linkHeader}>
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color="#28a745"
                    />
                    <Text style={styles.linkTitle}>Descargar Archivo</Text>
                  </View>
                  <Text style={styles.linkUrl} numberOfLines={2}>
                    {manualSubmissionData?.fileInfo?.downloadLink}
                  </Text>
                  <View style={styles.linkActions}>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() =>
                        copyToClipboard(
                          manualSubmissionData?.fileInfo?.downloadLink
                        )
                      }
                    >
                      <Ionicons name="copy-outline" size={16} color="#fff" />
                      <Text style={styles.copyButtonText}>Copiar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.openButton}
                      onPress={() =>
                        openFileLink(
                          manualSubmissionData?.fileInfo?.downloadLink
                        )
                      }
                    >
                      <Ionicons
                        name="download-outline"
                        size={16}
                        color="#28a745"
                      />
                      <Text style={styles.openButtonText}>Descargar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Enlace directo a la tarea */}
              <View style={styles.taskLinkSection}>
                <Text style={styles.sectionTitle}>Enlace a la Tarea</Text>

                <View style={styles.taskLinkCard}>
                  <View style={styles.linkHeader}>
                    <Ionicons name="school-outline" size={20} color="#4285F4" />
                    <Text style={styles.linkTitle}>
                      Ir a la Tarea en Google Classroom
                    </Text>
                  </View>
                  <Text style={styles.taskDescription}>
                    Este enlace te llevará directamente a la tarea donde podrás
                    adjuntar tu archivo
                  </Text>
                  <Text style={styles.linkUrl} numberOfLines={2}>
                    https://classroom.google.com/u/1/c/{encodeBase64(courseId)}
                    /a/
                    {encodeBase64(courseWorkId)}/details
                  </Text>
                  <View style={styles.linkActions}>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={copyTaskUrl}
                    >
                      <Ionicons name="copy-outline" size={16} color="#fff" />
                      <Text style={styles.copyButtonText}>Copiar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.taskOpenButton}
                      onPress={openTaskSubmission}
                    >
                      <Ionicons name="open-outline" size={16} color="#fff" />
                      <Text style={styles.taskOpenButtonText}>Ir a Tarea</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Nota importante */}
              {manualSubmissionData?.note && (
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
                    {manualSubmissionData.note}
                  </Text>
                </View>
              )}

              {/* Botones de acción */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.taskSubmissionButton}
                  onPress={openTaskSubmission}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.taskSubmissionButtonText}>
                    Ir a Entregar Tarea
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleManualSubmissionComplete}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.completeButtonText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#CB8D27",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#CB8D27",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerIllustration: {
    flex: 1,
    alignItems: "center",
  },
  booksImage: {
    width: 120,
    height: 80,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  taskCard: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF3CD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  taskSubject: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  descriptionSection: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  submissionSection: {
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F8F9FA",
    minHeight: 100,
    textAlignVertical: "top",
  },
  fileSection: {
    marginBottom: 25,
  },
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#007bff",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
  },
  filePickerText: {
    fontSize: 16,
    color: "#007bff",
    marginLeft: 8,
    fontWeight: "500",
  },
  selectedFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4EDDA",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    color: "#155724",
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#CB8D27",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  submittedSection: {
    backgroundColor: "#D4EDDA",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C3E6CB",
  },
  submittedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  submittedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#155724",
    marginLeft: 8,
  },
  submittedDate: {
    fontSize: 14,
    color: "#155724",
    marginBottom: 15,
  },
  submissionContent: {
    marginBottom: 15,
  },
  submissionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#155724",
    marginBottom: 5,
  },
  submissionText: {
    fontSize: 14,
    color: "#155724",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 6,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  downloadText: {
    fontSize: 14,
    color: "#007bff",
    marginLeft: 5,
    fontWeight: "500",
  },
  // Estilos para la rúbrica
  rubricSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  rubricSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontStyle: "italic",
  },
  criterionCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#CB8D27",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  criterionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  criterionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  totalPointsBadge: {
    backgroundColor: "#CB8D27",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  totalPointsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  levelsContainer: {
    gap: 8,
  },
  levelItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  pointsBadge: {
    backgroundColor: "#6C757D",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    minWidth: 50,
    alignItems: "center",
  },
  pointsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  levelContent: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  // Estilos para el modal de entrega manual
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
  },
  modalHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  fileInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  fileInfoCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D4EDDA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  fileMimeType: {
    fontSize: 12,
    color: "#999",
  },
  instructionsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#CB8D27",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  linksSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  linkCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  linkHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  linkUrl: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  linkActions: {
    flexDirection: "row",
    gap: 10,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C757D",
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  openButtonText: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  noteSection: {
    padding: 20,
    backgroundColor: "#FFF3CD",
    margin: 20,
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
  modalActions: {
    padding: 20,
    gap: 12,
  },
  classroomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 15,
    borderRadius: 12,
  },
  classroomButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    paddingVertical: 15,
    borderRadius: 12,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Estilos para la sección del enlace a la tarea
  taskLinkSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  taskLinkCard: {
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: "#4285F4",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  taskOpenButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  taskOpenButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  taskSubmissionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CB8D27",
    paddingVertical: 15,
    borderRadius: 12,
  },
  taskSubmissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default TaskDetails;
