import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { AuraText } from "@/components/AuraText";
import { API, buildApiUrl } from "@/config/api";
import Head from "expo-router/head";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/Colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "@/utils/fetchWithAuth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native"; // ✅ Agregado

export default function HomeTeacher() {
  const [classes, setClasses] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { height, width } = useWindowDimensions();
  const colors = Colors.light;
  const isLandscape = width > height;
  const router = useRouter();

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      const response = await apiGet(API.ENDPOINTS.GOOGLE_CLASSROOM.COURSES);
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const result = await response.json();
      console.log("Classes response:", result);
      
      if (result.success && result.data?.courses) {
        setClasses(result.data.courses);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const fetchReminders = async () => {
    try {
      setIsLoadingReminders(true);
      const response = await apiGet(API.ENDPOINTS.REMINDERS.PENDING_HOME);
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Reminders data:", data);
      
      if (data.success) {
        setReminders(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setReminders([]);
    } finally {
      setIsLoadingReminders(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchClasses(), fetchReminders()]);
    setRefreshing(false);
  }, []);

  // ✅ Reemplazar useEffect con useFocusEffect
  useFocusEffect(
    useCallback(() => {
      console.log("📍 Pantalla HomeTeacher enfocada - Recargando datos...");
      fetchClasses();
      fetchReminders();
      
      // Cleanup function (opcional)
      return () => {
        console.log("📍 Pantalla HomeTeacher desenfocada");
      };
    }, [])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    const dateFormat = new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    if (diffHours < 1) {
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      return `${dateFormat} (en ${diffMinutes} min)`;
    } else if (diffHours < 24) {
      return `${dateFormat} (en ${diffHours}h)`;
    } else if (diffDays === 1) {
      return `${dateFormat} (mañana)`;
    } else if (diffDays <= 7) {
      return `${dateFormat} (en ${diffDays} días)`;
    }

    return dateFormat;
  };

  const getFrequencyText = (frequency) => {
    const freqMap = {
      once: "Una vez",
      daily: "Diario",
      weekly: "Semanal",
      monthly: "Mensual",
    };
    return freqMap[frequency] || frequency;
  };

  const navigateToReminders = () => {
    router.push({
      pathname: "/(tabs_teacher)/reminders",
      params: { filterStatus: "pending" }
    });
  };

  const navigateToClasses = () => {
    router.push("/(tabs_teacher)/classes");
  };

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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Mis recordatorios */}
            <View style={styles.card}>
              <TouchableOpacity 
                onPress={navigateToReminders}
                style={styles.cardHeader}
                activeOpacity={0.7}
              >
                <AuraText style={styles.titleText}>Mis Recordatorios</AuraText>
                <AuraText style={styles.seeAllText}>Ver todos →</AuraText>
              </TouchableOpacity>

              {isLoadingReminders ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#A64AC9" />
                  <AuraText style={styles.loadingTextNative}>
                    Cargando recordatorios...
                  </AuraText>
                </View>
              ) : reminders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <AuraText style={styles.emptyEmoji}>🎉</AuraText>
                  <AuraText style={styles.emptyTitleNative}>
                    ¡Estás libre de pendientes!
                  </AuraText>
                  <AuraText style={styles.emptyTextNative}>
                    No tienes recordatorios pendientes en este momento.
                  </AuraText>
                </View>
              ) : (
                <ScrollView
                  style={styles.remindersScrollView}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {reminders.map((reminder) => (
                    <TouchableOpacity
                      key={reminder.id}
                      style={styles.noteCard}
                      onPress={navigateToReminders}
                      activeOpacity={0.8}
                    >
                      <View style={styles.reminderHeader}>
                        <AuraText style={styles.noteTitleText} numberOfLines={2}>
                          {reminder.title}
                        </AuraText>
                        {reminder.frequency !== "once" && (
                          <View style={styles.frequencyBadge}>
                            <AuraText style={styles.frequencyText}>
                              {getFrequencyText(reminder.frequency)}
                            </AuraText>
                          </View>
                        )}
                      </View>
                      {reminder.description && (
                        <AuraText style={styles.noteTextNative} numberOfLines={2}>
                          {reminder.description}
                        </AuraText>
                      )}
                      <View style={styles.reminderFooter}>
                        <AuraText style={styles.dateText}>
                          📅 {formatDate(reminder.date_time)}
                        </AuraText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Mis Clases */}
            <View style={styles.card}>
              <TouchableOpacity 
                onPress={navigateToClasses}
                style={styles.cardHeader}
                activeOpacity={0.7}
              >
                <AuraText style={styles.titleText}>Mis Clases</AuraText>
                <AuraText style={styles.seeAllText}>Ver todas →</AuraText>
              </TouchableOpacity>

              {isLoadingClasses ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#CB8D27" />
                  <AuraText style={styles.loadingTextNative}>
                    Cargando clases...
                  </AuraText>
                </View>
              ) : classes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <AuraText style={styles.emptyEmoji}>📚</AuraText>
                  <AuraText style={styles.emptyTitleNative}>
                    No hay clases disponibles
                  </AuraText>
                  <AuraText style={styles.emptyTextNative}>
                    No se encontraron clases en tu cuenta de Google Classroom.
                  </AuraText>
                </View>
              ) : (
                <ScrollView
                  style={styles.classesScrollView}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {classes.slice(0, 3).map((classItem) => (
                    <TouchableOpacity
                      key={classItem.id}
                      style={styles.classCard}
                      onPress={navigateToClasses}
                      activeOpacity={0.8}
                    >
                      <View style={styles.classIconContainer}>
                        <Ionicons name="school" size={24} color="#CB8D27" />
                      </View>
                      <View style={styles.classInfo}>
                        <AuraText style={styles.classNameText} numberOfLines={2}>
                          {classItem.name}
                        </AuraText>
                        {classItem.section && (
                          <AuraText style={styles.classSectionText}>
                            Sección: {classItem.section}
                          </AuraText>
                        )}
                        {classItem.descriptionHeading && (
                          <AuraText style={styles.classDescriptionText} numberOfLines={1}>
                            {classItem.descriptionHeading}
                          </AuraText>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                  ))}
                  {classes.length > 3 && (
                    <TouchableOpacity
                      style={styles.viewMoreButton}
                      onPress={navigateToClasses}
                      activeOpacity={0.7}
                    >
                      <AuraText style={styles.viewMoreText}>
                        Ver {classes.length - 3} clases más
                      </AuraText>
                    </TouchableOpacity>
                  )}
                </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 120,
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
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9900",
  },
  remindersScrollView: {
    maxHeight: 300,
  },
  classesScrollView: {
    maxHeight: 300,
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
  classCard: {
    backgroundColor: "#FFF3CD",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#CB8D27",
  },
  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  classNameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  classSectionText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  classDescriptionText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  viewMoreButton: {
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginTop: 4,
  },
  viewMoreText: {
    fontSize: 14,
    color: "#CB8D27",
    fontWeight: "600",
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  noteTitleText: {
    fontWeight: "bold",
    color: "#A64AC9",
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  frequencyBadge: {
    backgroundColor: "#A64AC9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  noteTextNative: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  reminderFooter: {
    borderTopWidth: 1,
    borderTopColor: "#D0CFC9",
    paddingTop: 8,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingTextNative: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitleNative: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A64AC9",
    marginBottom: 8,
  },
  emptyTextNative: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  backgroundContainer: {
    height: 350,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  backgroundContainerLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "40%",
    height: "100%",
    zIndex: -1,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: "#A64AC9",
    fontWeight: "600",
  },
});