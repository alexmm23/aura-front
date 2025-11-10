import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API } from "@/config/api";
import { AuraText } from "../../components/AuraText";
import { apiGet } from "../../utils/fetchWithAuth";

const NotebookPages = () => {
  const router = useRouter();
  const { notebookId, refresh } = useLocalSearchParams(); // ✅ Agregar refresh
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPages = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      
      console.log('📖 Fetching pages for notebook:', notebookId);
      console.log('🔗 Full endpoint:', `${API.ENDPOINTS.STUDENT.NOTEBOOK_PAGES}/${notebookId}`);
      
      const response = await apiGet(
        `${API.ENDPOINTS.STUDENT.NOTEBOOK_PAGES}/${notebookId}`
      );

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Error fetching pages';
        try {
          const errorData = await response.json();
          console.error('❌ Error data:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('❌ Could not parse error response');
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Response:', result);
      
      // El backend devuelve { success: true, data: [array de notas] }
      if (result.success && result.data) {
        console.log('✅ Notes found:', result.data.length);
        setPages(result.data);
      } else if (Array.isArray(result.data)) {
        console.log('✅ Notes found (array):', result.data.length);
        setPages(result.data);
      } else {
        console.log('⚠️ No notes found');
        setPages([]);
      }
    } catch (error) {
      console.error('❌ Error fetching pages:', error);
      console.error('❌ Error message:', error.message);
      Alert.alert('Error', `No se pudieron cargar las páginas: ${error.message}`);
      setPages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notebookId]);

  // Cargar al montar
  useEffect(() => {
    if (notebookId) {
      fetchPages();
    }
  }, [notebookId, fetchPages]);

  // ✅ Recargar cuando cambia el parámetro refresh
  useEffect(() => {
    if (refresh && notebookId) {
      console.log('🔄 Refresh triggered, reloading pages...');
      fetchPages(false);
    }
  }, [refresh, notebookId, fetchPages]);

  // Refrescar cuando vuelve a la pantalla
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, refreshing pages...');
      if (notebookId) {
        fetchPages(false);
      }
    }, [notebookId, fetchPages])
  );

  const handleRefresh = () => {
    fetchPages(false);
  };

  const renderPage = ({ item }) => {
    const noteId = item.id;
    const pageNumber = item.page_id;
    
    console.log("Page item:", { noteId, pageNumber, item });
    
    return (
      <TouchableOpacity
        style={styles.pageItem}
        onPress={() => {
          if (!noteId) {
            console.error("No se encontró ID de nota", item);
            Alert.alert("Error", "ID de nota no válido");
            return;
          }
          
          console.log("Navigating with noteId:", noteId);
          router.push({
            pathname: "/(tabs)/notebookview",
            params: { 
              pageId: String(noteId),
              notebookId: String(notebookId),
              timestamp: Date.now().toString() // ✅ Agregar timestamp para forzar re-render
            },
          });
        }}
      >
        {item.data ? (
          <Image source={{ uri: `${item.data}` }} style={styles.pageImage} />
        ) : (
          <Ionicons name="document-outline" size={48} color="#bbb" />
        )}
        <AuraText
          style={styles.pageTitle}
          text={item.title || `Página ${pageNumber || noteId || ""}`}
        />
      </TouchableOpacity>
    );
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
          <ActivityIndicator size="large" color="#28a745" />
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
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              router.push("/(tabs)/notebookscreen");
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#CB8D27" />
          </TouchableOpacity>

          {/* Título centrado (se queda con flex para centrar correctamente) */}
          <AuraText text="Páginas del Cuaderno" style={styles.header} />

          {/* Botón de recargar eliminado */}
        </View>
        <FlatList
          data={pages}
          renderItem={renderPage}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ right: 1 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No hay páginas en este cuaderno.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E6E2D2", // ✅ CAMBIO
  },
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2", // ✅ CAMBIO
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#CB8D27",
    flex: 1,
    textAlign: "center",
  },
  grid: {
    paddingBottom: Platform.OS === "android" ? 100 : 32,
    paddingHorizontal: 4,
  },
  pageItem: {
    flex: 1,
    margin: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 160,
    maxWidth: Platform.OS === "android" ? "47%" : undefined,
  },
  pageImage: {
    width: 80,
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 40,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NotebookPages;
