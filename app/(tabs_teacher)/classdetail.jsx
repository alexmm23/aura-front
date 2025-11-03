import { View, ScrollView, StyleSheet, Pressable, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { AuraText } from "@/components/AuraText";
import { API } from "@/config/api";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { apiGet, apiPost } from "../../utils/fetchWithAuth";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ClassDetail() {
  const [classData, setClassData] = useState(null);
  const [coursework, setCoursework] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { classId, className } = useLocalSearchParams();
  const colors = Colors.light;

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener detalles de la clase según la plataforma
      // Por ahora asumimos Google Classroom, pero se puede adaptar
      const [courseworkResponse, announcementsResponse] = await Promise.all([
        apiGet(API.ENDPOINTS.GOOGLE_CLASSROOM.COURSEWORK(classId)),
        apiGet(API.ENDPOINTS.GOOGLE_CLASSROOM.ANNOUNCEMENTS(classId)),
      ]);

      if (courseworkResponse.ok) {
        const courseworkResult = await courseworkResponse.json();
        if (courseworkResult.success && courseworkResult.data?.courseWork) {
          setCoursework(courseworkResult.data.courseWork);
        }
      }

      if (announcementsResponse.ok) {
        const announcementsResult = await announcementsResponse.json();
        if (
          announcementsResult.success &&
          announcementsResult.data?.announcements
        ) {
          setAnnouncements(announcementsResult.data.announcements);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching class details:", error);
      setError("No se pudieron cargar los detalles de la clase.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCreateAssignment = () => {
    // TODO: Implementar creación de tarea
    console.log("Creating new assignment for class:", classId);
  };

  const handleCreateAnnouncement = () => {
    // TODO: Implementar creación de anuncio
    console.log("Creating new announcement for class:", classId);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AuraText style={styles.loadingText}>
            Cargando detalles de la clase...
          </AuraText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AuraText style={styles.errorText}>{error}</AuraText>
          <Pressable style={styles.retryButton} onPress={fetchClassDetails}>
            <AuraText style={styles.retryButtonText}>
              Intentar de nuevo
            </AuraText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.headerContent}>
            <AuraText style={styles.className}>{className || "Clase"}</AuraText>
            <AuraText style={styles.classId}>ID: {classId}</AuraText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={handleCreateAssignment}
          >
            <MaterialIcons name="assignment" size={24} color="#FFF" />
            <AuraText style={styles.actionButtonText}>Nueva Tarea</AuraText>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={handleCreateAnnouncement}
          >
            <MaterialIcons name="announcement" size={24} color="#FFF" />
            <AuraText style={styles.actionButtonText}>Nuevo Anuncio</AuraText>
          </Pressable>
        </View>

        {/* Announcements Section */}
        <View style={styles.section}>
          <AuraText style={styles.sectionTitle}>
            📢 Anuncios ({announcements.length})
          </AuraText>
          {announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <AuraText style={styles.emptyText}>No hay anuncios</AuraText>
            </View>
          ) : (
            announcements.map((announcement) => (
              <View key={announcement.id} style={styles.announcementCard}>
                <AuraText style={styles.announcementText}>
                  {announcement.text || "Anuncio sin contenido"}
                </AuraText>
                <AuraText style={styles.announcementDate}>
                  {formatDate(announcement.creationTime)}
                </AuraText>
              </View>
            ))
          )}
        </View>

        {/* Coursework Section */}
        <View style={styles.section}>
          <AuraText style={styles.sectionTitle}>
            📚 Tareas ({coursework.length})
          </AuraText>
          {coursework.length === 0 ? (
            <View style={styles.emptyState}>
              <AuraText style={styles.emptyText}>No hay tareas</AuraText>
            </View>
          ) : (
            coursework.map((assignment) => (
              <View key={assignment.id} style={styles.assignmentCard}>
                <View style={styles.assignmentHeader}>
                  <AuraText style={styles.assignmentTitle}>
                    {assignment.title || "Tarea sin título"}
                  </AuraText>
                  <View style={styles.assignmentMeta}>
                    <AuraText style={styles.assignmentState}>
                      {assignment.state || "PUBLISHED"}
                    </AuraText>
                  </View>
                </View>
                {assignment.description && (
                  <AuraText style={styles.assignmentDescription}>
                    {assignment.description}
                  </AuraText>
                )}
                {assignment.dueDate && (
                  <AuraText style={styles.assignmentDueDate}>
                    Vence:{" "}
                    {formatDate(
                      new Date(
                        assignment.dueDate.year,
                        assignment.dueDate.month - 1,
                        assignment.dueDate.day
                      ).toISOString()
                    )}
                  </AuraText>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#E53E3E",
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  className: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  classId: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  announcementCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  announcementText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: "#666",
  },
  assignmentCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  assignmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  assignmentMeta: {
    alignItems: "flex-end",
  },
  assignmentState: {
    fontSize: 12,
    color: "#4285F4",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  assignmentDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  assignmentDueDate: {
    fontSize: 12,
    color: "#E53E3E",
    fontWeight: "500",
  },
});
