import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io('https://festiechatplugin-backend.onrender.com', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Chat events
  joinChat(chatId) {
    this.socket?.emit('join_chat', { chatId });
  }

  leaveChat(chatId) {
    this.socket?.emit('leave_chat', { chatId });
  }

  sendMessage(chatId, content, messageType = 'text', replyTo = null, attachments = []) {
    this.socket?.emit('send_message', {
      chatId,
      content,
      messageType,
      replyTo,
      attachments
    });
  }

  reactToMessage(messageId, reaction) {
    this.socket?.emit('react_to_message', { messageId, reaction });
  }

  forwardMessage(messageId, targetChatIds, comment = '') {
    this.socket?.emit('forward_message', { messageId, targetChatIds, comment });
  }

  markMessagesRead(chatId, messageIds) {
    this.socket?.emit('mark_messages_read', { chatId, messageIds });
  }

  // Typing indicators
  startTyping(chatId) {
    this.socket?.emit('typing_start', { chatId });
  }

  stopTyping(chatId) {
    this.socket?.emit('typing_stop', { chatId });
  }

  // User status
  getOnlineUsers() {
    this.socket?.emit('get_online_users');
  }

  // Event listeners
  onNewMessage(callback) {
    this.socket?.on('new_message', callback);
  }

  onMessageReactionUpdated(callback) {
    this.socket?.on('message_reaction_updated', callback);
  }

  onUserTyping(callback) {
    this.socket?.on('user_typing', callback);
  }

  onMessagesRead(callback) {
    this.socket?.on('messages_read', callback);
  }

  onUserOnline(callback) {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback) {
    this.socket?.on('user_offline', callback);
  }

  onOnlineUsers(callback) {
    this.socket?.on('online_users', callback);
  }

  onUserJoinedChat(callback) {
    this.socket?.on('user_joined_chat', callback);
  }

  onUserLeftChat(callback) {
    this.socket?.on('user_left_chat', callback);
  }

  onMessageForwarded(callback) {
    this.socket?.on('message_forwarded', callback);
  }

  onError(callback) {
    this.socket?.on('error', callback);
  }

  // Remove event listeners
  off(event, callback) {
    this.socket?.off(event, callback);
  }

  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;