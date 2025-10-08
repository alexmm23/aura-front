import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { AuraText } from "@/components/AuraText";
import { Colors } from "@/constants/Colors";
import { API, buildApiUrl } from "@/config/api";
import { apiGet, apiPost } from "../../utils/fetchWithAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export const CreatePost = ({ classId, onPostCreated }) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const colors = Colors.light;

  const handleSubmit = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await apiPost(
        API.ENDPOINTS.GOOGLE_CLASSROOM.ANNOUNCEMENTS(classId),
        { text: content }
      );

      if (!response.ok) {
        throw new Error("Error creating post");
      }

      const data = await response.json();
      setContent("");
      onPostCreated(data);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Header de la clase con imagen decorativa */}
        <View style={styles.classHeader}>
          <View style={styles.booksContainer}>
            <MaterialIcons name="auto-stories" size={24} color="#4CAF50" />
            <MaterialIcons name="book" size={28} color="#2196F3" />
            <MaterialIcons name="menu-book" size={24} color="#FF9800" />
            <MaterialIcons name="school" size={26} color="#9C27B0" />
            <MaterialIcons name="local-florist" size={22} color="#4CAF50" />
          </View>
          <AuraText style={styles.className}>Análisis de Datos</AuraText>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Título del post */}
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <MaterialIcons name="post-add" size={20} color="#FF9800" />
              <AuraText style={styles.inputLabel}>Nuevo Anuncio</AuraText>
            </View>
            <TextInput
              style={styles.titleInput}
              placeholder="Título del anuncio"
              placeholderTextColor="#999"
              value={content.split("\n")[0]}
              onChangeText={(text) => {
                const lines = content.split("\n");
                lines[0] = text;
                setContent(lines.join("\n"));
              }}
            />
          </View>

          {/* Contenido */}
          <View style={styles.inputContainer}>
            <AuraText style={styles.inputLabel}>Contenido</AuraText>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Escribe el contenido del anuncio..."
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.attachButton}>
              <MaterialIcons name="attach-file" size={24} color="#FF9800" />
            </Pressable>
            <Pressable
              style={styles.createButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <AuraText style={styles.createButtonText}>
                {isLoading ? "Publicando..." : "Publicar"}
              </AuraText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 350,
    overflow: "hidden",
  },
  classHeader: {
    backgroundColor: "#9BB5E8",
    padding: 20,
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  booksContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 8,
  },
  className: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "center",
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  titleInput: {
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  descriptionInput: {
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#333",
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  attachButton: {
    width: 50,
    height: 50,
    backgroundColor: "#FFF3E0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    backgroundColor: "#B85DB8",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    marginLeft: 15,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
