import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet, apiPost } from '../utils/fetchWithAuth';
import { API } from '../config/api';
import chatSocket from '../services/chatSocket';

export const useChats=(userType='student') => {
    const [chats, setChats]=useState([]);
    const [loading, setLoading]=useState(true);
    const [refreshing, setRefreshing]=useState(false);
    const [error, setError]=useState(null);
    const [currentUserId, setCurrentUserId]=useState(null);
    const [socketConnected, setSocketConnected]=useState(false);

    // Initialize WebSocket connection and get current user
    useEffect(() => {
        initializeChat();
        return () => {
            chatSocket.disconnect();
        };
    }, []);

    const initializeChat=async () => {
        try {
            // Get current user data
            const userData=await AsyncStorage.getItem('userData');
            if (userData) {
                const user=JSON.parse(userData);
                setCurrentUserId(user.id);
            }

            // Connect to WebSocket
            await chatSocket.connect();

            // Listen for connection status
            const unsubscribeConnection=chatSocket.on('connection_status', (data) => {
                setSocketConnected(data.connected);
            });

            // Listen for new messages to update chat list
            const unsubscribeNewMessage=chatSocket.on('new_message', (data) => {
                updateChatWithNewMessage(data);
            });

            return () => {
                unsubscribeConnection();
                unsubscribeNewMessage();
            };

        } catch (error) {
            console.error('Error initializing chat:', error);
        }
    };

    // Update chat list when new message arrives
    const updateChatWithNewMessage=(data) => {
        const { message, chatId }=data;

        setChats(prevChats => {
            return prevChats.map(chat => {
                if (chat.id===chatId) {
                    return {
                        ...chat,
                        last_message: message,
                        unread_count: chat.unread_count+1,
                        updated_at: message.created_at
                    };
                }
                return chat;
            });
        });
    };

    // Fetch chats from API
    const fetchChats=async () => {
        try {
            setLoading(true);
            setError(null);

            const response=await apiGet(API.ENDPOINTS.CHATS.LIST);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result=await response.json();

            if (result.success) {
                // Transform API data to match UI expectations
                const transformedChats=result.data.chats.map(chat => ({
                    id: chat.id,
                    name: userType==='teacher'
                        ? `${chat.student.name} ${chat.student.lastname}`
                        :`${chat.teacher.name} ${chat.teacher.lastname}`,
                    lastMessage: chat.last_message?.content||'No hay mensajes',
                    lastMessageTime: chat.last_message?.created_at||chat.created_at,
                    unreadCount: chat.unread_count||0,
                    avatar: userType==='teacher'? '👩‍🎓':'👨‍🏫',
                    participantId: userType==='teacher'? chat.student_id:chat.teacher_id,
                    student_id: chat.student_id,
                    teacher_id: chat.teacher_id,
                    participant: userType==='teacher'? chat.student:chat.teacher
                }));

                setChats(transformedChats);
            } else {
                throw new Error(result.message||'Error fetching chats');
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
            setError(error.message);

            // Fallback to mock data for development
            const mockChats=getMockChats(userType);
            setChats(mockChats);
        } finally {
            setLoading(false);
        }
    };

    // Create or get existing chat
    const createChat=async (participantId, participantName, participantRole) => {
        try {
            console.log('Creating chat with:', { participantId, participantName, participantRole });

            if (!participantId) {
                throw new Error('Participant ID not found');
            }
            // Determine student_id and teacher_id based on current user type and participant
            let requestData={
                targetUserId: participantId
            }

            const response=await apiPost(API.ENDPOINTS.CHATS.CREATE, requestData);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result=await response.json();

            if (result.success) {
                const chatData=result.data.chat;

                // Transform the chat data to match UI expectations
                const newChat={
                    id: chatData.id,
                    name: participantName,
                    lastMessage: "Nuevo chat creado",
                    lastMessageTime: chatData.created_at,
                    unreadCount: 0,
                    avatar: userType==='teacher'? '👩‍🎓':'👨‍🏫',
                    participantId: participantId,
                    student_id: chatData.student_id,
                    teacher_id: chatData.teacher_id,
                };

                // Add to local state if it's not already there
                setChats(prevChats => {
                    const existingChat=prevChats.find(chat => chat.id===newChat.id);
                    if (existingChat) {
                        return prevChats;
                    }
                    return [newChat, ...prevChats];
                });

                return newChat;
            } else {
                throw new Error(result.message||'Error creating chat');
            }
        } catch (error) {
            console.error('Error creating chat:', error);

            // For development, create a mock chat
            const mockChat={
                id: `mock_${Date.now()}`,
                name: participantName,
                lastMessage: "Nuevo chat creado",
                lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unreadCount: 0,
                avatar: userType==='teacher'? '👩‍🎓':'👨‍🏫',
                participantId: participantId
            };

            setChats(prevChats => [mockChat, ...prevChats]);
            return mockChat;
        }
    };

    // Mark chat as read
    const markAsRead=async (chatId) => {
        try {
            const endpoint=API.ENDPOINTS.CHATS.MARK_READ(chatId);
            const response=await apiPost(endpoint,null, {method: "PATCH"});

            if (response.ok) {
                // Also mark as read via WebSocket
                chatSocket.markMessagesAsRead(chatId);

                // Update local state
                setChats(prevChats =>
                    prevChats.map(chat =>
                        chat.id===chatId
                            ? { ...chat, unreadCount: 0 }
                            :chat
                    )
                );
            }
        } catch (error) {
            console.error('Error marking chat as read:', error);
        }
    };

    // Refresh chats
    const onRefresh=async () => {
        setRefreshing(true);
        await fetchChats();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchChats();
    }, []);

    return {
        chats,
        loading,
        refreshing,
        error,
        socketConnected,
        currentUserId,
        fetchChats,
        createChat,
        markAsRead,
        onRefresh,
        // WebSocket functions
        chatSocket,
        joinChat: (chatId) => chatSocket.joinChat(chatId),
        leaveChat: (chatId) => chatSocket.leaveChat(chatId),
        sendMessage: (chatId, content) => chatSocket.sendMessage(chatId, content),
        startTyping: (chatId) => chatSocket.startTyping(chatId),
        stopTyping: (chatId) => chatSocket.stopTyping(chatId),
    };
};

// Mock data generator
const getMockChats=(userType) => {
    const teacherChats=[
        {
            id: "1",
            name: "Ana García",
            lastMessage: "¿Podrías explicar el último tema?",
            lastMessageTime: "10:30 AM",
            unreadCount: 2,
            avatar: "👩‍🎓",
            participantId: "student_1"
        },
        {
            id: "2",
            name: "Carlos López",
            lastMessage: "Gracias por la explicación",
            lastMessageTime: "9:15 AM",
            unreadCount: 0,
            avatar: "👨‍🎓",
            participantId: "student_2"
        },
        {
            id: "3",
            name: "María Rodríguez",
            lastMessage: "¿Cuándo es la entrega?",
            lastMessageTime: "8:45 AM",
            unreadCount: 1,
            avatar: "👩‍🎓",
            participantId: "student_3"
        }
    ];

    const studentChats=[
        {
            id: "1",
            name: "Mtro. Eduardo De Avila",
            lastMessage: "Recuerden llevar su practica hecha.",
            lastMessageTime: "10:30 AM",
            unreadCount: 1,
            avatar: "👨‍🏫",
            participantId: "teacher_1"
        },
        {
            id: "2",
            name: "Mtro. Julian Rodriguez",
            lastMessage: "La entrega es el viernes",
            lastMessageTime: "9:15 AM",
            unreadCount: 0,
            avatar: "👨‍🏫",
            participantId: "teacher_2"
        },
        {
            id: "3",
            name: "Mtro. Pedro Lopez",
            lastMessage: "Revisen el material que subí",
            lastMessageTime: "8:45 AM",
            unreadCount: 2,
            avatar: "👨‍🏫",
            participantId: "teacher_3"
        },
        {
            id: "4",
            name: "Mtro. Federico Alvarez",
            lastMessage: "La clase de mañana es presencial",
            lastMessageTime: "Yesterday",
            unreadCount: 0,
            avatar: "👨‍🏫",
            participantId: "teacher_4"
        },
        {
            id: "5",
            name: "Mtro. Ivan Ramirez",
            lastMessage: "Buen trabajo en la presentación",
            lastMessageTime: "Yesterday",
            unreadCount: 0,
            avatar: "👨‍🏫",
            participantId: "teacher_5"
        },
        {
            id: "6",
            name: "Mtro. Alejandro Montes",
            lastMessage: "No olviden la tarea para el viernes",
            lastMessageTime: "2 days ago",
            unreadCount: 1,
            avatar: "👨‍🏫",
            participantId: "teacher_6"
        }
    ];

    return userType==='teacher'? teacherChats:studentChats;
};