import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API, buildApiUrl } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuraText } from "../../components/AuraText";

const NotebookPages = () => {
  const router = useRouter();
  const { notebookId } = useLocalSearchParams();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await fetch(
          buildApiUrl(`${API.ENDPOINTS.STUDENT.NOTES}/${notebookId}`),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        setPages(data);
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
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.pageImage} />
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AuraText text="Páginas del Cuaderno" style={styles.header} />
      <FlatList
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay páginas en este cuaderno.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#CB8D27",
    marginBottom: 16,
    textAlign: "center",
  },
  grid: {
    paddingBottom: 32,
  },
  pageItem: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 180,
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
