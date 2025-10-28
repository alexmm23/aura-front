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
import { useRouter } from "expo-router";
import { API } from "@/config/api";
import { AuraText } from "../../components/AuraText";
import { apiGet, apiPost } from "../../utils/fetchWithAuth";
import { ForumCard } from "../../components/forums/ForumCard";
import Head from "expo-router/head";
const ForumsScreen = () => {
  const router = useRouter();
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Estados para crear foro
  const [createData, setCreateData] = useState({
    title: "",
    description: "",
    category: "general",
    grade: "",
    subject: "",
    career: "",
  });
  const [creating, setCreating] = useState(false);

  const categories = [
    { value: "all", label: "Todos" },
    { value: "general", label: "General" },
    { value: "academico", label: "Académico" },
    { value: "proyecto", label: "Proyectos" },
    { value: "ayuda", label: "Ayuda" },
  ];

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      const response = await apiGet(API.ENDPOINTS.FORUMS.LIST);
      if (response.ok) {
        const data = await response.json();
        setForums(data.success ? data.data : data);
      } else {
        Alert.alert("Error", "No se pudieron cargar los foros");
      }
    } catch (error) {
      console.error("Error fetching forums:", error);
      Alert.alert("Error", "Error de conexión");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchForums();
  };

  const createForum = async () => {
    if (!createData.title.trim()) {
      Alert.alert("Error", "El título es requerido");
      return;
    }

    try {
      setCreating(true);
      const response = await apiPost(API.ENDPOINTS.FORUMS.CREATE, createData);

      if (response.ok) {
        Alert.alert("Éxito", "Foro creado correctamente");
        setShowCreateModal(false);
        setCreateData({
          title: "",
          description: "",
          category: "general",
          grade: "",
          subject: "",
          career: "",
        });
        fetchForums();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "No se pudo crear el foro");
      }
    } catch (error) {
      console.error("Error creating forum:", error);
      Alert.alert("Error", "Error de conexión");
    } finally {
      setCreating(false);
    }
  };

  const filteredForums = forums.filter((forum) => {
    const matchesSearch =
      forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forum.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || forum.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openForum = (forum) => {
    router.push(`/forum/${forum.id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CB8D27" />
          <Text style={styles.loadingText}>Cargando foros...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Head>
        <title>Foros - AURA | Plataforma Educativa</title>
        <meta
          name="description"
          content="Visualiza y gestiona todos los foros de discusión en un solo lugar. Participa en conversaciones relevantes y colabora con otros usuarios."
        />
        <meta name="keywords" content="foros, discusión, educación, AURA" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <AuraText text="Foros" style={styles.headerTitle} />
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar foros..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.value &&
                    styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.value)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.value &&
                      styles.categoryButtonTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Forums List */}
        <ScrollView
          style={styles.forumsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredForums.length > 0 ? (
            filteredForums.map((forum) => (
              <ForumCard key={forum.id} forum={forum} onPress={openForum} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory !== "all"
                  ? "No se encontraron foros con los filtros aplicados"
                  : "No hay foros disponibles"}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Create Forum Modal */}
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
              <Text style={styles.modalTitle}>Crear Foro</Text>
              <TouchableOpacity
                onPress={createForum}
                disabled={creating || !createData.title.trim()}
              >
                <Text
                  style={[
                    styles.modalSaveButton,
                    (!createData.title.trim() || creating) &&
                      styles.modalSaveButtonDisabled,
                  ]}
                >
                  {creating ? "Creando..." : "Crear"}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Título del foro"
                  value={createData.title}
                  onChangeText={(text) =>
                    setCreateData({ ...createData, title: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Descripción del foro"
                  multiline
                  numberOfLines={4}
                  value={createData.description}
                  onChangeText={(text) =>
                    setCreateData({ ...createData, description: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories
                    .filter((cat) => cat.value !== "all")
                    .map((category) => (
                      <TouchableOpacity
                        key={category.value}
                        style={[
                          styles.categorySelectButton,
                          createData.category === category.value &&
                            styles.categorySelectButtonActive,
                        ]}
                        onPress={() =>
                          setCreateData({
                            ...createData,
                            category: category.value,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.categorySelectText,
                            createData.category === category.value &&
                              styles.categorySelectTextActive,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Grado</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: 1er año, 2do semestre"
                  value={createData.grade}
                  onChangeText={(text) =>
                    setCreateData({ ...createData, grade: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Materia</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Matemáticas, Física"
                  value={createData.subject}
                  onChangeText={(text) =>
                    setCreateData({ ...createData, subject: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Carrera</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Ingeniería en Sistemas"
                  value={createData.career}
                  onChangeText={(text) =>
                    setCreateData({ ...createData, career: text })
                  }
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#CB8D27",
  },
  createButton: {
    backgroundColor: "#CB8D27",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#CB8D27",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  forumsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  forumCard: {
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
  forumHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  forumTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  forumTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#CB8D27",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  forumDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  forumMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#CB8D27",
    marginLeft: 4,
    fontWeight: "500",
  },
  forumStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
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
    height: 100,
    textAlignVertical: "top",
  },
  categorySelectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  categorySelectButtonActive: {
    backgroundColor: "#CB8D27",
    borderColor: "#CB8D27",
  },
  categorySelectText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categorySelectTextActive: {
    color: "#fff",
  },
});

export default ForumsScreen;
