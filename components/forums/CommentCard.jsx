import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AttachmentViewer } from "./AttachmentViewer";
import { LinksViewer } from "./LinksViewer";

export const CommentCard = ({
  comment,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Ionicons name="person-circle-outline" size={20} color="#666" />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>
              {comment.user?.name || "Usuario"}
            </Text>
            <Text style={styles.date}>
              {new Date(comment.created_at).toLocaleString("es-ES")}
            </Text>
          </View>
        </View>

        {showActions && comment.is_owner && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(comment)}
                style={styles.actionButton}
              >
                <Ionicons name="create-outline" size={18} color="#666" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(comment)}
                style={styles.actionButton}
              >
                <Ionicons name="trash-outline" size={18} color="#ff4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <Text style={styles.content}>{comment.content}</Text>

      {comment.attachments?.length > 0 && (
        <AttachmentViewer attachments={comment.attachments} compact />
      )}

      {comment.links?.length > 0 && (
        <LinksViewer links={comment.links} compact />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesSection}>
          <Text style={styles.repliesHeader}>
            Respuestas ({comment.replies.length})
          </Text>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              showActions={showActions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#E5E5E5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorDetails: {
    marginLeft: 8,
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },
  repliesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  repliesHeader: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
});

export default CommentCard;
