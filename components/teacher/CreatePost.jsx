import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useMemo, useState } from "react";
import { AuraText } from "@/components/AuraText";
import { API } from "@/config/api";
import { CustomDateTimePicker } from "@/components/CustomDateTimePicker";
import { apiPost } from "../../utils/fetchWithAuth";
import { MaterialIcons } from "@expo/vector-icons";

export const CreatePost = ({
  classId,
  onPostCreated,
  source = "classroom",
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const initial = new Date();
    initial.setHours(initial.getHours() + 1, 0, 0, 0);
    return initial;
  });
  const [isLoading, setIsLoading] = useState(false);
  const isMoodle = source === "moodle";

  const formattedDueDate = useMemo(() => {
    if (!dueDate) return "Sin fecha";
    return dueDate.toLocaleString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [dueDate]);

  const handleDateChange = (event, selectedDate) => {
    if (event?.type === "dismissed" || !selectedDate) {
      return;
    }

    const updated = new Date(dueDate);
    updated.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    setDueDate(updated);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (event?.type === "dismissed" || !selectedTime) {
      return;
    }

    const updated = new Date(dueDate);
    updated.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    setDueDate(updated);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    const reset = new Date();
    reset.setHours(reset.getHours() + 1, 0, 0, 0);
    setDueDate(reset);
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (isMoodle) {
      if (!trimmedTitle || !trimmedDescription) {
        console.warn("⚠️ Moodle assignment requires título y descripción");
        return;
      }
      if (dueDate.getTime() <= Date.now()) {
        console.warn("⚠️ La fecha de entrega debe ser en el futuro");
        return;
      }
    } else if (!trimmedTitle && !trimmedDescription) {
      console.warn("⚠️ Debes ingresar un título o descripción para el anuncio");
      return;
    }

    setIsLoading(true);

    try {
      if (isMoodle) {
        const payload = {
          nombre: trimmedTitle,
          descripcion: trimmedDescription,
          duedate: dueDate.getTime(),
        };

        const response = await apiPost(
          API.ENDPOINTS.TEACHER.MOODLE_COURSEWORK(classId),
          payload
        );

        if (!response.ok) {
          throw new Error("Error creating Moodle assignment");
        }

        const data = await response.json();
        resetForm();
        onPostCreated?.(data);
      } else {
        const text = [trimmedTitle, trimmedDescription]
          .filter(Boolean)
          .join("\n\n");

        const response = await apiPost(
          API.ENDPOINTS.GOOGLE_CLASSROOM.ANNOUNCEMENTS(classId),
          { text }
        );

        if (!response.ok) {
          throw new Error("Error creating announcement");
        }

        const data = await response.json();
        resetForm();
        onPostCreated?.(data);
      }
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
          <AuraText style={styles.className}>
            {isMoodle ? "Crear tarea en Moodle" : "Publicar anuncio"}
          </AuraText>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Título del post */}
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <MaterialIcons
                name={isMoodle ? "assignment" : "post-add"}
                size={20}
                color="#FF9800"
              />
              <AuraText style={styles.inputLabel}>
                {isMoodle ? "Nueva Tarea" : "Nuevo Anuncio"}
              </AuraText>
            </View>
            <TextInput
              style={styles.titleInput}
              placeholder={
                isMoodle ? "Título de la tarea" : "Título del anuncio"
              }
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Contenido */}
          <View style={styles.inputContainer}>
            <AuraText style={styles.inputLabel}>
              {isMoodle ? "Descripción" : "Contenido"}
            </AuraText>
            <TextInput
              style={styles.descriptionInput}
              placeholder={
                isMoodle
                  ? "Describe la tarea y agrega instrucciones..."
                  : "Escribe el contenido del anuncio..."
              }
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {isMoodle && (
            <View style={styles.inputContainer}>
              <AuraText style={styles.inputLabel}>Fecha de entrega</AuraText>
              <View style={styles.datePickers}>
                <View style={styles.datePicker}>
                  <CustomDateTimePicker
                    value={dueDate}
                    mode="date"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                </View>
                <View style={styles.datePicker}>
                  <CustomDateTimePicker
                    value={dueDate}
                    mode="time"
                    onChange={handleTimeChange}
                  />
                </View>
              </View>
              <AuraText style={styles.dueDatePreview}>
                Entrega: {formattedDueDate}
              </AuraText>
            </View>
          )}

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.attachButton}>
              <MaterialIcons name="attach-file" size={24} color="#FF9800" />
            </Pressable>
            <Pressable
              style={[
                styles.createButton,
                isLoading && styles.createButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <AuraText style={styles.createButtonText}>
                {isMoodle
                  ? isLoading
                    ? "Creando..."
                    : "Crear tarea"
                  : isLoading
                  ? "Publicando..."
                  : "Publicar"}
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
  datePickers: {
    flexDirection: "row",
    gap: 12,
  },
  datePicker: {
    flex: 1,
  },
  dueDatePreview: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
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
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
