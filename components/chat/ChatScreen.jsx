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
  ActivityIndicator,
  Keyboard,
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
  hideTitle = false,
  showCustomHeader = false,
  customHeader = null,
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

  // Android: listen to keyboard events to adjust input position
  useEffect(() => {
    if (Platform.OS !== "android") return undefined;

    const onShow = (e) => {
      const height = e?.endCoordinates?.height || 0;
      setKeyboardOffset(height);
    };

    const onHide = () => setKeyboardOffset(0);

    const showSub = Keyboard.addListener("keyboardDidShow", onShow);
    const hideSub = Keyboard.addListener("keyboardDidHide", onHide);

    return () => {
      try {
        showSub.remove();
      } catch (err) {
        /* ignore */
      }
      try {
        hideSub.remove();
      } catch (err) {
        /* ignore */
      }
    };
  }, []);

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
    messageError,
    clearMessageError,
  } = useChatMessages(selectedChat?.id);

  const chatList = Array.isArray(chats) ? chats : [];
  const messageList = Array.isArray(messages) ? messages : [];
  const typingSet = typingUsers instanceof Set ? typingUsers : new Set();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    if (messageError) {
      clearMessageError();
    }

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
    clearMessageError();
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
      const targetLabel =
        userRole === "teacher" ? "este usuario" : "este profesor";
      Alert.alert("Error", `No se pudo crear el chat con ${targetLabel}`);
    }
  };

  const handleNewChatPress = () => {
    setShowUserSelection(true);
  };

  const closeUserSelection = () => {
    setShowUserSelection(false);
  };

  const renderMessages = () => {
    const Container = Platform.OS === "ios" ? KeyboardAvoidingView : View;
    const containerProps =
      Platform.OS === "ios"
        ? {
            behavior: "padding",
            keyboardVerticalOffset: 90,
            style: styles.container,
          }
        : { style: styles.container };

    return (
      <Container {...containerProps}>
        {/* StatusBar con color naranja */}
        <View style={styles.statusBarFill} />

        {/* SafeAreaView solo para bottom */}
        <SafeAreaView style={styles.container} edges={["bottom"]}>
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

          <ScrollView
            ref={messagesEndRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messageList.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={48}
                  color="#999"
                />
                <AuraText style={styles.emptyText}>
                  No hay mensajes aún
                </AuraText>
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

          {/* Indicador de escritura mejorado */}
          {typingSet.size > 0 && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
              <AuraText style={styles.typingText}>
                {typingSet.size === 1
                  ? "Escribiendo..."
                  : `${typingSet.size} personas escribiendo...`}
              </AuraText>
            </View>
          )}

          {messageError && (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={16} color="#b3261e" />
              <AuraText style={styles.errorBannerText}>{messageError}</AuraText>
            </View>
          )}

          {/* Apply keyboard offset (web or Android) to input container to lift it above keyboard */}
          <View
            style={[
              styles.inputContainer,
              webKeyboardStyle /* legacy */,
              keyboardOffset > 0 ? { marginBottom: keyboardOffset } : null,
            ]}
          >
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
      </Container>
    );
  };

  if (selectedChat) {
    return renderMessages();
  }

  return (
    <View style={{ flex: 1 }}>
      {" "}
      {/* ✅ CAMBIO: View en lugar de ScrollView para mejor control del FAB */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        {showCustomHeader && customHeader}

        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 100,
          }}
        >
          <ScrollView
            style={styles.chatList}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
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
        </View>
      </ScrollView>
      {/* ✅ CAMBIO: FAB fuera del ScrollView para que esté siempre fijo */}
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
    </View>
  );
};

export default ChatScreen;
