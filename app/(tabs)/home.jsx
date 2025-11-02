import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { AuraText } from "@/components/AuraText";
import { apiGet } from "../../utils/fetchWithAuth";
import { API } from "../../config/api";
import Head from "expo-router/head";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const [homework, setHomework] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLoadingHomework, setIsLoadingHomework] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const { height, width } = useWindowDimensions();
  const colors = Colors.light;
  const isLandscape = width > height;
  const router = useRouter();

  const fetchHomework = async () => {
    try {
      setIsLoadingHomework(true);
      const response = await apiGet(API.ENDPOINTS.STUDENT.HOMEWORK);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Homework data:", data);
      setHomework(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching homework:", error);
    } finally {
      setIsLoadingHomework(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const response = await apiGet(API.ENDPOINTS.STUDENT.NOTES);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const { data: newNotes } = data;
      console.log("Notes data:", newNotes);
      setNotes(newNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchHomework();
    fetchNotes();
  }, []);

  // Refrescar notas y tareas cada vez que la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 HomeScreen obtuvo el foco - Refrescando datos...");
      fetchNotes();
      fetchHomework();
    }, [])
  );

  return (
    <>
      <Head>
        <title>Inicio - AURA </title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          {/* Header con SVG */}
          {isLandscape ? (
            <LandscapeHeader colors={colors} styles={styles} />
          ) : (
            <PortraitHeader colors={colors} styles={styles} />
          )}

          {/* Contenido scrollable */}
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            style={styles.scrollView}
          >
            {/* Mis notas */}
            <View style={styles.card}>
              <AuraText style={styles.title} text="Mis Notas"></AuraText>
              {isLoadingNotes ? (
                <>
                  <NoteCardSkeleton />
                  <NoteCardSkeleton />
                </>
              ) : (
                <>
                  {notes.map((note, index) => (
                    <View key={index} style={styles.noteCard}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <AuraText
                          style={styles.noteTitle}
                          text={`Nota #${index + 1}`}
                        ></AuraText>
                      </View>
                      <Image
                        source={{ uri: note.data }}
                        style={styles.noteImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}

                  {notes.length === 0 && (
                    <View style={styles.noteCard}>
                      <AuraText
                        style={styles.noteTitle}
                        text={"No hay notas por mostrar"}
                      ></AuraText>
                      <AuraText
                        style={styles.noteText}
                        text={"No hay contenido disponible"}
                      ></AuraText>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Mis Tareas */}
            <View style={styles.card}>
              <AuraText style={styles.title} text="Mis Tareas"></AuraText>
              {isLoadingHomework ? (
                <>
                  <TaskCardSkeleton />
                  <TaskCardSkeleton />
                  <TaskCardSkeleton />
                </>
              ) : (
                homework.map((task, index) => (
                  <TouchableOpacity
                    key={task.id || index}
                    style={styles.taskCard}
                    onPress={() => {
                      //task.id contiene el id_courseid_courseworkid
                      const { id } = task;
                      const [platform, courseId, courseWorkId, submissionId] =
                        id.split("_");
                      router.push({
                        pathname: "/taskdetails",
                        params: {
                          courseId: courseId,
                          courseWorkId: courseWorkId,
                          submissionId: submissionId,
                          platform: platform,
                        },
                      });
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.taskSubject}>{task.courseName}</Text>
                      <Text style={styles.taskDescription}>{task.title}</Text>
                      <Text style={styles.taskDueDate}>
                        {task.dueDate
                          ? "Fecha límite: " +
                            new Date(task.dueDate).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Sin fecha"}
                      </Text>
                    </View>
                    <Image
                      source={getPlatformIcon(task.source)}
                      style={styles.platformIcon}
                    />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

const LandscapeHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainerLandscape}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
      style={styles.svg}
    >
      <Path
        d="M378.433 23.1915C10.4329 96.1914 276.5 123 113 264C14.4172 264 -55.5672 389.527 -55.5672 296.191C-55.5672 202.855 -287.15 -61.8085 -188.567 -61.8085C-89.9844 -61.8085 378.433 -70.1446 378.433 23.1915Z"
        fill={"#D1A8D2"}
      />
    </Svg>
  </View>
);

const PortraitHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 349 371"
      style={styles.svg}
    >
      <Path
        d="M378.433 23.1915C10.4329 96.1914 276.5 123 113 264C14.4172 264 -55.5672 389.527 -55.5672 296.191C-55.5672 202.855 -287.15 -61.8085 -188.567 -61.8085C-89.9844 -61.8085 378.433 -70.1446 378.433 23.1915Z"
        fill={"#D1A8D2"}
      />
    </Svg>
  </View>
);

const getPlatformIcon = (platform) => {
  const icons = {
    classroom: require("@/assets/images/classroom.png"),
    moodle: require("@/assets/images/moodle.png"),
    teams: require("@/assets/images/teams.png"),
  };
  return icons[platform?.toLowerCase()] || icons.classroom; // fallback to classroom if platform is unknown
};

// Componente de skeleton loader con animación
const TaskCardSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.taskCard, { opacity: fadeAnim }]}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        <View style={[styles.skeletonLine, styles.skeletonLineSmall]} />
      </View>
      <View style={styles.skeletonIcon} />
    </Animated.View>
  );
};

// Componente de skeleton loader para notas
const NoteCardSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.noteCard, { opacity: fadeAnim }]}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
    </Animated.View>
  );
};

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
    padding: 20,
    paddingTop: 120, // Dar espacio al header para que no tape el contenido
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9900",
    marginBottom: 10,
  },
  noteCard: {
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
  noteTitle: {
    fontWeight: "bold",
    color: "#A64AC9",
    marginBottom: 5,
  },
  noteImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#d0d0d0",
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
    height: 350, // o 400 si quieres más altura
    width: "100%",
    position: "absolute", // <-- posición absoluta
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1, // <-- para que esté detrás del contenido
  },
  // Estilos para modo horizontal
  backgroundContainerLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "40%",
    height: "100%",
    zIndex: -1, // <-- también para que esté detrás
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
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  emptyStateText: {
    color: "#999",
    fontSize: 16,
  },
  // Estilos para skeleton loader
  skeletonLine: {
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 8,
    width: "100%",
  },
  skeletonLineShort: {
    width: "70%",
  },
  skeletonLineSmall: {
    width: "50%",
    height: 12,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
});
