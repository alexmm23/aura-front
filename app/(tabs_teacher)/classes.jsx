import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  Pressable,
  Text,
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
import { apiGet, apiPost } from "../../utils/fetchWithAuth";
import Svg, { Path } from "react-native-svg";
import TeacherClassModal from "@/components/teacher/TeacherClassModal";

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const { width } = useWindowDimensions();
  const colors = Colors.light;

  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClassForModal, setSelectedClassForModal] = useState(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching classes from Google Classroom...");
      const response = await apiGet(API.ENDPOINTS.GOOGLE_CLASSROOM.COURSES);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📚 Classes response:", result);

      if (result.success && result.data?.courses) {
        console.log(`✅ Found ${result.data.courses.length} courses`);

        // Para cada clase, obtener las tareas próximas de forma paralela
        const classesWithAssignments = await Promise.all(
          result.data.courses.map(async (classData) => {
            try {
              const assignmentsResponse = await apiGet(
                API.ENDPOINTS.GOOGLE_CLASSROOM.COURSEWORK(classData.id)
              );

              if (assignmentsResponse.ok) {
                const assignmentsResult = await assignmentsResponse.json();
                const courseWork =
                  assignmentsResult.success &&
                  assignmentsResult.data?.courseWork
                    ? assignmentsResult.data.courseWork
                    : [];

                // Filtrar tareas próximas (próximos 7 días) y con fecha de vencimiento
                const today = new Date();
                const nextWeek = new Date(
                  today.getTime() + 7 * 24 * 60 * 60 * 1000
                );

                const upcoming = courseWork
                  .filter((assignment) => {
                    if (!assignment.dueDate) return false;

                    // Construir fecha de vencimiento desde el objeto de Google Classroom
                    const dueDate = new Date(
                      assignment.dueDate.year,
                      assignment.dueDate.month - 1, // Los meses en JS son 0-indexados
                      assignment.dueDate.day
                    );

                    return dueDate >= today && dueDate <= nextWeek;
                  })
                  .slice(0, 3) // Solo las primeras 3
                  .map((assignment) => ({
                    id: assignment.id,
                    title: assignment.title,
                    dueDate: assignment.dueDate
                      ? new Date(
                          assignment.dueDate.year,
                          assignment.dueDate.month - 1,
                          assignment.dueDate.day
                        ).toISOString()
                      : null,
                  }));

                return {
                  ...classData,
                  upcomingAssignments: upcoming,
                };
              } else {
                console.warn(
                  `⚠️ Could not fetch assignments for course ${classData.id}`
                );
              }
            } catch (error) {
              console.error(
                `❌ Error fetching assignments for class ${classData.id}:`,
                error
              );
            }

            return {
              ...classData,
              upcomingAssignments: [],
            };
          })
        );

        setClasses(classesWithAssignments);
      } else {
        console.warn("⚠️ No courses found or invalid response structure");
        setClasses([]);
      }
    } catch (error) {
      console.error("❌ Error fetching classes:", error);
      setError(
        "No se pudieron cargar las clases. Verifica tu conexión a Google Classroom."
      );
      setClasses([]);
    } finally {
      setLoading(false);
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

  const fetchCourseDetails = async (courseId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const [detailsResponse, announcementsResponse, courseworkResponse] =
        await Promise.all([
          apiGet(API.ENDPOINTS.GOOGLE_CLASSROOM.COURSE_DETAILS(courseId)),
          apiGet(API.ENDPOINTS.GOOGLE_CLASSROOM.ANNOUNCEMENTS(courseId)),
          apiGet(API.ENDPOINTS.GOOGLE_CLASSROOM.COURSEWORK(courseId)),
        ]);

      if (
        !detailsResponse.ok ||
        !announcementsResponse.ok ||
        !courseworkResponse.ok
      ) {
        throw new Error("Error fetching course details");
      }

      const [details, announcements, coursework] = await Promise.all([
        detailsResponse.json(),
        announcementsResponse.json(),
        courseworkResponse.json(),
      ]);

      setSelectedClass({
        ...details,
        posts: announcements,
        assignments: coursework,
      });
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const handleClassSelect = (classData) => {
    setSelectedClassForModal(classData);
    setShowClassModal(true);
  };

  const handleCloseModal = () => {
    setShowClassModal(false);
    setSelectedClassForModal(null);
  };


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

  const renderClassList = () => {
    return (
      <>
        <View style={styles.header}>
          <AuraText style={styles.title}>Mis Clases</AuraText>
        </View>

        {/* Estado de carga */}
        {loading && !refreshing && (
          <View style={styles.loadingState}>
            <View style={styles.loadingSpinner}>
              <AuraText style={styles.loadingText}>🔄</AuraText>
            </View>
            <AuraText style={styles.loadingText}>
              Cargando clases de Google Classroom...
            </AuraText>
          </View>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <View style={styles.errorState}>
            <AuraText style={styles.errorTitle}>⚠️ Error al cargar</AuraText>
            <AuraText style={styles.errorText}>{error}</AuraText>
            <Pressable style={styles.retryButton} onPress={fetchClasses}>
              <AuraText style={styles.retryButtonText}>
                Intentar de nuevo
              </AuraText>
            </Pressable>
          </View>
        )}

        {/* Lista de clases */}
        {!loading && !error && (
          <View style={styles.classesGrid}>
            {classes.length === 0 ? (
              <View style={styles.emptyState}>
                <AuraText style={styles.emptyTitle}>📚 No hay clases</AuraText>
                <AuraText style={styles.emptyText}>
                  No se encontraron clases en tu cuenta de Google Classroom.
                </AuraText>
                <AuraText style={styles.emptySubtext}>
                  Asegúrate de tener clases creadas en Google Classroom.
                </AuraText>
              </View>
            ) : (
              <>
                <View style={styles.classesHeader}>
                  <AuraText style={styles.classesCount}>
                    {classes.length} {classes.length === 1 ? "clase" : "clases"}{" "}
                    encontradas
                  </AuraText>
                </View>
                {classes.map((classData) => {
                  console.log("📚 Rendering class card for:", classData.name);
                  return (
                    <ClassCard
                      key={classData.id}
                      classData={classData}
                      upcomingAssignments={classData.upcomingAssignments || []}
                      onPress={() => handleClassSelect(classData)}
                    />
                  );
                })}
              </>
            )}
          </View>
        )}
      </>
    );
  };

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

      {/* Modal para opciones de clase */}
      <TeacherClassModal
        visible={showClassModal}
        onClose={handleCloseModal}
        classData={selectedClassForModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  selectedClassContainer: {
    flex: 1,
    padding: 16,
  },
  classHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  selectedClassTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  post: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  assignment: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "flex-start",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 10,
  },
  classesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
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
  // Nuevos estilos para estados de carga y error
  loadingState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E53E3E",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#C53030",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  classesHeader: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  classesCount: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
});
