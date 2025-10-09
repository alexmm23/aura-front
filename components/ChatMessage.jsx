import React from "react";
import { View, StyleSheet } from "react-native";
import { AuraText } from "@/components/AuraText";

export const ChatMessage = ({ message, isOwn, timestamp }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <AuraText
          style={[
            styles.messageText,
            isOwn ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {message}
        </AuraText>
        <AuraText
          style={[
            styles.timeText,
            isOwn ? styles.ownTimeText : styles.otherTimeText,
          ]}
        >
          {formatTime(timestamp)}
        </AuraText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 15,
  },
  ownMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
  },
  ownBubble: {
    backgroundColor: "#9BB5E8",
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  ownMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#333",
  },
  timeText: {
    fontSize: 10,
    marginTop: 2,
  },
  ownTimeText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  otherTimeText: {
    color: "#999",
    textAlign: "left",
  },
});
