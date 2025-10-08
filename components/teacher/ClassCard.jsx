import { View, StyleSheet, Pressable } from "react-native";
import { AuraText } from "@/components/AuraText";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";

export const ClassCard = ({ classData, onPress, upcomingAssignments = [] }) => {
  const colors = Colors.light;

  // Array of different background colors for the icons
  const iconColors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336"];

  // Get a color based on the class id or name
  const getIconColor = (id) => {
    const hash = id ? id.length : 0;
    return iconColors[hash % iconColors.length];
  };

  // Get the teacher name from different possible fields
  const getTeacherName = () => {
    if (classData.teacherName) return classData.teacherName;
    if (classData.teachers && classData.teachers.length > 0) {
      return classData.teachers[0].profile?.name?.fullName || "Profesor";
    }
    return "Dr. José López"; // Default fallback
  };

  // Get the period information
  const getPeriod = () => {
    if (classData.period) return classData.period;
    // Default period format
    return "Febrero-Junio 2025";
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardContent}>
        {/* Class Information */}
        <View style={styles.classInfo}>
          <AuraText style={styles.className}>
            {classData.name || "Clase sin nombre"}
          </AuraText>
          <AuraText style={styles.classPeriod}>{getPeriod()}</AuraText>
          <AuraText style={styles.teacherName}>{getTeacherName()}</AuraText>
        </View>

        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getIconColor(classData.id) },
          ]}
        >
          <MaterialIcons name="school" size={32} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  classInfo: {
    flex: 1,
    paddingRight: 15,
  },
  className: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A44076",
    marginBottom: 8,
    lineHeight: 22,
  },
  classPeriod: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  teacherName: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
