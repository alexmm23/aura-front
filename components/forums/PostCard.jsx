import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AttachmentViewer } from "./AttachmentViewer";
import { LinksViewer } from "./LinksViewer";

export const PostCard = ({ post, onPress, showForumInfo = false }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(post);
    } else {
      router.push(`/post/${post.id}`);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {post.title}
          </Text>
          {post.is_pinned && (
            <Ionicons
              name="pin"
              size={16}
              color="#CB8D27"
              style={styles.pinIcon}
            />
          )}
        </View>

        {!post.allow_responses && (
          <View style={styles.closedBadge}>
            <Ionicons name="lock-closed" size={12} color="#fff" />
            <Text style={styles.closedText}>Cerrado</Text>
          </View>
        )}
      </View>

      {showForumInfo && post.forum && (
        <View style={styles.forumInfo}>
          <Ionicons name="chatbubbles-outline" size={14} color="#666" />
          <Text style={styles.forumName}>{post.forum.title}</Text>
        </View>
      )}

      <View style={styles.meta}>
        <View style={styles.authorInfo}>
          <Ionicons name="person-circle-outline" size={16} color="#666" />
          <Text style={styles.authorName}>
            {post.user?.name}
          </Text>
        </View>
        <Text style={styles.date}>
          {new Date(post.created_at).toLocaleDateString("es-ES")}
        </Text>
      </View>

      {post.description && (
        <Text style={styles.description} numberOfLines={3}>
          {post.description}
        </Text>
      )}

      {post.attachments?.length > 0 && (
        <AttachmentViewer attachments={post.attachments} compact />
      )}

      {post.links?.length > 0 && <LinksViewer links={post.links} compact />}

      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.statText}>{post.comments_count || 0}</Text>
          </View>

          {post.last_activity && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {new Date(post.last_activity).toLocaleDateString("es-ES")}
              </Text>
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
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
  closedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4444",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  closedText: {
    fontSize: 10,
    color: "#fff",
    marginLeft: 3,
    fontWeight: "500",
  },
  forumInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  forumName: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontStyle: "italic",
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  stats: {
    flexDirection: "row",
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
});

export default PostCard;
