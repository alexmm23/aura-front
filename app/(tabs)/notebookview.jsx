import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
  Modal,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { API } from "@/config/api";
import { AuraText } from "../../components/AuraText";
import { apiGet, apiDelete } from "../../utils/fetchWithAuth";

const NotebookView = () => {
  const router = useRouter();
  const { pageId, notebookId } = useLocalSearchParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // ✅ Nuevo estado
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    setShowMenu(false);
    setDownloading(false);
    setDeleting(false);
  }, [pageId]);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        console.log("Fetching page with ID:", pageId);
        console.log(
          "Full endpoint:",
          `${API.ENDPOINTS.STUDENT.NOTE_SHOW}/${pageId}`
        );

        const response = await apiGet(
          `${API.ENDPOINTS.STUDENT.NOTE_SHOW}/${pageId}`
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(response.statusText || "Error fetching page");
        }

        const result = await response.json();
        console.log("Page response:", result);

        if (result.success && result.data) {
          const pageData = Array.isArray(result.data)
            ? result.data[0]
            : result.data;
          setPage(pageData);
        } else {
          throw new Error("No se encontraron datos de la página");
        }
      } catch (error) {
        console.error("Error fetching page:", error);
        console.error("Error details:", {
          message: error.message,
          pageId,
          endpoint: `${API.ENDPOINTS.STUDENT.NOTE_SHOW}/${pageId}`,
        });
        Alert.alert("Error", `No se pudo cargar la página: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (pageId) fetchPage();
  }, [pageId]);

  const handleDownload = async () => {
    if (!page?.data) {
      Alert.alert("Error", "No hay imagen para descargar");
      return;
    }

    try {
      setDownloading(true);
      setShowMenu(false);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permisos", "Se necesitan permisos para guardar la imagen");
        return;
      }

      // Crear nombre de archivo único
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const pageIdentifier = page.page_id || page.id || "unknown";
      const filename = `aura-page-${pageIdentifier}-${timestamp}.png`;
      const outputFile = new File(Paths.document, filename);

      // Extraer datos base64 de la imagen
      const base64Data = page.data.replace(/^data:image\/[^;]+;base64,/, "");

      // Guardar archivo temporalmente usando la nueva API
      outputFile.write(base64Data, { encoding: "base64" });

      // Guardar en la galería
      const asset = await MediaLibrary.createAssetAsync(outputFile.uri);
      await MediaLibrary.createAlbumAsync("AURA", asset, false);

      Alert.alert("Éxito", "Imagen guardada en la galería");
    } catch (error) {
      console.error("Error downloading:", error);
      Alert.alert("Error", "No se pudo descargar la imagen");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!page?.data) {
      Alert.alert("Error", "No hay imagen para compartir");
      return;
    }

    try {
      setShowMenu(false);

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const pageIdentifier = page.page_id || page.id || "unknown";
      const filename = `aura-page-${pageIdentifier}-${timestamp}.png`;
      const outputFile = new File(Paths.document, filename);

      // Extraer datos base64 de la imagen
      const base64Data = page.data.replace(/^data:image\/[^;]+;base64,/, "");

      // Guardar archivo temporalmente
      outputFile.write(base64Data, { encoding: "base64" });

      // Compartir usando el menú nativo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(outputFile.uri, {
          mimeType: "image/png",
          dialogTitle: "Compartir página de cuaderno",
        });
      } else {
        Alert.alert("Error", "La función de compartir no está disponible");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "No se pudo compartir la imagen");
    }
  };

  const downloadForWeb = () => {
    if (!page?.data || Platform.OS !== "web") return;

    try {
      setShowMenu(false);

      // Crear elemento de descarga para web
      const pageIdentifier = page.page_id || page.id || "unknown";
      const timestamp = new Date().toISOString().slice(0, 10);
      const link = document.createElement("a");
      link.href = page.data;
      link.download = `aura-page-${pageIdentifier}-${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading on web:", error);
      Alert.alert("Error", "No se pudo descargar la imagen");
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);

    // ✅ Para web, usar modal personalizado en lugar de Alert
    if (Platform.OS === "web") {
      setShowDeleteConfirm(true);
      return;
    }

    // Para móvil, usar Alert nativo
    Alert.alert(
      "Eliminar Nota",
      "¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => executeDelete(),
        },
      ]
    );
  };

  // ✅ Función separada para ejecutar la eliminación
  const executeDelete = async () => {
    try {
      setDeleting(true);
      setShowDeleteConfirm(false);

      console.log("🗑️ Eliminando nota con ID:", pageId);
      console.log(
        "🔗 Endpoint completo:",
        `${API.ENDPOINTS.STUDENT.NOTE_DELETE}/${pageId}`
      );

      const response = await apiDelete(
        `${API.ENDPOINTS.STUDENT.NOTE_DELETE}/${pageId}`
      );

      console.log("📊 Response status:", response.status);

      if (response.ok) {
        try {
          const result = await response.json();
          console.log("✅ Nota eliminada:", result);
        } catch (parseError) {
          console.log("✅ Nota eliminada (sin respuesta JSON)");
        }

        // ✅ Mostrar mensaje de éxito según plataforma
        if (Platform.OS === "web") {
          // Para web, navegar directamente
          router.replace({
            pathname: "/(tabs)/notebookpages",
            params: {
              notebookId,
              refresh: Date.now().toString(),
            },
          });
        } else {
          // Para móvil, mostrar Alert
          Alert.alert("Éxito", "Nota eliminada correctamente", [
            {
              text: "OK",
              onPress: () => {
                router.replace({
                  pathname: "/(tabs)/notebookpages",
                  params: {
                    notebookId,
                    refresh: Date.now().toString(),
                  },
                });
              },
            },
          ]);
        }
      } else {
        let errorMessage = "Error al eliminar la nota";
        try {
          const errorData = await response.json();
          console.error("❌ Error response:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("❌ Error status:", response.status);
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Error deleting note:", error);

      // ✅ Mostrar error según plataforma
      if (Platform.OS === "web") {
        alert(`Error: ${error.message || "No se pudo eliminar la nota"}`);
      } else {
        Alert.alert("Error", error.message || "No se pudo eliminar la nota");
      }
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#E6E2D2" // ✅ CAMBIO
          translucent={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CB8D27" />
          <Text style={styles.loadingText}>Cargando página...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!page) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#E6E2D2" // ✅ CAMBIO
          translucent={false}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#CB8D27" />
          <Text style={styles.errorText}>No se pudo cargar la página</Text>
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
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#E6E2D2" // ✅ CAMBIO
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#CB8D27" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <AuraText
            text={`Página ${page?.page_id || page?.id || ""}`}
            style={styles.headerTitle}
          />
          {page?.created_at && (
            <Text style={styles.headerDate}>
              {new Date(page.created_at).toLocaleDateString("es-ES")}
            </Text>
          )}
          {page?.type && (
            <Text style={styles.headerType}>Tipo: {page.type}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowMenu(true)}
          disabled={deleting}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#CB8D27" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {page?.data ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: page.data }}
              style={[
                styles.pageImage,
                {
                  width: screenWidth - 32,
                  height: (screenWidth - 32) * 1.4, // Ratio típico de una página
                  maxHeight: screenHeight - 200,
                },
              ]}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="document-outline" size={128} color="#bbb" />
            <Text style={styles.noImageText}>Sin contenido visual</Text>
          </View>
        )}
      </View>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Opciones</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={Platform.OS === "web" ? downloadForWeb : handleDownload}
              disabled={downloading}
            >
              <Ionicons name="download-outline" size={24} color="#CB8D27" />
              <Text style={styles.menuItemText}>
                {downloading ? "Descargando..." : "Descargar"}
              </Text>
            </TouchableOpacity>

            {/* Solo mostrar compartir en móvil */}
            {Platform.OS !== "web" && (
              <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#CB8D27" />
                <Text style={styles.menuItemText}>Compartir</Text>
              </TouchableOpacity>
            )}

            {/* Opción de eliminar */}
            <TouchableOpacity
              style={[styles.menuItem, styles.deleteMenuItem]}
              onPress={handleDelete}
              disabled={deleting}
            >
              <Ionicons name="trash-outline" size={24} color="#DC3545" />
              <Text style={[styles.menuItemText, styles.deleteText]}>
                {deleting ? "Eliminando..." : "Eliminar Nota"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ✅ Modal de confirmación de eliminación para web */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmContainer}>
            <View style={styles.confirmHeader}>
              <Ionicons name="warning-outline" size={48} color="#DC3545" />
              <Text style={styles.confirmTitle}>Eliminar Nota</Text>
            </View>

            <Text style={styles.confirmMessage}>
              ¿Estás seguro de que deseas eliminar esta nota? Esta acción no se
              puede deshacer.
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={executeDelete}
                disabled={deleting}
              >
                <Text style={styles.deleteButtonText}>
                  {deleting ? "Eliminando..." : "Eliminar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E6E2D2", // ✅ CAMBIO
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA", // ✅ CAMBIO
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "center",
  },
  headerDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  headerType: {
    fontSize: 11,
    color: "#888",
    marginTop: 1,
    fontStyle: "italic",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pageImage: {
    borderRadius: 8,
    backgroundColor: "#E6E2D2",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  noImageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 0,
    minWidth: 250,
    maxWidth: 300,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  deleteMenuItem: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: "#DC3545",
    fontWeight: "600",
  },
  // ✅ Nuevos estilos para el modal de confirmación
  confirmContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    minWidth: 320,
    maxWidth: 400,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  confirmHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  confirmMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E5E5",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#DC3545",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NotebookView;
