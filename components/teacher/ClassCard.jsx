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

  const textStyles = StyleSheet.create({
    baseText: {
      color: colors.text,
    },
    secondaryText: {
      color: colors.textSecondary,
    },
  });

  return (
    <Pressable onPress={handlePress}>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <AuraText
            style={StyleSheet.compose(styles.className, textStyles.baseText)}
          >
            {classData.name}
          </AuraText>
          <AuraText
            style={StyleSheet.compose(
              styles.classCode,
              textStyles.secondaryText
            )}
          >
            Código: {classData.enrollmentCode}
          </AuraText>
        </View>
        <View style={styles.info}>
          <AuraText
            style={StyleSheet.compose(
              styles.infoText,
              textStyles.secondaryText
            )}
          >
            Sección: {classData.section || "N/A"}
          </AuraText>
          <AuraText
            style={StyleSheet.compose(
              styles.infoText,
              textStyles.secondaryText
            )}
          >
            Sala: {classData.room || "N/A"}
          </AuraText>
          <AuraText
            style={StyleSheet.compose(styles.status, {
              color:
                classData.courseState === "ACTIVE"
                  ? colors.success
                  : colors.textSecondary,
            })}
          >
            {classData.courseState === "ACTIVE" ? "Activo" : "Inactivo"}
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
  status: {
    marginTop: 4,
    fontWeight: "bold",
    fontSize: 12,
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
