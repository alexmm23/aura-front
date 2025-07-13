import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotebookCanvas from "../../components/notebook/NotebookCanvas";
import FloatingAIMenu from "../../components/FloatingAIMenu";
import { AuraText } from "../../components/AuraText";

const NotebookScreen = () => {
  const [notes, setNotes] = useState([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 928;

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

  // --- Responsive layouts ---
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
            <AuraText text={"Mis Notas"} style={responsiveStyles.title} />
            <TouchableOpacity
              style={responsiveStyles.newNoteButton}
              onPress={() => setShowCanvas(true)}
            >
              <AuraText text={"+ Nueva Nota"} style={responsiveStyles.newNoteText} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={notes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={responsiveStyles.notesList}
            showsVerticalScrollIndicator={false}
          />

          <FloatingAIMenu />
        </View>
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
        <AuraText text={"Mis Notas"} style={styles.title} />
        <TouchableOpacity
          style={styles.newNoteButton}
          onPress={() => setShowCanvas(true)}
        >
          <AuraText text={"+ Nueva Nota"} style={styles.newNoteText} />
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
      <FloatingAIMenu />
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
    transform: [
      { rotate: "-45deg" },
      { scale: 1.5 }
    ],
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
