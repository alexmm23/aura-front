import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export const ClassCard = ({ classItem, width }) => {
  // Determinar el estilo según el ancho de la pantalla
  const getCardStyle = () => {
    if (width >= 1200) return styles.classCardLarge;
    if (width >= 768) return styles.classCardMedium;
    return styles.classCardSmall;
  };

  return (
    <View style={[styles.classCard, getCardStyle()]}>
      <View style={styles.classContent}>
        <Text style={styles.className}>
          {classItem.name || "Sin nombre"}
        </Text>
        <View style={styles.divider} />
        <View style={styles.classInfo}>
          <Text style={styles.classPeriod}>
            {classItem.descriptionHeading || "Sin período"}
          </Text>
          <Text style={styles.teacherName}>
            {classItem.teacher || classItem.ownerId || "Sin profesor"}
          </Text>
        </View>
      </View>
      <Image
        source={
          classItem.platform === "teams" || classItem.source === "teams"
            ? require("../../assets/images/teams.png")
            : require("../../assets/images/classroom.png")
        }
        style={styles.platformIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  classCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // 3 columnas en pantallas grandes (>= 1200px)
  classCardLarge: {
    width: "31.5%",
    minWidth: 300,
  },
  // 2 columnas en pantallas medianas (768px - 1199px)
  classCardMedium: {
    width: "48%",
    minWidth: 280,
  },
  // 1 columna en pantallas pequeñas (< 768px)
  classCardSmall: {
    width: "100%",
  },
  classContent: {
    flex: 1,
    paddingRight: 10,
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
    backgroundColor: "#ccc",
    marginVertical: 3,
  },
});
