import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AuraText } from "@/components/AuraText";
import { API, buildApiUrl } from "@/config/api";
import Head from "expo-router/head";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/Colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet } from "../../utils/fetchWithAuth";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

export default function HomeTeacher() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { height, width } = useWindowDimensions();
  const colors = Colors.light;
  const isLandscape = width > height;
  const router = useRouter();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiGet(API.ENDPOINTS.STUDENT.COURSES);

      if (!response.ok) {
        const data = await response.json();

        if (data.error === "No Google account linked") {
          // Mostrar mensaje específico para cuenta no linkeada
          // Toast.show({
          //   type: "info",
          //   text1: "Cuenta de Google no vinculada",
          //   text2: "Vincula tu cuenta para ver tus clases",
          // });
          setClasses([]);
          return;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Classes data:", data);
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      Toast.show({
        type: "error",
        text1: "Error al cargar clases",
        text2: "No se pudieron cargar tus clases",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <>
      <Head>
        <title>Mis Clases - AURA | Plataforma Educativa</title>
        <meta
          name="description"
          content="Visualiza y gestiona todas tus clases de Google Classroom y Microsoft Teams en un solo lugar. Accede fácilmente a tus cursos académicos."
        />
        <meta
          name="keywords"
          content="clases, cursos, educación, Google Classroom, Microsoft Teams, AURA"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Header con SVG */}
            {isLandscape ? (
              <LandscapeHeader colors={colors} styles={styles} />
            ) : (
              <PortraitHeader colors={colors} styles={styles} />
            )}

            {/* Título responsive */}
            <View style={styles.contentWrapper}>
              <View style={styles.headerTitle}>
                <AuraText
                  text={"Mis Clases"}
                  style={isLandscape ? styles.titleLandscape : styles.title}
                />
              </View>
            </View>

            {/* Contenido */}
            <View style={styles.contentContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#CB8D27" />
                  <Text style={styles.loadingText}>Cargando clases...</Text>
                </View>
              ) : classes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="school-outline" size={80} color="#ccc" />
                  <Text style={styles.emptyText}>
                    No tienes clases registradas
                  </Text>
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => router.push("/(tabs)/profile")}
                  >
                    <Ionicons
                      name="logo-google"
                      size={24}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.connectButtonText}>
                      Conectar Google Classroom
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.classesGrid}>
                  {classes.map((classItem) => (
                    <View
                      key={classItem.id}
                      style={[
                        styles.classCard,
                        width >= 1200
                          ? styles.classCardLarge
                          : width >= 768
                          ? styles.classCardMedium
                          : styles.classCardSmall,
                      ]}
                    >
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
                            {classItem.teacher ||
                              classItem.ownerId ||
                              "Sin profesor"}
                          </Text>
                        </View>
                      </View>
                      <Image
                        source={
                          classItem.platform === "teams" ||
                          classItem.source === "teams"
                            ? require("../../assets/images/teams.png")
                            : require("../../assets/images/classroom.png")
                        }
                        style={styles.platformIcon}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
          <Toast />
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  classesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 16,
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#999",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 10,
    textAlign: "center",
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 10,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
