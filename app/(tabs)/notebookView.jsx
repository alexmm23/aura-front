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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { API } from "@/config/api";
import { AuraText } from "../../components/AuraText";
import { apiGet } from "../../utils/fetchWithAuth";

const NotebookView = () => {
  const router = useRouter();
  const { pageId } = useLocalSearchParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    const fetchPage = async () => {
      try {
        // Usar el endpoint de notes con el pageId como parámetro
        const response = await apiGet(
          `${API.ENDPOINTS.STUDENT.NOTE_SHOW}/${pageId}`
        );
        if (!response.ok) {
          throw new Error(response.statusText || "Error fetching page");
        }

        const result = await response.json();
        console.log("Page response:", result);

        // Verificar si la respuesta es exitosa y tiene datos
        if (result.success && result.data) {
          // Si data es un array, tomar el primer elemento, sino usar data directamente
          const pageData = Array.isArray(result.data)
            ? result.data[0]
            : result.data;
          setPage(pageData);
        } else {
          throw new Error("No se encontraron datos de la página");
        }
      } catch (error) {
        console.error("Error fetching page:", error);
        Alert.alert("Error", "No se pudo cargar la página");
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

      // Solicitar permisos para guardar en la galería
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permisos", "Se necesitan permisos para guardar la imagen");
        return;
      }

      // Crear nombre de archivo único
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const pageIdentifier = page.page_id || page.id || "unknown";
      const filename = `aura-page-${pageIdentifier}-${timestamp}.png`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Extraer datos base64 de la imagen
      const base64Data = page.data.replace(/^data:image\/[^;]+;base64,/, "");

      // Guardar archivo temporalmente usando la API legacy
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: "base64",
      });

      // Guardar en la galería
      const asset = await MediaLibrary.createAssetAsync(fileUri);
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
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Extraer datos base64 de la imagen
      const base64Data = page.data.replace(/^data:image\/[^;]+;base64,/, "");

      // Guardar archivo temporalmente
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: "base64",
      });

      // Compartir usando el menú nativo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
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

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F8F9FA"
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
          backgroundColor="#F8F9FA"
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
        backgroundColor="#F8F9FA"
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
            text={`Página ${page.page_id || page.id || ""}`}
            style={styles.headerTitle}
          />
          {page.created_at && (
            <Text style={styles.headerDate}>
              {new Date(page.created_at).toLocaleDateString("es-ES")}
            </Text>
          )}
          {page.type && (
            <Text style={styles.headerType}>Tipo: {page.type}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowMenu(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#CB8D27" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {page.data ? (
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
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
    backgroundColor: "#F8F9FA",
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
    backgroundColor: "#fff",
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
});

export default NotebookView;
