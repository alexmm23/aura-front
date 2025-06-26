import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotebookCanvas from "../../components/notebook/NotebookCanvas";

const NotebookScreen = () => {
  const [notes, setNotes] = useState([]);
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

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

  const handleNoteSaved = () => {
    loadNotes();
    setShowCanvas(false);
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Cuaderno</Text>
        <TouchableOpacity
          style={styles.newNoteButton}
          onPress={() => setShowCanvas(true)}
        >
          <Text style={styles.newNoteText}>+ Nueva Nota</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.notesList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
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
  noteDate: {
    marginTop: 8,
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
  },
});

export default NotebookScreen;
