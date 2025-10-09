import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import { AuraText } from "@/components/AuraText";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useChats } from "../../hooks/useChats";
import { useChatMessages } from "../../hooks/useChatMessages";
import { UserSelectionModal } from "../../components/UserSelectionModal";

export default function Chats() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showUserSelection, setShowUserSelection] = useState(false);

  const {
    chats,
    loading,
    refreshing,
    onRefresh,
    markAsRead,
    createChat,
    socketConnected,
  } = useChats("student");

  const {
    messages,
    sending,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    messagesEndRef,
  } = useChatMessages(selectedChat?.id);

  const colors = Colors.light;

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
      stopTyping();
    }
  };

  const openChat = async (chat) => {
    setSelectedChat(chat);
    // Mark chat as read when opening
    if (chat.unreadCount > 0) {
      markAsRead(chat.id);
    }
  };

  const handleTyping = () => {
    if (selectedChat) {
      startTyping();
    }
  };

  const goBack = () => {
    setSelectedChat(null);
  };

  const handleUserSelect = async (user) => {
    try {
      const newChat = await createChat(user.id, user.name, user.role);
      if (newChat) {
        setSelectedChat(newChat);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "No se pudo crear el chat con este profesor");
    }
  };

  const handleNewChatPress = () => {
    setShowUserSelection(true);
  };

  if (selectedChat) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header del chat */}
        <View style={styles.chatHeader}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.chatHeaderInfo}>
            <View style={styles.avatarContainer}>
              <AuraText style={styles.avatarText}>
                {selectedChat.avatar}
              </AuraText>
            </View>
            <AuraText style={styles.chatHeaderName}>
              {selectedChat.name}
            </AuraText>
          </View>
          <Pressable style={styles.moreButton}>
            <MaterialIcons name="more-vert" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer}>
          {messages.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={48}
                color="#999"
              />
              <AuraText style={styles.emptyText}>No hay mensajes aún</AuraText>
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isOwn ? styles.ownMessage : styles.otherMessage,
              ]}
            >
              {!message.isOwn && (
                <AuraText style={styles.senderName}>
                  {message.senderName}
                </AuraText>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.isOwn ? styles.ownBubble : styles.otherBubble,
                ]}
              >
                <AuraText
                  style={[
                    styles.messageText,
                    message.isOwn
                      ? styles.ownMessageText
                      : styles.otherMessageText,
                  ]}
                >
                  {message.content}
                </AuraText>
                <AuraText
                  style={[
                    styles.messageTime,
                    message.isOwn
                      ? styles.ownMessageTime
                      : styles.otherMessageTime,
                  ]}
                >
                  {message.time}
                </AuraText>
              </View>
            </View>
          ))}
          <View ref={messagesEndRef} />
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Escribe un Mensaje"
            placeholderTextColor="#999"
            value={newMessage}
            onChangeText={(text) => {
              setNewMessage(text);
              handleTyping();
            }}
            onBlur={stopTyping}
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
            multiline
            returnKeyType="send"
          />
          <Pressable
            style={[
              styles.sendButton,
              { opacity: newMessage.trim() ? 1 : 0.5 },
            ]}
            onPress={handleSendMessage}
            disabled={sending || !newMessage.trim()}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <View style={styles.typingIndicator}>
            <AuraText style={styles.typingText}>
              {Array.from(typingUsers).length === 1
                ? "Escribiendo..."
                : `${Array.from(typingUsers).length} personas escribiendo...`}
            </AuraText>
          </View>
        )}

        {/* Connection Status */}
        <View
          style={[
            styles.connectionStatus,
            {
              backgroundColor: socketConnected ? "#4CAF50" : "#FF5722",
            },
          ]}
        >
          <AuraText style={styles.connectionText}>
            {socketConnected ? "🟢 Conectado" : "🔴 Desconectado"}
          </AuraText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AuraText style={styles.title}>Chats</AuraText>
      </View>

      {/* Chat List */}
      <ScrollView
        style={styles.chatList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {chats &&
          chats.map((chat) => (
            <Pressable
              key={chat.id}
              style={styles.chatItem}
              onPress={() => openChat(chat)}
            >
              <View style={styles.chatAvatar}>
                <AuraText style={styles.avatarText}>{chat.avatar}</AuraText>
              </View>
              <View style={styles.chatInfo}>
                <AuraText style={styles.chatName}>{chat.name}</AuraText>
                <AuraText style={styles.lastMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </AuraText>
              </View>
              <View style={styles.chatMeta}>
                <AuraText style={styles.timeText}>
                  {chat.lastMessageTime}
                </AuraText>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <AuraText style={styles.unreadText}>
                      {chat.unreadCount}
                    </AuraText>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable style={styles.fab} onPress={handleNewChatPress}>
        <MaterialIcons name="add" size={24} color="#fff" />
      </Pressable>

      {/* User Selection Modal */}
      <UserSelectionModal
        visible={showUserSelection}
        onClose={() => setShowUserSelection(false)}
        onUserSelect={handleUserSelect}
        userType="student"
        title="Seleccionar Profesor"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  header: {
    padding: 20,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#CB8D27",
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#CB8D27",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Estilos para la vista de chat individual
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#CB8D27",
    padding: 15,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 15,
  },
  chatHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  moreButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
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
  },
  ownMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#333",
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    marginLeft: 8,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  ownMessageTime: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "right",
  },
  otherMessageTime: {
    color: "#999",
    textAlign: "left",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#B85DB8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  // Nuevos estilos para WebSocket features
  typingIndicator: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#F0F0F0",
  },
  typingText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  connectionStatus: {
    position: "absolute",
    top: 50,
    right: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1000,
  },
  connectionText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
});
