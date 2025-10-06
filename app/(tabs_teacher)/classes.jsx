import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AuraText } from "@/components/AuraText";
import { API, buildApiUrl } from "@/config/api";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ClassCard } from "@/components/teacher/ClassCard";
import { CreatePost } from "@/components/teacher/CreatePost";
import { CreateAssignment } from "@/components/teacher/CreateAssignment";
import { Ionicons } from "@expo/vector-icons";

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const { width } = useWindowDimensions();
  const colors = Colors.light;

  const fetchClasses = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(buildApiUrl(API.ENDPOINTS.TEACHER.CLASSES), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Classes data:", data);
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handlePostCreated = (newPost) => {
    // Actualizar la lista de posts en la clase seleccionada
    if (selectedClass) {
      setClasses(
        classes.map((c) =>
          c.id === selectedClass.id
            ? { ...c, posts: [newPost, ...(c.posts || [])] }
            : c
        )
      );
    }
  };

  const handleAssignmentCreated = (newAssignment) => {
    // Actualizar la lista de tareas en la clase seleccionada
    if (selectedClass) {
      setClasses(
        classes.map((c) =>
          c.id === selectedClass.id
            ? { ...c, assignments: [newAssignment, ...(c.assignments || [])] }
            : c
        )
      );
    }
  };

  const renderClassDetail = () => (
    <View style={styles.selectedClassContainer}>
      <View style={styles.classHeader}>
        <Pressable
          onPress={() => setSelectedClass(null)}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <AuraText style={styles.selectedClassTitle}>
          {selectedClass.name}
        </AuraText>
      </View>

      <CreatePost
        classId={selectedClass.id}
        onPostCreated={handlePostCreated}
      />

      <CreateAssignment
        classId={selectedClass.id}
        onAssignmentCreated={handleAssignmentCreated}
      />

      {selectedClass.posts && selectedClass.posts.length > 0 && (
        <View style={styles.section}>
          <AuraText style={styles.sectionTitle}>
            Publicaciones Recientes
          </AuraText>
          {selectedClass.posts.map((post) => (
            <View key={post.id} style={styles.post}>
              <AuraText>{post.content}</AuraText>
            </View>
          ))}
        </View>
      )}

      {selectedClass.assignments && selectedClass.assignments.length > 0 && (
        <View style={styles.section}>
          <AuraText style={styles.sectionTitle}>Tareas</AuraText>
          {selectedClass.assignments.map((assignment) => (
            <View key={assignment.id} style={styles.assignment}>
              <AuraText style={styles.assignmentTitle}>
                {assignment.title}
              </AuraText>
              <AuraText>{assignment.description}</AuraText>
              <AuraText style={styles.dueDate}>
                Entrega: {new Date(assignment.due_date).toLocaleDateString()}
              </AuraText>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderClassList = () => (
    <>
      <View style={styles.header}>
        <AuraText style={styles.title}>Mis Clases</AuraText>
      </View>
      <View style={styles.classesGrid}>
        {classes.map((classData) => (
          <ClassCard
            key={classData.id}
            classData={classData}
            onPress={() => setSelectedClass(classData)}
          />
        ))}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedClass ? renderClassDetail() : renderClassList()}
      </ScrollView>
    </SafeAreaView>
  );
}

const LandscapeHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainerLandscape}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="-200 -210 560 670"
      style={styles.svg}
    >
      <Path
        d="M255.625 387.801C209.254 181.192 -160.246 23.1376 82.0284 -31.2381C324.303 -85.6138 756.693 147.292 499.715 406.644C292.867 538.783 474.159 720.291 259.299 690.506C56.814 617.548 301.996 594.41 255.625 387.801Z"
        fill="#CDAEC4"
        fillOpacity={0.67}
        transform="scale(0.4) translate(180, -50)" // Ajustado para posicionar en la esquina superior derecha
      />
    </Svg>
  </View>
);

const PortraitHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 500 500"
      style={styles.svg}
    >
      <Path
        d="M255.625 387.801C209.254 181.192 -160.246 23.1376 82.0284 -31.2381C324.303 -85.6138 756.693 147.292 499.715 406.644C292.867 538.783 474.159 720.291 259.299 690.506C56.814 617.548 301.996 594.41 255.625 387.801Z"
        fill="#CDAEC4"
        fillOpacity={0.67}
        transform="scale(0.7) translate(100, -50)" // Ajusta escala y posición
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  scrollView: {
    flex: 1,
    marginTop: 10, // Añadir algo de margen para separar del header
  },
  contentContainer: {
    padding: 300,
    paddingTop: 50, // Reducido de 120 para ajustar al nuevo tamaño del header
  },
  card: {
    width: "100%",
    marginBottom: 30,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 1,
  },
  headerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "left",
  },
  noteCard: {
    backgroundColor: "#E4E3DD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  noteTitle: {
    fontWeight: "bold",
    color: "#A64AC9",
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E4E3DD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  taskSubject: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#E91E63",
  },
  taskDescription: {
    fontSize: 14,
    color: "#555",
  },
  taskDueDate: {
    fontSize: 12,
    color: "#999",
  },
  navbar: {
    flexDirection: "row",
    backgroundColor: "#9C27B0",
    paddingVertical: 10,
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 2,
  },
  // Estilos para modo vertical
  backgroundContainer: {
    height: 250, // Más pequeño que antes (era 350)
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: "hidden", // Importante para que no se desborde
  },
  // Estilos para modo horizontal
  backgroundContainerLandscape: {
    position: "absolute",
    //marginRight:250,
    top: 0,
    right: 0, // Cambiado de left a right
    width: "80%", // Ancho relativo
    height: "90%", // Alto relativo
    zIndex: 0,
    overflow: "hidden",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 350, // igual que el contenedor
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40, //mas espacio arriba
  },
  headerContentLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 30, // mas espacio al rededor
  },
  platformIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  titleLandscape: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "left",
    marginLeft: 200, // Más margen en modo landscape
  },
  classCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,

    flexDirection: "row", // pone los elementos en fila
    justifyContent: "space-between", // separa texto e imagen
    alignItems: "center", // alinea verticalmente
  },
  classContent: {
    flex: 1, // ocupa el espacio restante
    paddingRight: 10, // espacio entre texto e imagen (opcional)
  },
  className: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A44076",
    marginBottom: 10,
  },
  classInfo: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  classPeriod: {
    fontSize: 14,
    color: "#1E1E1E",
    paddingBottom: 15,
    paddingTop: 5,
  },
  teacherName: {
    fontSize: 14,
    color: "#1E1E1E",
    fontStyle: "italic",
  },
  platformIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc", // gris claro
    marginVertical: 3, // espacio arriba y abajo de la línea
  },
});
