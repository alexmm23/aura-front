import { View, StyleSheet, Pressable, Image } from "react-native";
import { AuraText } from "@/components/AuraText";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";

export const ClassCard = ({ classData, onPress, upcomingAssignments = [] }) => {
  const colors = Colors.light;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.background },
        pressed && styles.cardPressed,
      ]}
    >
      {/* Ícono de Google Classroom centrado */}
      <View style={styles.iconContainer}>
        <MaterialIcons name="class" size={48} color="#4285F4" />
      </View>

      {/* Nombre de la clase centrado */}
      <View style={styles.titleContainer}>
        <AuraText style={[styles.className, { color: colors.text }]}>
          {classData.name}
        </AuraText>
        <AuraText
          style={[styles.classSection, { color: colors.textSecondary }]}
        >
          {classData.section ? `Sección ${classData.section}` : "Sin sección"}
        </AuraText>
      </View>

      {/* Código de clase */}
      <View style={styles.codeContainer}>
        <AuraText style={[styles.classCode, { color: colors.textSecondary }]}>
          {classData.enrollmentCode}
        </AuraText>
      </View>

      {/* Tareas próximas */}
      <View style={styles.assignmentsContainer}>
        <AuraText style={[styles.assignmentsTitle, { color: colors.text }]}>
          Tareas próximas
        </AuraText>
        {upcomingAssignments && upcomingAssignments.length > 0 ? (
          upcomingAssignments.slice(0, 3).map((assignment, index) => (
            <Pressable
              key={assignment.id || index}
              style={styles.assignmentLink}
              onPress={() => {
                /* Navigate to assignment */
              }}
            >
              <AuraText style={[styles.assignmentText, { color: "#4285F4" }]}>
                • {assignment.title}
              </AuraText>
              {assignment.dueDate && (
                <AuraText
                  style={[styles.dueDateText, { color: colors.textSecondary }]}
                >
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </AuraText>
              )}
            </Pressable>
          ))
        ) : (
          <AuraText
            style={[styles.noAssignments, { color: colors.textSecondary }]}
          >
            No hay tareas próximas
          </AuraText>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignItems: "center",
    minHeight: 280,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#E8F0FE",
    borderRadius: 50,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  className: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  classSection: {
    fontSize: 14,
    textAlign: "center",
  },
  codeContainer: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  classCode: {
    fontSize: 12,
    fontWeight: "500",
  },
  assignmentsContainer: {
    width: "100%",
    alignItems: "center",
  },
  assignmentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  assignmentLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 6,
    backgroundColor: "#F8F9FA",
    width: "100%",
    alignItems: "center",
  },
  assignmentText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  dueDateText: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  noAssignments: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
});
