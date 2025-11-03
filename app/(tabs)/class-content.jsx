import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Image,
  Animated,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import React, { useMemo, useRef } from "react";
import { AuraText } from "@/components/AuraText";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useClassContent } from "@/hooks/useClassContent";
import Svg, { Path } from "react-native-svg";

const HEADER_IMAGES = [
  require("../../assets/images/img1.png"),
  require("../../assets/images/img2.png"),
  require("../../assets/images/img3.png"),
];

const HEADER_COLORS = [
  "#A44076",
  "#4285F4",
  "#34A853",
  "#ea9c35ff",
  "#7B68EE",
];

const HEADER_MAX_HEIGHT = 320;
const HEADER_MIN_HEIGHT = 120;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function ClassContentView() {
  const params = useLocalSearchParams();
  const { classId, className, platform } = params;
  
  const actualPlatform = platform || "classroom";
  
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const scrollY = useRef(new Animated.Value(0)).current;

  const {
    classDetails,
    announcements,
    coursework,
    loading,
    refreshing,
    onRefresh,
  } = useClassContent(classId, actualPlatform);

  const { headerColor, headerImage } = useMemo(() => {
    // Convertir classId a un número estable
    let hash = 0;
    const str = String(classId);
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    
    // Asegurar que sea positivo
    hash = Math.abs(hash);
    
    const colorIndex = hash % HEADER_COLORS.length;
    const imageIndex = (hash * 3) % HEADER_IMAGES.length;
    
    return {
      headerColor: HEADER_COLORS[colorIndex],
      headerImage: HEADER_IMAGES[imageIndex],
    };
  }, [classId]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 0.3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const allContent = useMemo(() => {
    const combined = [];

    announcements.forEach((item) => {
      combined.push({
        ...item,
        type: 'announcement',
        sortDate: item.creationTime || item.updateTime || Date.now(),
      });
    });

    coursework.forEach((item) => {
      combined.push({
        ...item,
        type: 'coursework',
        sortDate: item.creationTime || item.updateTime || Date.now(),
      });
    });

    const sorted = combined.sort((a, b) => {
      const dateA = new Date(a.sortDate).getTime();
      const dateB = new Date(b.sortDate).getTime();
      return dateB - dateA;
    });

    return sorted;
  }, [announcements, coursework]);

  const formatDate = (dateObj) => {
    if (!dateObj) return "Sin fecha";
    
    const date = new Date(
      dateObj.year,
      dateObj.month - 1,
      dateObj.day
    );
    
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Hace un momento";
    
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleGoBack = () => {
    router.push('/(tabs)/classes');
  };

  const renderContentItem = (item) => {
    if (item.type === 'announcement') {
      return (
        <View key={item.id} style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <View style={[styles.contentIcon, { backgroundColor: `${headerColor}20` }]}>
              <Ionicons name="megaphone" size={24} color={headerColor} />
            </View>
            <View style={styles.contentInfo}>
              <View style={styles.contentTitleRow}>
                <AuraText style={styles.contentTitle}>Anuncio</AuraText>
                <View style={styles.typeBadge}>
                  <AuraText style={styles.typeBadgeText}>📢</AuraText>
                </View>
              </View>
              <AuraText style={styles.contentDate}>
                {formatDateTime(item.creationTime || item.updateTime)}
              </AuraText>
            </View>
          </View>
          <AuraText style={styles.contentText}>{item.text}</AuraText>
          {item.materials && item.materials.length > 0 && (
            <View style={styles.materialsContainer}>
              {item.materials.map((material, index) => (
                <View key={index} style={styles.materialChip}>
                  <Ionicons name="attach" size={14} color="#666" />
                  <AuraText style={styles.materialText}>
                    {material.driveFile?.title || material.link?.title || "Archivo"}
                  </AuraText>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    } else {
      return (
        <View key={item.id} style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <View style={[styles.contentIcon, { backgroundColor: `${headerColor}20` }]}>
              <Ionicons 
                name={item.workType === "ASSIGNMENT" ? "document-text" : "help-circle"} 
                size={24} 
                color={headerColor} 
              />
            </View>
            <View style={styles.contentInfo}>
              <View style={styles.contentTitleRow}>
                <AuraText style={styles.contentTitle}>{item.title}</AuraText>
                {item.maxPoints && (
                  <View style={styles.pointsBadge}>
                    <AuraText style={styles.pointsText}>{item.maxPoints} pts</AuraText>
                  </View>
                )}
              </View>
              {item.dueDate && (
                <View style={styles.dueDateContainer}>
                  <Ionicons name="calendar" size={14} color="#FF6B6B" />
                  <AuraText style={styles.dueDateText}>
                    Vence: {formatDate(item.dueDate)}
                  </AuraText>
                </View>
              )}
            </View>
          </View>
          {item.description && (
            <AuraText style={styles.contentText}>{item.description}</AuraText>
          )}
          {item.materials && item.materials.length > 0 && (
            <View style={styles.materialsContainer}>
              {item.materials.map((material, index) => (
                <View key={index} style={styles.materialChip}>
                  <Ionicons name="attach" size={14} color="#666" />
                  <AuraText style={styles.materialText}>
                    {material.driveFile?.title || material.link?.title || "Archivo"}
                  </AuraText>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: headerColor }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={headerColor}
        translucent={true}
      />

      {isLandscape ? (
        <View style={styles.backgroundContainerLandscape}>
          <Svg
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 544 566"
          >
            <Path
              d="M290.802 352.301C290.802 415.877 773.741 99.5868 436.203 392.457C335.003 480.265 0 612.909 0 549.333C0 485.758 344.864 0 477.746 0C610.628 0 290.802 288.726 290.802 352.301Z"
              fill="#CDAEC4"
              fillOpacity={0.67}
            />
          </Svg>
        </View>
      ) : (
        <View style={styles.backgroundContainer}>
          <Svg
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 544 566"
          >
            <Path
              d="M290.802 352.301C290.802 415.877 773.741 99.5868 436.203 392.457C335.003 480.265 0 612.909 0 549.333C0 485.758 344.864 0 477.746 0C610.628 0 290.802 288.726 290.802 352.301Z"
              fill="#CDAEC4"
              fillOpacity={0.67}
            />
          </Svg>
        </View>
      )}

      <View style={styles.fixedBackButton}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </Pressable>
      </View>

      <Animated.View style={[styles.header, { 
        backgroundColor: headerColor,
        height: headerHeight,
      }]}>
        <Animated.View style={[
          styles.headerImageContainer,
          { opacity: imageOpacity }
        ]}>
          <Image 
            source={headerImage} 
            style={styles.headerImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[
          styles.headerContent,
          { opacity: titleOpacity }
        ]}>
          <View style={styles.headerTextContainer}>
            <AuraText style={styles.headerTitle} numberOfLines={2}>
              {className || "Clase"}
            </AuraText>
            <View style={styles.platformBadgeHeader}>
              <Ionicons 
                name={actualPlatform === 'moodle' ? 'school' : 'logo-google'} 
                size={14} 
                color="#fff" 
              />
              <AuraText style={styles.platformTextHeader}>
                {actualPlatform === 'moodle' ? 'Moodle' : 'Google Classroom'}
              </AuraText>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={8}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={[headerColor]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={headerColor} />
            <AuraText style={styles.loadingText}>Cargando contenido...</AuraText>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={24} color={headerColor} />
                <AuraText style={styles.sectionTitle}>
                  Anuncios y Tareas ({allContent.length})
                </AuraText>
              </View>

              {allContent.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                  <AuraText style={styles.emptyText}>
                    No hay contenido disponible
                  </AuraText>
                </View>
              ) : (
                allContent.map(renderContentItem)
              )}
            </View>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  backgroundContainer: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 320,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: "hidden",
  },
  backgroundContainerLandscape: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "60%",
    height: "100%",
    zIndex: 0,
    overflow: "hidden",
  },
  fixedBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 20,
    left: 20,
    zIndex: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 90 : (StatusBar.currentHeight || 0) + 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
    overflow: 'hidden',
    elevation: 0,
  },
  headerImageContainer: {
    alignItems: "center",
    marginBottom: 8,
    marginTop: 0,
  },
  headerImage: {
    width: 90,
    height: 90,
  },
  headerContent: {
    alignItems: "center",
    paddingBottom: 15,
  },
  headerTextContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 5,
  },
  platformBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 140,
    justifyContent: "center",
  },
  platformTextHeader: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
    backgroundColor: "#E6E2D2",
  },
  scrollContent: {
    paddingTop: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  contentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  typeBadge: {
    marginLeft: 8,
  },
  typeBadgeText: {
    fontSize: 16,
  },
  pointsBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#F57C00",
  },
  contentDate: {
    fontSize: 12,
    color: "#999",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  contentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 10,
  },
  materialsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  materialChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  materialText: {
    fontSize: 12,
    color: "#666",
  },
});