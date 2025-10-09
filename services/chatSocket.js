import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config/api';

class ChatSocketService {
    constructor() {
        this.socket=null;
        this.token=null;
        this.isConnected=false;
        this.eventListeners=new Map();
        this.currentUserId=null;
    }

    // Initialize connection with authentication
    async connect() {
        try {
            // Get WebSocket URL (remove /api from the end and add WebSocket path)
            const wsUrl=CONFIG.API_URL.replace('/api', '');

            console.log('Connecting to WebSocket:', wsUrl);

            this.socket=io(wsUrl, {
                transports: ['websocket', 'polling'],
                timeout: 10000,
                forceNew: true,
            });

            this.setupEventListeners();

        } catch (error) {
            console.error('Error connecting to chat socket:', error);
            throw error;
        }
    }

    // Setup default event listeners
    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Connected to chat server');
            this.isConnected=true;
            this.emit('connection_status', { connected: true });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from chat server:', reason);
            this.isConnected=false;
            this.emit('connection_status', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔥 Connection error:', error);
            this.isConnected=false;
            this.emit('connection_error', { error: error.message });
        });

        // Chat-specific events
        this.socket.on('new_message', (data) => {
            console.log('📨 New message received:', data);
            this.emit('new_message', data);
        });

        this.socket.on('user_joined_chat', (data) => {
            console.log('👤 User joined chat:', data);
            this.emit('user_joined_chat', data);
        });

        this.socket.on('user_left_chat', (data) => {
            console.log('👤 User left chat:', data);
            this.emit('user_left_chat', data);
        });

        this.socket.on('messages_read', (data) => {
            console.log('✅ Messages marked as read:', data);
            this.emit('messages_read', data);
        });

        this.socket.on('user_typing', (data) => {
            console.log('✍️ User typing:', data);
            this.emit('user_typing', data);
        });

        this.socket.on('user_online_status', (data) => {
            console.log('🟢 User online status:', data);
            this.emit('user_online_status', data);
        });

        this.socket.on('error', (data) => {
            console.error('🚨 Socket error:', data);
            this.emit('socket_error', data);
        });
    }

    // Event emitter for components
    emit(event, data) {
        const listeners=this.eventListeners.get(event)||[];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    // Subscribe to events
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);

        // Return unsubscribe function
        return () => {
            const listeners=this.eventListeners.get(event)||[];
            const index=listeners.indexOf(callback);
            if (index>-1) {
                listeners.splice(index, 1);
            }
        };
    }

    // Remove all listeners for an event
    off(event) {
        this.eventListeners.delete(event);
    }

    // Chat-specific methods
    joinChat(chatId) {
        if (!this.isConnected||!this.socket) {
            console.warn('Socket not connected, cannot join chat');
            return;
        }

        console.log(`🏠 Joining chat: ${chatId}`);
        this.socket.emit('join_chat', chatId);
    }

    leaveChat(chatId) {
        if (!this.isConnected||!this.socket) {
            console.warn('Socket not connected, cannot leave chat');
            return;
        }

        console.log(`🚪 Leaving chat: ${chatId}`);
        this.socket.emit('leave_chat', chatId);
    }

    sendMessage(chatId, content) {
        if (!this.isConnected||!this.socket) {
            console.warn('Socket not connected, cannot send message');
            return false;
        }

        if (!this.currentUserId) {
            console.warn('No current user ID, cannot send message');
            return false;
        }

        const messageData={
            content: content.trim(),
            chat_id: chatId,
            sender_id: this.currentUserId,
        };

        console.log('📤 Sending message:', messageData);
        this.socket.emit('send_message', messageData);
        return true;
    }

    markMessagesAsRead(chatId) {
        if (!this.isConnected||!this.socket) {
            console.warn('Socket not connected, cannot mark messages as read');
            return;
        }

        console.log(`✅ Marking messages as read for chat: ${chatId}`);
        this.socket.emit('mark_messages_read', { chatId });
    }

    startTyping(chatId) {
        if (!this.isConnected||!this.socket) return;

        this.socket.emit('typing_start', { chatId });
    }

    stopTyping(chatId) {
        if (!this.isConnected||!this.socket) return;

        this.socket.emit('typing_stop', { chatId });
    }

    // Connection management
    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting from chat server');
            this.socket.disconnect();
            this.socket=null;
            this.isConnected=false;
            this.eventListeners.clear();
        }
    }

    // Check connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            hasSocket: !!this.socket,
            socketId: this.socket?.id||null,
        };
    }

    // Reconnect if needed
    async reconnect() {
        this.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        await this.connect();
    }
}

// Export singleton instance
export const chatSocket=new ChatSocketService();
export default chatSocket;