import { View, StyleSheet, TextInput, Pressable, Platform } from "react-native";
import { useState } from "react";
import { AuraText } from "@/components/AuraText";
import { Colors } from "@/constants/Colors";
import { API, buildApiUrl } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { apiPost } from "../../utils/fetchWithAuth";

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
      const response = await apiPost(
        API.ENDPOINTS.GOOGLE_CLASSROOM.COURSEWORK(classId),
        {
          title,
          description,
          dueDate: dueDate.toISOString(),
          maxPoints: 100, // Default value for assignments
          workType: "ASSIGNMENT",
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

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS !== "web") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleWebDateChange = (event) => {
    const newDate = new Date(event.target.value);
    if (!isNaN(newDate.getTime())) {
      setDueDate(newDate);
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
          <AuraText style={styles.className}>Hello world</AuraText>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Título de la tarea */}
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <MaterialIcons name="assignment" size={20} color="#FF9800" />
              <AuraText style={styles.inputLabel}>Título de tarea</AuraText>
            </View>
            <TextInput
              style={styles.titleInput}
              placeholder="Título de tarea"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
            <AuraText style={styles.dateLabel}>
              Fecha y hora de entrega
            </AuraText>
            {Platform.OS === "web" ? (
              <input
                type="datetime-local"
                value={formatDateForInput(dueDate)}
                onChange={handleWebDateChange}
                style={{
                  backgroundColor: "#E8E8E8",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 16,
                  color: "#333",
                  marginBottom: 8,
                  border: "none",
                  width: "100%",
                  fontFamily: "inherit",
                }}
              />
            ) : (
              <Pressable onPress={() => setShowDatePicker(true)}>
                <AuraText style={styles.titleInput}>
                  {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
                </AuraText>
              </Pressable>
            )}
          </View>

          {/* Descripción */}
          <View style={styles.inputContainer}>
            <AuraText style={styles.inputLabel}>Descripción</AuraText>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Descripción de la tarea"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
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
                {isLoading ? "Creando..." : "Crear"}
              </AuraText>
            </Pressable>
          </View>
        </View>

        {/* Date picker - Solo para móvil */}
        {showDatePicker && Platform.OS !== "web" && (
          <DateTimePicker
            value={dueDate}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
          />
        )}
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
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: "#999",
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
