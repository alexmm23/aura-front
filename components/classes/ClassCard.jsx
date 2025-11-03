import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export const ClassCard = ({ classItem, width }) => {
  const router = useRouter();

  // Determinar el estilo según el ancho de la pantalla
  const getCardStyle = () => {
    if (width >= 1200) return styles.classCardLarge;
    if (width >= 768) return styles.classCardMedium;
    return styles.classCardSmall;
  };

  // Función para obtener el icono de la plataforma
  const getPlatformIcon = () => {
    const source = classItem.source || classItem.platform;
    switch (source) {
      case "moodle":
        return require("../../assets/images/moodle.png");
      case "teams":
        return require("../../assets/images/teams.png");
      case "classroom":
      default:
        return require("../../assets/images/classroom.png");
    }
  };

  // Función para formatear la información de la clase según la plataforma
  const getClassInfo = () => {
    if (classItem.source === "moodle") {
      return {
        period: classItem.section || "Sin sección",
        teacher: "Curso Moodle",
        description: classItem.description || "Sin descripción",
      };
    } else {
      // Formato Google Classroom
      return {
        period: classItem.descriptionHeading || "Sin período",
        teacher: classItem.teacher || classItem.ownerId || "Sin profesor",
        description: classItem.description || "",
      };
    }
  };

  // ✅ Manejar clic en la card - ACTUALIZADO
  const handlePress = () => {
    console.log("📚 Navegando a clase:", {
      name: classItem.name,
      id: classItem.id,
      source: classItem.source,
    });

    router.push({
      pathname: "/(tabs)/class-content",
      params: {
        classId: classItem.id, // Ya tiene el formato correcto (con o sin prefijo)
        className: classItem.name,
        classColor: classItem.color || "#A44076",
        platform: classItem.source || "classroom",
      },
    });
  };

  const classInfo = getClassInfo();

  return (
    <TouchableOpacity
      style={[styles.classCard, getCardStyle()]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.classContent}>
        <Text style={styles.className}>{classItem.name || "Sin nombre"}</Text>
        <View style={styles.divider} />
        <View style={styles.classInfo}>
          <Text style={styles.classPeriod}>{classInfo.period}</Text>
          <Text style={styles.teacherName}>{classInfo.teacher}</Text>
          {classInfo.description && (
            <Text style={styles.classDescription} numberOfLines={2}>
              {classInfo.description}
            </Text>
          )}
        </View>
      </View>
      <Image source={getPlatformIcon()} style={styles.platformIcon} />
    </TouchableOpacity>
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
  classDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
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
