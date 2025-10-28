import React from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { NotebookItem } from "./NotebookItem";
import { NotebookHeader } from "./NotebookHeader";
import FloatingAIMenu from "@/components/FloatingAIMenu";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export const NotebookListView = ({
  notebooks,
  isLargeScreen,
  onNotebookPress,
  onNotebookLongPress,
  onCreatePress,
  onNewNotePress,
  onSharePress,
  onAIOptionPress,
  lastPngDataUrl,
  hasActiveSubscription = false,
  checkingSubscription = false
}) => {
  const handleShare = async () => {
    try {
      const dataUrl = lastPngDataUrl;
      if (!dataUrl) {
        alert("No hay notas para compartir.");
        return;
      }

      const filename = `nota-${Date.now()}.png`;
      const path = `${FileSystem.documentDirectory}${filename}`;
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

      await FileSystem.writeAsStringAsync(path, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: "image/png",
          dialogTitle: "Compartir nota",
        });
      } else {
        alert("La función de compartir no está disponible en este dispositivo");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
      alert("Error al compartir nota: " + error.message);
    }
  };

  const containerStyle = isLargeScreen
    ? styles.landscapeContainer
    : styles.container;

  const contentWrapperStyle = isLargeScreen ? styles.contentWrapper : null;

  return (
    <View style={containerStyle}>
      {/* Fondo decorativo con overlay */}
      <View style={styles.backgroundOverlay}>
        <Image
          source={require("@/assets/images/fondonotas.png")}
          style={isLargeScreen ? styles.landscapeImage : styles.backgroundImage}
          resizeMode="contain"
          pointerEvents="none"
        />
      </View>

      <View style={contentWrapperStyle}>
        <NotebookHeader
          onCreatePress={onCreatePress}
          onNewNotePress={onNewNotePress}
          isLargeScreen={isLargeScreen}
        />

        {/* Contenedor con estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="book" size={24} color="#4A90E2" />
            <Text style={styles.statNumber}>{notebooks.length}</Text>
            <Text style={styles.statLabel}>Cuadernos</Text>
          </View>
        </View>

        <FlatList
          key={isLargeScreen ? "large-6" : "small-3"}
          data={notebooks}
          renderItem={({ item }) => (
            <NotebookItem
              notebook={item}
              onPress={onNotebookPress}
              onLongPress={onNotebookLongPress}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={isLargeScreen ? 6 : 3}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>No tienes cuadernos aún</Text>
              <Text style={styles.emptySubtext}>
                Crea tu primer cuaderno para comenzar
              </Text>
            </View>
          }
        />
      </View>

      {/* Botones flotantes con diseño mejorado */}
      <TouchableOpacity 
        style={[styles.floatingButton, styles.shareButton]} 
        onPress={handleShare}
        activeOpacity={0.8}
      >
        <Ionicons name="share-social" size={24} color="#fff" />
      </TouchableOpacity>

      

      {/* FloatingAIMenu - Solo mostrar si tiene suscripción activa */}
      {!checkingSubscription && hasActiveSubscription && onAIOptionPress && (
        <FloatingAIMenu onAIOptionPress={onAIOptionPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
    position: "relative",
  },
  landscapeContainer: {
    flex: 1,
    backgroundColor: "#E6E2D2",
    alignItems: "center",
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    opacity: 0.6,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    transform: [{ rotate: "-45deg" }, { scale: 1.5 }],
  },
  landscapeImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "90%",
    height: "100%",
    marginLeft: "5%",
    zIndex: 0,
  },
  contentWrapper: {
    width: "100%",
    flex: 1,
    zIndex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 4,
    fontWeight: "500",
  },
  notesList: {
    padding: 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "space-evenly",
    gap: 8,
    paddingHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#95a5a6",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#bdc3c7",
    marginTop: 8,
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9998,
  },
  shareButton: {
    backgroundColor: "#28a745",
  },
  aiButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
