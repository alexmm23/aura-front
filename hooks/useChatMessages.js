import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost } from '../utils/fetchWithAuth';
import { API } from '../config/api';
import chatSocket from '../services/chatSocket';
import { useAuth } from './useAuth';

export const useChatMessages=(chatId) => {
    const { user } = useAuth();
    const currentUserId = user?.id || user?.userId;
    
    console.log('💬 useChatMessages initialized:', {
        chatId,
        currentUserId,
        user: user ? { id: user.id, userId: user.userId, email: user.email } : null
    });
    
    const [messages, setMessages]=useState([]);
    const [loading, setLoading]=useState(true);
    const [sending, setSending]=useState(false);
    const [error, setError]=useState(null);
    const [messageError, setMessageError]=useState(null);
    const [onlineUsers, setOnlineUsers]=useState(new Set());
    const [typingUsers, setTypingUsers]=useState(new Set());
    const [hasMoreMessages, setHasMoreMessages]=useState(true);
    const [currentPage, setCurrentPage]=useState(1);

    const typingTimeoutRef=useRef(null);
    const messagesEndRef=useRef(null);

    // Initialize chat and WebSocket listeners
    useEffect(() => {
        if (!chatId) {
            setMessageError(null);
            return;
        }

        setMessageError(null);

        // Join the chat room
        chatSocket.joinChat(chatId);

        // Set up WebSocket event listeners
        const unsubscribeNewMessage=chatSocket.on('new_message', (data) => {
            if (data.chatId===chatId) {
                const newMessage={
                    id: data.message.id,
                    content: data.message.content,
                    created_at: data.message.created_at,
                    sender_id: data.message.sender_id,
                    is_read: data.message.is_read,
                    sender: data.message.sender
                };
                setMessages(prevMessages => [...prevMessages, newMessage]);
                scrollToBottom();
            }
        });

        const unsubscribeUserJoined=chatSocket.on('user_joined_chat', (data) => {
            if (data.chatId===chatId) {
                setOnlineUsers(new Set(data.onlineUsers));
            }
        });

        const unsubscribeUserLeft=chatSocket.on('user_left_chat', (data) => {
            if (data.chatId===chatId) {
                setOnlineUsers(new Set(data.onlineUsers));
            }
        });

        const unsubscribeMessagesRead=chatSocket.on('messages_read', (data) => {
            if (data.chatId===chatId) {
                markMessagesAsRead(data.userId);
            }
        });

        const unsubscribeTyping=chatSocket.on('user_typing', (data) => {
            if (data.chatId===chatId) {
                setTypingUsers(new Set(data.typingUsers));
            }
        });

        const unsubscribeMessageError=chatSocket.on('message_error', (data) => {
            const targetChatId=data?.chatId??data?.chat_id;
            if (targetChatId===chatId) {
                const errorMessage=data?.error||'No se pudo enviar el mensaje.';
                setMessageError(errorMessage);
            }
        });

        // Load initial messages
        fetchMessages();

        // Cleanup function
        return () => {
            chatSocket.leaveChat(chatId);
            unsubscribeNewMessage();
            unsubscribeUserJoined();
            unsubscribeUserLeft();
            unsubscribeMessagesRead();
            unsubscribeTyping();
            unsubscribeMessageError();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [chatId]);

    // Fetch messages from API
    const fetchMessages=async (page=1, limit=50) => {
        if (!chatId) return;

        try {
            setLoading(page===1);
            setError(null);

            const endpoint=`${API.ENDPOINTS.CHATS.MESSAGES(chatId)}?page=${page}&limit=${limit}`;
            const response=await apiGet(endpoint);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result=await response.json();

            if (result.success) {
                const newMessages=result.data.messages||[];

                if (page===1) {
                    setMessages(newMessages);
                    setCurrentPage(1);
                } else {
                    // Prepend older messages for pagination
                    setMessages(prevMessages => [...newMessages, ...prevMessages]);
                }

                setHasMoreMessages(result.data.currentPage<result.data.totalPages);
                setCurrentPage(result.data.currentPage);

                // Scroll to bottom only for initial load
                if (page===1) {
                    setTimeout(scrollToBottom, 100);
                }
            } else {
                throw new Error(result.message||'Error fetching messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError(error.message);

            // Fallback to mock data for development
            if (page===1) {
                const mockMessages=getMockMessages(chatId);
                setMessages(mockMessages);
                setTimeout(scrollToBottom, 100);
            }
        } finally {
            setLoading(false);
        }
    };

    // Load more messages (pagination)
    const loadMoreMessages=async () => {
        if (!hasMoreMessages||loading) return;

        await fetchMessages(currentPage+1);
    };

    // Send message via WebSocket
    const sendMessage=async (content) => {
        if (!content.trim()||!chatId||sending) return false;

        try {
            setSending(true);

            // Try to send via WebSocket first
            const socketSent=chatSocket.sendMessage(chatId, content);
            setMessageError(null);

            if (!socketSent) {
                // Fallback to REST API if WebSocket fails
                const endpoint=API.ENDPOINTS.CHATS.SEND_MESSAGE(chatId);
                const response=await apiPost(endpoint, { content: content.trim() });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result=await response.json();

                if (result.success) {
                    // Message will be added via WebSocket event
                    return true;
                } else {
                    throw new Error(result.message||'Error sending message');
                }
            }

            return true;
        } catch (error) {
            console.error('Error sending message:', error);

            // For development, add message directly to state
            const mockMessage={
                id: `mock_${Date.now()}`,
                content: content.trim(),
                created_at: new Date().toISOString(),
                sender_id: chatSocket.currentUserId,
                is_read: false,
                sender: {
                    id: chatSocket.currentUserId,
                    name: 'You'
                }
            };

            setMessages(prevMessages => [...prevMessages, mockMessage]);
            scrollToBottom();
            setMessageError('No se pudo enviar el mensaje en tiempo real. Intento usando datos locales.');
            return true;
        } finally {
            setSending(false);
        }
    };

    // Mark messages as read
    const markMessagesAsRead=(userId) => {
        setMessages(prevMessages =>
            prevMessages.map(message => ({
                ...message,
                is_read: true
            }))
        );
    };

    // Typing indicators
    const startTyping=() => {
        chatSocket.startTyping(chatId);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Auto-stop typing after 3 seconds
        typingTimeoutRef.current=setTimeout(() => {
            stopTyping();
        }, 3000);
    };

    const stopTyping=() => {
        chatSocket.stopTyping(chatId);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current=null;
        }
    };

    // Scroll to bottom of messages
    const scrollToBottom=() => {
        if (messagesEndRef.current) {
            try {
                // ✅ SOLO ESTO: Arreglar para móvil y web
                if (messagesEndRef.current.scrollIntoView) {
                    // Web
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                } else if (messagesEndRef.current.scrollToEnd) {
                    // Móvil (ScrollView)
                    messagesEndRef.current.scrollToEnd({ animated: true });
                }
            } catch (error) {
                console.log('Scroll error:', error.message);
            }
        }
    };

    // Format messages for display
    const formatMessage=(message) => {
        const isOwn = message.sender_id === currentUserId;
        console.log('📝 Formatting message:', {
            messageId: message.id,
            sender_id: message.sender_id,
            currentUserId,
            isOwn
        });
        
        return {
            ...message,
            isOwn,
            senderName: message.sender?.name||'Unknown',
            time: formatMessageTime(message.created_at),
            avatar: getAvatarForUser(message.sender_id)
        };
    };

    const formatMessageTime=(timestamp) => {
        const date=new Date(timestamp);
        const now=new Date();
        const diffInHours=(now-date)/(1000*60*60);

        if (diffInHours<24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    };

    const getAvatarForUser=(userId) => {
        // This would normally come from user data
        return '👤';
    };

    return {
        messages: messages.map(formatMessage),
        loading,
        sending,
        error,
        messageError,
        onlineUsers,
        typingUsers,
        hasMoreMessages,
        messagesEndRef,
        sendMessage,
        loadMoreMessages,
        startTyping,
        stopTyping,
        scrollToBottom,
        clearMessageError: () => setMessageError(null),
        refreshMessages: () => fetchMessages(1),
    };
};

// Mock messages for development
const getMockMessages=(chatId) => {
    return [
        {
            id: 1,
            content: "Hola, ¿cómo estás?",
            created_at: new Date(Date.now()-3600000).toISOString(),
            sender_id: 2,
            is_read: true,
            sender: { id: 2, name: "Ana García" }
        },
        {
            id: 2,
            content: "¡Hola! Muy bien, gracias. ¿Y tú?",
            created_at: new Date(Date.now()-3000000).toISOString(),
            sender_id: 1,
            is_read: true,
            sender: { id: 1, name: "You" }
        },
        {
            id: 3,
            content: "Tengo una pregunta sobre la tarea de matemáticas",
            created_at: new Date(Date.now()-1800000).toISOString(),
            sender_id: 2,
            is_read: true,
            sender: { id: 2, name: "Ana García" }
        },
        {
            id: 4,
            content: "Por supuesto, ¿qué necesitas saber?",
            created_at: new Date(Date.now()-1200000).toISOString(),
            sender_id: 1,
            is_read: true,
            sender: { id: 1, name: "You" }
        },
        {
            id: 5,
            content: "No entiendo el ejercicio 3 de la página 45",
            created_at: new Date(Date.now()-600000).toISOString(),
            sender_id: 2,
            is_read: false,
            sender: { id: 2, name: "Ana García" }
        }
    ];
};