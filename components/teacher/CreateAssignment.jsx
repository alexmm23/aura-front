import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { AuraText } from "@/components/AuraText";
import { Colors } from "@/constants/Colors";
import { API, buildApiUrl } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

export const CreateAssignment = ({ classId, onAssignmentCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const colors = Colors.light;

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        buildApiUrl(`${API.ENDPOINTS.TEACHER.ASSIGNMENTS}/${classId}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            due_date: dueDate.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error creating assignment");
      }

      const data = await response.json();
      setTitle("");
      setDescription("");
      setDueDate(new Date());
      onAssignmentCreated(data);
    } catch (error) {
      console.error("Error creating assignment:", error);
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
        placeholder="Título de la tarea"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[
          styles.input,
          styles.description,
          { color: colors.text, borderColor: colors.border },
        ]}
        placeholder="Descripción de la tarea"
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Pressable
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <AuraText style={{ color: colors.text }}>
          Fecha de entrega: {dueDate.toLocaleDateString()}
        </AuraText>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}
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
          {isLoading ? "Creando..." : "Crear Tarea"}
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
  },
  description: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    padding: 12,
    marginBottom: 12,
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
