import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  useWindowDimensions,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import NotebookCanvas from "../../components/notebook/NotebookCanvas";
import FloatingAIMenu from "../../components/FloatingAIMenu";
import { AuraText } from "../../components/AuraText";
import { API, buildApiUrl } from "@/config/api";

const NotebookScreen = () => {
  const [notes, setNotes] = useState([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [noteBooks, setNoteBooks] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState("");
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 928;

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await fetchNotes();
        console.log("Fetched notes:", response);
        setNoteBooks(response);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    loadNotes();
  }, []);

  useEffect(() => {
    console.log("Modal state changed:", showCreateDialog);
  }, [showCreateDialog]);

  const fetchNotes = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const response = await fetch(buildApiUrl(API.ENDPOINTS.STUDENT.NOTEBOOKS), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    return await response.json();
  };

  const loadNotes = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const notebookKeys = keys.filter((key) => key.startsWith("notebook_"));
      const notesData = await AsyncStorage.multiGet(notebookKeys);

      const parsedNotes = notesData.map(([key, value]) => ({
        id: key,
        timestamp: parseInt(key.replace("notebook_", "")),
        data: value,
      }));

      setNotes(parsedNotes.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const handleShare = async () => {
    try {
      // Use the last PNG dataURL
      const dataUrl = lastPngDataUrl || (notes[0] && notes[0].data);
      if (!dataUrl) {
        alert("No hay notas para compartir.");
        return;
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [400, 600],
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, 400, 600);
      pdf.save(`nota-${Date.now()}.pdf`);
    } catch (error) {
      alert("Error al compartir PDF");
    }
  };

  const handleNoteSaved = (dataUrl) => {
    // Save the note as before (if needed)
    loadNotes();
    setShowCanvas(false);

    // Optionally, store the last PNG for sharing
    setLastPngDataUrl(dataUrl);
  };

  const handleCreateNotebook = async () => {
    if (!notebookTitle.trim()) {
      Alert.alert("Error", "Por favor ingresa un título para el cuaderno");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        buildApiUrl(API.ENDPOINTS.STUDENT.NOTEBOOK_CREATE),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: notebookTitle.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el cuaderno");
      }

      const newNotebook = await response.json();
      console.log("Nuevo cuaderno creado:", newNotebook);

      // Actualizar la lista de cuadernos
      setNoteBooks((prev) => [newNotebook, ...prev]);

      // Limpiar el formulario y cerrar el diálogo
      setNotebookTitle("");
      setShowCreateDialog(false);

      Alert.alert("Éxito", "Cuaderno creado exitosamente");
    } catch (error) {
      console.error("Error creating notebook:", error);
      Alert.alert("Error", "No se pudo crear el cuaderno");
    }
  };

  const handleCancelCreate = () => {
    console.log("Cerrando modal");
    setNotebookTitle("");
    setShowCreateDialog(false);
  };

  const [lastPngDataUrl, setLastPngDataUrl] = useState(null);

  const renderNote = ({ item }) => (
    <TouchableOpacity style={styles.noteItem}>
      <Image source={{ uri: item.data }} style={styles.notePreview} />
      <Text style={styles.noteDate}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (showCanvas) {
    return (
      <NotebookCanvas
        onSave={handleNoteSaved}
        onBack={() => setShowCanvas(false)}
      />
    );
  }

  if (isLargeScreen) {
    return (
      <View style={responsiveStyles.landscapeContainer}>
        <Image
          source={require("../../assets/images/fondonotas.png")}
          style={responsiveStyles.landscapeImage}
          resizeMode="contain"
          pointerEvents="none"
        />

        <View style={responsiveStyles.contentWrapper}>
          <View style={responsiveStyles.header}>
            <AuraText text={"Mis Cuadernos"} style={responsiveStyles.title} />
            <View style={responsiveStyles.headerButtons}>
              <TouchableOpacity
                style={responsiveStyles.createNotebookButton}
                onPress={() => {
                  console.log("Abriendo modal crear cuaderno");
                  setShowCreateDialog(true);
                }}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <AuraText
                  text={"Crear Cuaderno"}
                  style={responsiveStyles.createButtonText}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={responsiveStyles.newNoteButton}
                onPress={() => setShowCanvas(true)}
              >
                <AuraText
                  text={"+ Nueva Nota"}
                  style={responsiveStyles.newNoteText}
                />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={noteBooks}
            renderItem={renderNote}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={responsiveStyles.notesList}
            showsVerticalScrollIndicator={false}
          />

          {/* Add the share button here */}
          <TouchableOpacity
            style={styles.floatingHelpButton}
            onPress={handleShare}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 24 }}>
              ⇪
            </Text>
          </TouchableOpacity>

          <FloatingAIMenu />
        </View>

        {/* Modal para crear cuaderno - Layout Landscape */}
        <Modal
          visible={showCreateDialog}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancelCreate}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Crear Nuevo Cuaderno</Text>

              <TextInput
                style={styles.titleInput}
                placeholder="Título del cuaderno"
                value={notebookTitle}
                onChangeText={setNotebookTitle}
                autoFocus
                maxLength={50}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancelCreate}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleCreateNotebook}
                >
                  <Text style={styles.createButtonText}>Crear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Portrait / mobile layout
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/fondonotas.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
        pointerEvents="none"
      />
      <View style={styles.header}>
        <AuraText text={"Mis Cuadernos"} style={styles.title} />
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.createNotebookButton}
            onPress={() => {
              console.log("Abriendo modal crear cuaderno - Portrait");
              setShowCreateDialog(true);
            }}
          >
            <Ionicons name="add-circle" size={16} color="#fff" />
            <AuraText text={"Crear"} style={styles.createButtonText} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.newNoteButton}
            onPress={() => setShowCanvas(true)}
          >
            <AuraText text={"+ Nota"} style={styles.newNoteText} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.notesList}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.floatingHelpButton} onPress={handleShare}>
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 24 }}>
          ⇪
        </Text>
      </TouchableOpacity>
      <FloatingAIMenu />

      {/* Modal para crear cuaderno */}
      <Modal
        visible={showCreateDialog}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelCreate}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Nuevo Cuaderno</Text>

            <TextInput
              style={styles.titleInput}
              placeholder="Título del cuaderno"
              value={notebookTitle}
              onChangeText={setNotebookTitle}
              autoFocus
              maxLength={50}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelCreate}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateNotebook}
              >
                <Text style={styles.createButtonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
    position: "relative",
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 48,
    marginLeft: 24,
    marginRight: 24,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#CB8D27",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  createNotebookButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#28a745",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  newNoteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007bff",
    borderRadius: 6,
  },
  newNoteText: {
    color: "#fff",
    fontWeight: "600",
  },
  notesList: {
    padding: 16,
  },
  noteItem: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notePreview: {
    width: "100%",
    height: 120,
    borderRadius: 4,
    backgroundColor: "#f8f9fa",
  },
  floatingHelpButton: {
    position: "absolute",
    bottom: 90, // Just above the AI menu
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#28a745",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },
  noteDate: {
    marginTop: 8,
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#28a745",
  },
});

const responsiveStyles = StyleSheet.create({
  landscapeContainer: {
    flex: 1,
    backgroundColor: "#E6E2D2",
    alignItems: "center",
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
  rightSide: {
    flex: 1,
    padding: 40,
    alignItems: "center",
    backgroundColor: "transparent",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 24,
    marginLeft: 24,
    marginRight: 24,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    width: "100%",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  createNotebookButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#28a745",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#CB8D27",
  },
  newNoteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007bff",
    borderRadius: 6,
  },
  newNoteText: {
    color: "#fff",
    fontWeight: "600",
  },
  notesList: {
    padding: 16,
    width: "100%",
  },
  contentWrapper: {
    width: "90%",
    marginLeft: "5%",
    marginRight: "5%",
    flex: 1,
  },
});

export default NotebookScreen;
