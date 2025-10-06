import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { AuraText } from "@/components/AuraText";
import { Colors } from "@/constants/Colors";
import { API, buildApiUrl } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CreatePost = ({ classId, onPostCreated }) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const colors = Colors.light;

  const handleSubmit = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        buildApiUrl(`${API.ENDPOINTS.TEACHER.POSTS}/${classId}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.border },
        ]}
        placeholder="Escribe una publicación..."
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={setContent}
        multiline
      />
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <AuraText style={[styles.buttonText, { color: colors.white }]}>
          {isLoading ? "Publicando..." : "Publicar"}
        </AuraText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontWeight: "bold",
  },
});
