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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { API } from "@/config/api";
import { AuraText } from "../../components/AuraText";
import { apiGet, apiPost, apiPostMultipart } from "../../utils/fetchWithAuth";
import { PostCard } from "../../components/forums/PostCard";

const ForumDetail = () => {
  const router = useRouter();
  const { forumId } = useLocalSearchParams();

  const [forum, setForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para crear post
  const [createData, setCreateData] = useState({
    title: "",
    description: "",
    allowResponses: true,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [links, setLinks] = useState([""]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (forumId) {
      fetchForumDetails();
      fetchPosts();
    }
  }, [forumId]);

  const fetchForumDetails = async () => {
    try {
      const response = await apiGet(
        API.ENDPOINTS.FORUMS.DETAIL.replace(":id", forumId)
      );
      if (response.ok) {
        const data = await response.json();
        setForum(data.success ? data.data : data);
      }
    } catch (error) {
      console.error("Error fetching forum details:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await apiGet(
        API.ENDPOINTS.FORUMS.POSTS.replace(":id", forumId)
      );
      if (response.ok) {
        const data = await response.json();
        setPosts(data.success ? data.data : data);
      } else {
        Alert.alert("Error", "No se pudieron cargar los posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Error de conexión");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
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

  const createPost = async () => {
    if (!createData.title.trim() || !createData.description.trim()) {
      Alert.alert("Error", "El título y la descripción son requeridos");
      return;
    }

    try {
      setCreating(true);

      // Preparar los datos del post
      const postData = {
        ...createData,
        links: links.filter((link) => link.trim() !== ""),
      };

      let response;

      // Si hay archivos, usar multipart/form-data
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("title", createData.title);
        formData.append("description", createData.description);
        formData.append("allowResponses", createData.allowResponses.toString());

        // Agregar links
        postData.links.forEach((link, index) => {
          formData.append(`links[${index}]`, link);
        });

        // Agregar archivos
        selectedFiles.forEach((file, index) => {
          formData.append("attachments", {
            uri: file.uri,
            type: file.mimeType || "application/octet-stream",
            name: file.name,
          });
        });

        response = await apiPostMultipart(
          API.ENDPOINTS.FORUMS.CREATE_POST.replace(":id", forumId),
          formData
        );
      } else {
        // Solo datos JSON
        response = await apiPost(
          API.ENDPOINTS.FORUMS.CREATE_POST.replace(":id", forumId),
          postData
        );
      }

      if (response.ok) {
        Alert.alert("Éxito", "Post creado correctamente");
        setShowCreateModal(false);
        resetCreateForm();
        fetchPosts();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "No se pudo crear el post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Error de conexión");
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setCreateData({
      title: "",
      description: "",
      allowResponses: true,
    });
    setSelectedFiles([]);
    setLinks([""]);
  };

  const openPost = (post) => {
    router.push(`/post/${post.id}`);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CB8D27" />
          <Text style={styles.loadingText}>Cargando posts...</Text>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{forum?.title || "Foro"}</Text>
          {forum?.category && (
            <Text style={styles.headerCategory}>{forum.category}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Posts List */}
      <ScrollView
        style={styles.postsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onPress={openPost} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No se encontraron posts con el término de búsqueda"
                : "No hay posts en este foro"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Crear Post</Text>
            <TouchableOpacity
              onPress={createPost}
              disabled={
                creating ||
                !createData.title.trim() ||
                !createData.description.trim()
              }
            >
              <Text
                style={[
                  styles.modalSaveButton,
                  (!createData.title.trim() ||
                    !createData.description.trim() ||
                    creating) &&
                    styles.modalSaveButtonDisabled,
                ]}
              >
                {creating ? "Creando..." : "Publicar"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Título del post"
                value={createData.title}
                onChangeText={(text) =>
                  setCreateData({ ...createData, title: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción del problema *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe tu problema o pregunta en detalle..."
                multiline
                numberOfLines={6}
                value={createData.description}
                onChangeText={(text) =>
                  setCreateData({ ...createData, description: text })
                }
              />
            </View>

            {/* Allow Responses Toggle */}
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={styles.toggleContainer}
                onPress={() =>
                  setCreateData({
                    ...createData,
                    allowResponses: !createData.allowResponses,
                  })
                }
              >
                <View style={styles.toggleInfo}>
                  <Text style={styles.inputLabel}>Permitir respuestas</Text>
                  <Text style={styles.toggleDescription}>
                    Los usuarios podrán responder a tu post
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggle,
                    createData.allowResponses && styles.toggleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      createData.allowResponses && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerCategory: {
    fontSize: 14,
    color: "#CB8D27",
    marginTop: 2,
  },
  createButton: {
    backgroundColor: "#CB8D27",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  postsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  postTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  closedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ff4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  closedText: {
    fontSize: 10,
    color: "#fff",
    marginLeft: 2,
    fontWeight: "500",
  },
  postDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  postStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
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
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#CB8D27",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
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

export default ForumDetail;
