import { View, StyleSheet, Pressable } from "react-native";
import { AuraText } from "@/components/AuraText";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

export const ClassCard = ({ classData }) => {
  const router = useRouter();
  const colors = Colors.light;

  const handlePress = () => {
    router.push(`/class/${classData.id}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <AuraText style={[styles.className, { color: colors.text }]}>
            {classData.name}
          </AuraText>
          <AuraText style={[styles.classCode, { color: colors.textSecondary }]}>
            Código: {classData.code}
          </AuraText>
        </View>
        <View style={styles.info}>
          <AuraText style={[styles.infoText, { color: colors.textSecondary }]}>
            {classData.students_count} estudiantes
          </AuraText>
          <AuraText style={[styles.infoText, { color: colors.textSecondary }]}>
            {classData.assignments_count} tareas
          </AuraText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: "bold",
  },
  classCode: {
    fontSize: 14,
    marginTop: 4,
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
  },
});
