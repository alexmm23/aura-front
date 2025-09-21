import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
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
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const downloadAttachment = async (attachment) => {
    try {
      const fileUri = FileSystem.documentDirectory + attachment.name;

      const downloadResult = await FileSystem.downloadAsync(
        attachment.url,
        fileUri
      );

      if (downloadResult.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert(
            "Descarga completada",
            `Archivo guardado: ${attachment.name}`
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
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Ionicons name="attach" size={14} color="#666" />
          <Text style={styles.compactText}>
            {attachments.length} archivo{attachments.length > 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {attachments.map((attachment) => (
        <View key={attachment.id} style={styles.attachmentItem}>
          <View style={styles.fileInfo}>
            <Ionicons
              name={getFileIcon(attachment.type, attachment.name)}
              size={24}
              color="#CB8D27"
            />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {attachment.name}
              </Text>
              {attachment.size && (
                <Text style={styles.fileSize}>
                  {formatFileSize(attachment.size)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => downloadAttachment(attachment)}
            >
              <Ionicons name="download-outline" size={18} color="#4285F4" />
            </TouchableOpacity>

            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete(attachment.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#ff4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  compactContainer: {
    marginVertical: 4,
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
});

export default AttachmentViewer;
