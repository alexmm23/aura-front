import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getDocumentAsync } from "expo-document-picker";
import { API } from "@/config/api";

import {
  apiGet,
  apiPost,
  apiPostMultipart,
  apiDelete,
} from "../../utils/fetchWithAuth";
import { File } from "expo-file-system";
import {
  AttachmentViewer,
  LinksViewer,
  CommentCard,
} from "../../components/forums";

const PostDetail = () => {
  const router = useRouter();
  const { postId } = useLocalSearchParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Estados para crear comentario
  const [commentText, setCommentText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [links, setLinks] = useState([""]);
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
      fetchComments();
    }
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const response = await apiGet(
        API.ENDPOINTS.POSTS.DETAIL.replace(":id", postId)
      );
      if (response.ok) {
        const data = await response.json();
        setPost(data.success ? data.data : data);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await apiGet(
        API.ENDPOINTS.POSTS.COMMENTS.replace(":id", postId)
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data.success ? data.data : data);
      } else {
        Alert.alert("Error", "No se pudieron cargar los comentarios");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      Alert.alert("Error", "Error de conexión");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComments();
  };

  const pickFiles = async () => {
    try {
      const result = await getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFiles([...selectedFiles, ...result.assets]);
      }
    } catch (error) {
      console.error("Error picking files:", error);
      Alert.alert("Error", "No se pudieron seleccionar los archivos");
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const updateLink = (index, value) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const removeLink = (index) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const createComment = async () => {
    if (!commentText.trim()) {
      Alert.alert("Error", "El comentario no puede estar vacío");
      return;
    }

    try {
      setCommenting(true);

      // Preparar los datos del comentario
      const commentData = {
        content: commentText,
        links: links.filter((link) => link.trim() !== ""),
      };

      let response;

      // Convertir archivos a base64 si existen
      const attachments = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            let base64Data;

            if (Platform.OS === "web") {
              // En web, usar fetch y FileReader
              const blob = await fetch(file.uri).then((r) => r.blob());
              base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result.split(",")[1];
                  resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } else {
              // En móvil (Android/iOS), usar la nueva API de FileSystem
              const pickedFile = new File(file.uri);
              base64Data = await pickedFile.base64();
            }

            attachments.push({
              name: file.name,
              type: file.mimeType || "application/octet-stream",
              data: base64Data,
            });
          } catch (fileError) {
            console.error("Error processing file:", file.name, fileError);
            Alert.alert(
              "Error",
              `No se pudo procesar el archivo: ${file.name}`
            );
          }
        }
      }

      // Preparar datos completos incluyendo archivos en base64
      const completeCommentData = {
        ...commentData,
        attachments,
      };

      // Siempre usar JSON
      response = await apiPost(
        API.ENDPOINTS.POSTS.CREATE_COMMENT.replace(":id", postId),
        completeCommentData
      );

      if (response.ok) {
        Alert.alert("Éxito", "Comentario agregado correctamente");
        setShowCommentModal(false);
        resetCommentForm();
        fetchComments();
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.message || "No se pudo agregar el comentario"
        );
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      Alert.alert("Error", "Error de conexión");
    } finally {
      setCommenting(false);
    }
  };

  const resetCommentForm = () => {
    setCommentText("");
    setSelectedFiles([]);
    setLinks([""]);
  };

  const deleteAttachment = async (attachmentId) => {
    Alert.alert(
      "Eliminar adjunto",
      "¿Estás seguro de que quieres eliminar este adjunto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiDelete(
                API.ENDPOINTS.ATTACHMENTS.DELETE.replace(":id", attachmentId)
              );
              if (response.ok) {
                Alert.alert("Éxito", "Adjunto eliminado");
                fetchPostDetails();
                fetchComments();
              } else {
                Alert.alert("Error", "No se pudo eliminar el adjunto");
              }
            } catch (error) {
              console.error("Error deleting attachment:", error);
              Alert.alert("Error", "Error de conexión");
            }
          },
        },
      ]
    );
  };

  const openLink = (url) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      Linking.openURL(url);
    } else {
      Linking.openURL(`https://${url}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CB8D27" />
          <Text style={styles.loadingText}>Cargando post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
          <Text style={styles.errorText}>No se pudo cargar el post</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#CB8D27" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {post.allow_responses && (
          <TouchableOpacity
            style={styles.commentButton}
            onPress={() => setShowCommentModal(true)}
          >
            <Ionicons name="chatbubble" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Post Content */}
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Text style={styles.postTitle}>{post.title}</Text>
            {!post.allow_responses && (
              <View style={styles.closedBadge}>
                <Ionicons name="lock-closed" size={14} color="#fff" />
                <Text style={styles.closedText}>Cerrado</Text>
              </View>
            )}
          </View>

          <View style={styles.postMeta}>
            <View style={styles.authorInfo}>
              <Ionicons name="person-circle-outline" size={20} color="#666" />
              <Text style={styles.authorName}>
                {post.user?.name || "Usuario"}
              </Text>
            </View>
            <Text style={styles.postDate}>
              {new Date(post.created_at).toLocaleString("es-ES")}
            </Text>
          </View>

          <Text style={styles.postDescription}>{post.description}</Text>

          {post.attachments?.length > 0 && (
            <AttachmentViewer
              attachments={post.attachments}
              onDelete={post.is_owner ? deleteAttachment : null}
            />
          )}

          {post.links?.length > 0 && <LinksViewer links={post.links} />}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsTitle}>
              Respuestas ({comments.length})
            </Text>
          </View>

          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))
          ) : (
            <View style={styles.noCommentsContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
              <Text style={styles.noCommentsText}>
                {post.allow_responses
                  ? "No hay respuestas aún. ¡Sé el primero en responder!"
                  : "Este post no permite respuestas"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCommentModal(false)}>
              <Text style={styles.modalCancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Agregar Respuesta</Text>
            <TouchableOpacity
              onPress={createComment}
              disabled={commenting || !commentText.trim()}
            >
              <Text
                style={[
                  styles.modalSaveButton,
                  (!commentText.trim() || commenting) &&
                    styles.modalSaveButtonDisabled,
                ]}
              >
                {commenting ? "Enviando..." : "Enviar"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Respuesta *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Escribe tu respuesta aquí..."
                multiline
                numberOfLines={6}
                value={commentText}
                onChangeText={setCommentText}
              />
            </View>

            {/* Files Section */}
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.inputLabel}>Archivos adjuntos</Text>
                <TouchableOpacity style={styles.addButton} onPress={pickFiles}>
                  <Ionicons name="add" size={20} color="#CB8D27" />
                  <Text style={styles.addButtonText}>Agregar archivos</Text>
                </TouchableOpacity>
              </View>

              {selectedFiles.length > 0 && (
                <View style={styles.filesList}>
                  {selectedFiles.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <Ionicons name="document" size={16} color="#666" />
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <TouchableOpacity onPress={() => removeFile(index)}>
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#ff4444"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Links Section */}
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.inputLabel}>Enlaces</Text>
                <TouchableOpacity style={styles.addButton} onPress={addLink}>
                  <Ionicons name="add" size={20} color="#CB8D27" />
                  <Text style={styles.addButtonText}>Agregar enlace</Text>
                </TouchableOpacity>
              </View>

              {links.map((link, index) => (
                <View key={index} style={styles.linkInputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.linkInput]}
                    placeholder="https://ejemplo.com"
                    value={link}
                    onChangeText={(text) => updateLink(index, text)}
                  />
                  {links.length > 1 && (
                    <TouchableOpacity onPress={() => removeLink(index)}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ff4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  commentButton: {
    backgroundColor: "#CB8D27",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  closedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ff4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
    fontWeight: "500",
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginLeft: 8,
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  postDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  attachmentsContainer: {
    marginVertical: 12,
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
  attachmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  linksContainer: {
    marginVertical: 12,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: "#4285F4",
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  commentsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentsSectionHeader: {
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  commentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  commentHeader: {
    marginBottom: 12,
  },
  commentAuthor: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAuthorInfo: {
    marginLeft: 12,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  commentDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },
  noCommentsContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  noCommentsText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  backButton: {
    marginTop: 24,
    backgroundColor: "#CB8D27",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalCancelButton: {
    fontSize: 16,
    color: "#666",
  },
  modalSaveButton: {
    fontSize: 16,
    color: "#CB8D27",
    fontWeight: "600",
  },
  modalSaveButtonDisabled: {
    color: "#ccc",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    color: "#CB8D27",
    marginLeft: 4,
    fontWeight: "500",
  },
  filesList: {
    marginTop: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  linkInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  linkInput: {
    flex: 1,
    marginRight: 8,
  },
});

export default PostDetail;
