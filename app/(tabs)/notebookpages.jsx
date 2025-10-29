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
  const { notebookId } = useLocalSearchParams();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPages = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await apiGet(
        `${API.ENDPOINTS.STUDENT.NOTES}/${notebookId}`
      );
      
      if (!response.ok) {
        throw new Error(response.statusText || "Error fetching pages");
      }

      const data = await response.json();
      console.log("Pages fetched:", data.data?.length || 0);
      setPages(data.data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
      Alert.alert("Error", "No se pudieron cargar las páginas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notebookId]);

  // Cargar al montar
  useEffect(() => {
    if (notebookId) {
      fetchPages(true);
    }
  }, [notebookId, fetchPages]);

  // Refrescar cuando vuelve a la pantalla
  useFocusEffect(
    useCallback(() => {
      if (notebookId) {
        console.log("Screen focused, refreshing pages...");
        fetchPages(false); // Sin mostrar el loader completo
      }
    }, [notebookId, fetchPages])
  );

  const handleRefresh = () => {
    fetchPages(false);
  };

  const renderPage = ({ item }) => {
    // El backend espera el ID del registro, no el page_id
    const noteId = item.id; // Este es el ID de la base de datos
    const pageNumber = item.page_id; // Este es solo el número de página
    
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
              pageId: String(noteId), // Usamos el ID del registro
              notebookId: String(notebookId)
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
          <AuraText text="Páginas del Cuaderno" style={styles.header} />
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color={refreshing ? "#ccc" : "#CB8D27"} 
            />
          </TouchableOpacity>
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
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
