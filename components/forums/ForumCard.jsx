import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export const ForumCard = ({ forum, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(forum);
    } else {
      router.push(`/forum/${forum.id}`);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Académico: "#4285F4",
      General: "#34A853",
      Proyectos: "#EA4335",
      Recursos: "#FBBC04",
      Dudas: "#9C27B0",
      Anuncios: "#FF6F00",
    };
    return colors[category] || "#666";
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {forum.title}
          </Text>
          {forum.is_pinned && (
            <Ionicons
              name="pin"
              size={16}
              color="#CB8D27"
              style={styles.pinIcon}
            />
          )}
        </View>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(forum.category) },
          ]}
        >
          <Text style={styles.categoryText}>{forum.category}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {forum.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="chatbubbles-outline" size={16} color="#666" />
            <Text style={styles.statText}>{forum.posts_count || 0}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>{forum.participants_count || 0}</Text>
          </View>

          {forum.last_activity && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {new Date(forum.last_activity).toLocaleDateString("es-ES")}
              </Text>
            </View>
          )}
        </View>

        {!forum.is_active && (
          <View style={styles.closedBadge}>
            <Ionicons name="lock-closed" size={12} color="#fff" />
            <Text style={styles.closedText}>Cerrado</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  pinIcon: {
    marginLeft: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stats: {
    flexDirection: "row",
    flex: 1,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  closedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedText: {
    fontSize: 10,
    color: "#fff",
    marginLeft: 4,
    fontWeight: "500",
  },
});

export default ForumCard;
