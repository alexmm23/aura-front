import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { AuraText } from "@/components/AuraText";
import { UserSelectionModal } from "@/components/UserSelectionModal";
import { useChats } from "@/hooks/useChats";
import { useChatMessages } from "@/hooks/useChatMessages";
import chatStyles from "./chatStyles";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const ChatScreen = ({
  userRole,
  modalUserType,
  modalTitle,
  screenTitle,
}) => {
  const styles = chatStyles;

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.visualViewport
    ) {
      const viewport = window.visualViewport;
      const adjustForKeyboard = () => {
        const offset = Math.max(0, window.innerHeight - viewport.height);
        setKeyboardOffset(offset);
      };
      viewport.addEventListener("resize", adjustForKeyboard);
      viewport.addEventListener("scroll", adjustForKeyboard);
      adjustForKeyboard();
      return () => {
        viewport.removeEventListener("resize", adjustForKeyboard);
        viewport.removeEventListener("scroll", adjustForKeyboard);
      };
    }
    return undefined;
  }, []);

  const webKeyboardStyle = useMemo(() => {
    if (Platform.OS !== "web" || keyboardOffset <= 0) {
      return null;
    }
    return {
      marginBottom: keyboardOffset,
      paddingBottom: 4,
    };
  }, [keyboardOffset]);

  const {
    chats,
    loading,
    refreshing,
    onRefresh,
    markAsRead,
    createChat,
    socketConnected,
  } = useChats(userRole);

  const {
    messages,
    sending,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    messagesEndRef,
  } = useChatMessages(selectedChat?.id);

  const chatList = Array.isArray(chats) ? chats : [];
  const messageList = Array.isArray(messages) ? messages : [];
  const typingSet = typingUsers instanceof Set ? typingUsers : new Set();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
      stopTyping();
    }
  };

  const openChat = (chat) => {
    setSelectedChat(chat);
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
    stopTyping();
    setSelectedChat(null);
    setNewMessage("");
  };

  const handleUserSelect = async (user) => {
    try {
      const newChat = await createChat(user.id, user.name, user.role);
      if (newChat) {
        setSelectedChat(newChat);
        setShowUserSelection(false);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      const targetLabel = userRole === "teacher" ? "este usuario" : "este profesor";
      Alert.alert("Error", `No se pudo crear el chat con ${targetLabel}`);
    }
  };

  const handleNewChatPress = () => {
    setShowUserSelection(true);
  };

  const closeUserSelection = () => {
    setShowUserSelection(false);
  };

  const renderMessages = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.chatHeader}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.chatHeaderInfo}>
            <View style={styles.avatarContainer}>
              <AuraText style={styles.avatarText}>
                {selectedChat?.avatar}
              </AuraText>
            </View>
            <AuraText style={styles.chatHeaderName}>
              {selectedChat?.name}
            </AuraText>
          </View>
          <View
            style={[
              styles.connectionStatusInline,
              { backgroundColor: socketConnected ? "#4CAF50" : "#FFB800" },
            ]}
          >
            <MaterialIcons
              name={socketConnected ? "check-circle" : "cancel"}
              size={14}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <AuraText style={styles.connectionTextInline}>
              {socketConnected ? "●" : "●"}
            </AuraText>
          </View>
        </View>

        <ScrollView ref={messagesEndRef} style={styles.messagesContainer}>
          {messageList.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <MaterialIcons name="chat-bubble-outline" size={48} color="#999" />
              <AuraText style={styles.emptyText}>No hay mensajes aún</AuraText>
            </View>
          )}

          {messageList.map((message) => (
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
                  {formatDateTime(message.time)}
                </AuraText>
              </View>
            </View>
          ))}
          <View ref={messagesEndRef} />
        </ScrollView>

        {typingSet.size > 0 && (
          <View style={styles.typingIndicator}>
            <AuraText style={styles.typingText}>
              {typingSet.size === 1
                ? "Escribiendo..."
                : `${typingSet.size} personas escribiendo...`}
            </AuraText>
          </View>
        )}

        <View style={[styles.inputContainer, webKeyboardStyle]}>
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
            onSubmitEditing={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            blurOnSubmit={false}
            multiline
            returnKeyType="send"
            onKeyPress={(e) => {
              if (e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {selectedChat ? (
        renderMessages()
      ) : (
        <>
          <View style={styles.header}>
            <AuraText style={styles.title}>{screenTitle}</AuraText>
          </View>
          <ScrollView
            style={styles.chatList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {chatList.map((chat) => (
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
                    {formatDateTime(chat.lastMessageTime)}
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

          <Pressable style={styles.fab} onPress={handleNewChatPress}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </Pressable>

          <UserSelectionModal
            visible={showUserSelection}
            onClose={closeUserSelection}
            onUserSelect={handleUserSelect}
            userType={modalUserType}
            title={modalTitle}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default ChatScreen;
