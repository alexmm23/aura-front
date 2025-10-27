import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  Modal,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";

export const AttachmentViewer = ({
  attachments,
  compact = false,
  onDelete,
}) => {
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }
  console.log("Attachments:", attachments);

  const downloadAttachment = async (attachment) => {
    try {
      // En web, simplemente abre el archivo en una nueva pestaña para descarga
      if (Platform.OS === "web") {
        // Para imágenes en web, no hacer nada aquí (se maneja en handleAttachmentPress)
        // Solo descargar directamente si se llama desde el botón de descarga
        const link = document.createElement("a");
        link.href = attachment.file_url;
        link.download = attachment.file_name || "download";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // En móvil, usa FileSystem para descargar
      const fileUri = FileSystem.documentDirectory + attachment.file_name;

      const downloadResult = await FileSystem.downloadAsync(
        attachment.file_url,
        fileUri
      );

      if (downloadResult.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert(
            "Descarga completada",
            `Archivo guardado: ${attachment.file_name}`
          );
        }
      } else {
        Alert.alert("Error", "No se pudo descargar el archivo");
      }
    } catch (error) {
      console.error("Error downloading attachment:", error);
      Alert.alert("Error", "Error al descargar el archivo");
    }
  };

  const handleAttachmentPress = (attachment) => {
    // Si es una imagen, abrir en preview modal (tanto en web como en móvil)
    if (attachment.file_type?.startsWith("image/")) {
      setSelectedAttachment(attachment);
      setPreviewModal(true);
    } else {
      // Si no es imagen, descargar directamente
      downloadAttachment(attachment);
    }
  };

  const getFileIcon = (type, name) => {
    if (type?.startsWith("image/")) return "image";
    if (type?.startsWith("video/")) return "videocam";
    if (type?.startsWith("audio/")) return "musical-notes";
    if (type?.includes("pdf") || name?.endsWith(".pdf")) return "document-text";
    if (
      type?.includes("word") ||
      name?.endsWith(".docx") ||
      name?.endsWith(".doc")
    )
      return "document-text";
    if (
      type?.includes("excel") ||
      name?.endsWith(".xlsx") ||
      name?.endsWith(".xls")
    )
      return "grid";
    if (
      type?.includes("powerpoint") ||
      name?.endsWith(".pptx") ||
      name?.endsWith(".ppt")
    )
      return "easel";
    return "document";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (compact) {
    return (
      <>
        <View style={styles.compactContainer}>
          {attachments.map((attachment) => (
            <TouchableOpacity
              key={attachment.id}
              style={styles.compactAttachmentItem}
              onPress={() => handleAttachmentPress(attachment)}
              activeOpacity={0.7}
            >
              <View style={styles.compactFileInfo}>
                <Ionicons
                  name={getFileIcon(attachment.file_type, attachment.file_name)}
                  size={20}
                  color="#CB8D27"
                />
                <Text style={styles.compactFileName} numberOfLines={1}>
                  {attachment.file_name}
                </Text>
              </View>
              <Ionicons
                name={
                  attachment.file_type?.startsWith("image/")
                    ? "eye-outline"
                    : "download-outline"
                }
                size={16}
                color="#4285F4"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal de preview para imágenes */}
        <Modal
          visible={previewModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedAttachment?.name}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      if (selectedAttachment) {
                        downloadAttachment(selectedAttachment);
                      }
                    }}
                  >
                    <Ionicons
                      name="download-outline"
                      size={24}
                      color="#4285F4"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setPreviewModal(false)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={styles.imageContainer}
                maximumZoomScale={3}
                minimumZoomScale={1}
              >
                {selectedAttachment && (
                  <Image
                    source={{ uri: selectedAttachment.file_url }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {attachments.map((attachment) => (
          <TouchableOpacity
            key={attachment.id}
            style={styles.attachmentItem}
            onPress={() => handleAttachmentPress(attachment)}
            activeOpacity={0.9}
          >
            <View style={styles.fileInfo}>
              <Ionicons
                name={getFileIcon(attachment.file_type, attachment.file_name)}
                size={24}
                color="#CB8D27"
              />
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {attachment.file_name}
                </Text>
                {attachment.file_size && (
                  <Text style={styles.fileSize}>
                    {formatFileSize(attachment.file_size)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  downloadAttachment(attachment);
                }}
              >
                <Ionicons name="download-outline" size={18} color="#4285F4" />
              </TouchableOpacity>

              {onDelete && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(attachment.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal de preview para imágenes */}
      <Modal
        visible={previewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedAttachment?.name}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    if (selectedAttachment) {
                      downloadAttachment(selectedAttachment);
                    }
                  }}
                >
                  <Ionicons name="download-outline" size={24} color="#4285F4" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setPreviewModal(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.imageContainer}
              maximumZoomScale={3}
              minimumZoomScale={1}
            >
              {selectedAttachment && (
                <Image
                  source={{ uri: selectedAttachment.file_url }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  compactContainer: {
    marginVertical: 4,
  },
  compactAttachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#CB8D27",
  },
  compactFileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  compactFileName: {
    fontSize: 13,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 800,
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#F8F9FA",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
  },
  modalButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewImage: {
    width: Dimensions.get("window").width * 0.85,
    height: Dimensions.get("window").height * 0.65,
    maxWidth: 750,
  },
});

export default AttachmentViewer;
