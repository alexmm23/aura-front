import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { AuraText } from "@/components/AuraText";

export const ChatItem = ({ chat, onPress, style = {} }) => {
  const formatTime = (timeString) => {
    // Si es "Yesterday", "2 days ago", etc., devolver tal como está
    if (timeString.includes("ago") || timeString.includes("Yesterday")) {
      return timeString;
    }

    // Si es una hora (formato HH:MM AM/PM), devolver tal como está
    return timeString;
  };

  return (
    <Pressable style={[styles.chatItem, style]} onPress={() => onPress(chat)}>
      <View style={styles.chatAvatar}>
        <AuraText style={styles.avatarText}>{chat.avatar}</AuraText>
      </View>

      <View style={styles.chatInfo}>
        <AuraText style={styles.chatName} numberOfLines={1}>
          {chat.name}
        </AuraText>
        <AuraText style={styles.lastMessage} numberOfLines={1}>
          {chat.lastMessage}
        </AuraText>
      </View>

      <View style={styles.chatMeta}>
        <AuraText style={styles.timeText}>
          {formatTime(chat.lastMessageTime)}
        </AuraText>
        {chat.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <AuraText style={styles.unreadText}>{chat.unreadCount}</AuraText>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  chatMeta: {
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
});
