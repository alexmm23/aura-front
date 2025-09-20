import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await apiGet(
          `${API.ENDPOINTS.STUDENT.NOTES}/${notebookId}`
        );
        if (!response.ok) {
          throw new Error(response.statusText || "Error fetching pages");
        }

        const data = await response.json();
        console.log(data);

        setPages(data.data);
      } catch (error) {
        console.error("Error fetching pages:", error);
      } finally {
        setLoading(false);
      }
    };
    if (notebookId) fetchPages();
  }, [notebookId]);

  const renderPage = ({ item }) => (
    <TouchableOpacity
      style={styles.pageItem}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/notebookView",
          params: { pageId: item.id },
        })
      }
    >
      {item.data ? (
        <Image source={{ uri: `${item.data}` }} style={styles.pageImage} />
      ) : (
        <Ionicons name="document-outline" size={48} color="#bbb" />
      )}
      <AuraText
        style={styles.pageTitle}
        text={item.title || `Página ${item.page_number || ""}`}
      />
    </TouchableOpacity>
  );

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
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#CB8D27" />
          </TouchableOpacity>
          <AuraText text="Páginas del Cuaderno" style={styles.header} />
          <View style={styles.spacer} />
        </View>
        <FlatList
          data={pages}
          renderItem={renderPage}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ right: 1 }}
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
  spacer: {
    width: 40, // Same width as the back button to center the title
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
