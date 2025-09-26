import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Send, Search, Users, Clock, Check, CheckCheck, Mic, Paperclip, Smile, MoreVertical, Trash2, Forward, Copy, X, File, Image, Download } from 'lucide-react';
import { chatAPI, messageAPI } from '../services/api';
import socketService from '../services/socket';

// Date utility functions
const formatMessageDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const isThisYear = date.getFullYear() === today.getFullYear();
  
  if (isToday) {
    return 'Today';
  } else if (isYesterday) {
    return 'Yesterday';
  } else if (isThisYear) {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  } else {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

// Date Separator Component
const DateSeparator = memo(({ date }) => (
  <div className="flex items-center justify-center my-4">
    <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">
      {formatMessageDate(date)}
    </div>
  </div>
));

DateSeparator.displayName = 'DateSeparator';

// Memoized Message Bubble Component for better performance
const MessageBubble = memo(({ msg, index, messages, onContextMenu }) => {
  const isCurrentUser = msg.sender === 'You';
  const showSender = !isCurrentUser && (index === 0 || messages[index - 1].sender !== msg.sender);
  
  // Enhanced time formatting
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'} group`}>
        {showSender && (
          <p className="text-xs text-gray-500 mb-1 px-3">{msg.sender}</p>
        )}
        <div 
          className={`relative px-4 py-2 rounded-2xl shadow-sm cursor-pointer ${
            isCurrentUser 
              ? 'bg-purple-600 text-white rounded-br-md' 
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          }`}
          onContextMenu={(e) => onContextMenu(e, msg.id)}
        >
          {/* Message actions button */}
          <button
            className={`absolute -top-2 -right-2 p-1 rounded-full opacity-70 group-hover:opacity-100 transition-opacity ${
              isCurrentUser ? 'bg-purple-700 hover:bg-purple-800 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e, msg.id);
            }}
          >
            <MoreVertical className="w-3 h-3" />
          </button>
          
          {/* Message content */}
          <div className="pr-6">
            <p className="text-sm leading-relaxed">{msg.content}</p>
            <div className={`flex items-center justify-end mt-1 text-xs ${
              isCurrentUser ? 'text-purple-200' : 'text-gray-500'
            }`}>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(msg.timestamp)}
              </span>
              {isCurrentUser && (
                <CheckCheck className="w-3 h-3 ml-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

const Messages = () => {
  try {
    console.log('Messages component initializing');
    const [selectedChat, setSelectedChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, messageId: null });
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [messageCache, setMessageCache] = useState(new Map()); // Cache messages by chatId
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    console.log('Messages component render - loading:', loading, 'error:', error, 'chats:', chats.length);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadChats();
    setupSocketListeners();
  }, []);

  // Load messages when a chat is selected
  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      console.log('useEffect: Loading messages for selected chat:', selectedChat.name);
      loadMessagesForChat(selectedChat.id);
    }
  }, [selectedChat?.id, loadMessagesForChat]);

  // Preload messages for top chats to improve performance
  useEffect(() => {
    if (chats.length > 0 && messageCache.size === 0) {
      console.log('Preloading messages for top chats');
      // Preload messages for first 2 chats after initial load
      const topChats = chats.slice(0, 2);
      topChats.forEach((chat, index) => {
        if (!messageCache.has(chat.id)) {
          // Stagger the preloading to avoid overwhelming the server
          setTimeout(() => {
            console.log('Preloading messages for chat:', chat.name);
            loadMessagesForChat(chat.id);
          }, index * 1000); // 1 second delay between each preload
        }
      });
    }
  }, [chats, messageCache, loadMessagesForChat]);

  // Debounced scroll to bottom
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages.length]); // Only trigger on message count change, not content

  // Optimized chat selection with instant feedback
  const handleChatSelect = useCallback((chat) => {
    console.log('Selecting chat:', chat.name);
    // Instant UI feedback
    setSelectedChat(chat);
    
    // Show cached messages immediately or clear for loading state
    if (messageCache.has(chat.id)) {
      console.log('Using cached messages for:', chat.name);
      setMessages(messageCache.get(chat.id));
    } else {
      console.log('No cache, clearing messages for:', chat.name);
      setMessages([]); // Clear previous messages immediately
    }
  }, [messageCache]);

  // Separate function for loading messages to avoid circular dependency
  const loadMessagesForChat = useCallback(async (chatId) => {
    // Check cache first for instant loading
    if (messageCache.has(chatId)) {
      console.log('Loading messages from cache for chat:', chatId);
      setMessages(messageCache.get(chatId));
      socketService.joinChat(chatId);
      return;
    }

    try {
      setLoadingMessages(true);
      console.log('Loading messages from API for chat:', chatId);
      
      // Use Promise.race to timeout long requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const response = await Promise.race([
        messageAPI.getMessages(chatId),
        timeoutPromise
      ]);
      
      // Transform the data to match frontend expectations
      const transformedMessages = (response.data.data || []).map(msg => ({
        ...msg,
        id: msg._id || msg.id,
        sender: msg.sender || 'Unknown',
        timestamp: msg.timestamp || msg.createdAt,
        content: msg.content || '',
        type: msg.type || 'text',
        status: msg.status || 'sent'
      }));
      
      // Cache the messages
      setMessageCache(prev => new Map(prev.set(chatId, transformedMessages)));
      setMessages(transformedMessages);
      socketService.joinChat(chatId);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [messageCache]);

  const loadChats = useCallback(async () => {
    try {
      console.log('Starting to load chats...');
      setLoading(true);
      setError(null);
      
      const response = await chatAPI.getChats();
      console.log('Chat API Response:', response);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      // Transform the data to match frontend expectations
      const transformedChats = (response.data.data || []).map(chat => ({
        ...chat,
        id: chat._id || chat.id, // Map MongoDB _id to id
        lastActivity: chat.lastMessage?.timestamp || chat.updatedAt || new Date().toISOString()
      }));
      
      console.log('Transformed chats:', transformedChats.length);
      setChats(transformedChats);
      setError(null);
    } catch (err) {
      console.error('Error loading chats:', err);
      setError('Failed to load chats. Please check your connection.');
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId) => {
    // Check cache first for instant loading
    if (messageCache.has(chatId)) {
      console.log('Loading messages from cache for chat:', chatId);
      setMessages(messageCache.get(chatId));
      socketService.joinChat(chatId);
      return;
    }

    try {
      setLoadingMessages(true);
      console.log('Loading messages from API for chat:', chatId);
      
      // Use Promise.race to timeout long requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const response = await Promise.race([
        messageAPI.getMessages(chatId),
        timeoutPromise
      ]);
      
      // Transform the data to match frontend expectations
      const transformedMessages = (response.data.data || []).map(msg => ({
        ...msg,
        id: msg._id || msg.id,
        sender: msg.sender || 'Unknown',
        timestamp: msg.timestamp || msg.createdAt,
        content: msg.content || '',
        type: msg.type || 'text',
        status: msg.status || 'sent'
      }));
      
      // Cache the messages
      setMessageCache(prev => new Map(prev.set(chatId, transformedMessages)));
      setMessages(transformedMessages);
      socketService.joinChat(chatId);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [messageCache]);

  const setupSocketListeners = () => {
    // Socket listeners for real-time features
  };

  // Memoize filtered chats to avoid recalculating on every render
  const filteredChats = useMemo(() => {
    if (!searchTerm) return chats;
    return chats.filter(chat => 
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now().toString(),
      chat: selectedChat.id,
      content: message.trim(),
      sender: 'You',
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sending'
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    try {
      const response = await messageAPI.sendMessage(selectedChat.id, {
        content: newMessage.content,
        type: 'text',
        sender: 'You'
      });
      
      console.log('Message sent successfully:', response);
      
      // Reload messages to get the persisted version from database
      await loadMessages(selectedChat.id);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
    }
  }, [message, selectedChat, loadMessages]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setShowFilePreview(true);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendFiles = async () => {
    if (selectedFiles.length === 0 || !selectedChat) return;

    try {
      for (const file of selectedFiles) {
        // Create a file message
        const fileMessage = {
          id: Date.now().toString() + Math.random(),
          chat: selectedChat.id,
          content: file.name,
          sender: 'You',
          timestamp: new Date().toISOString(),
          type: 'file',
          fileData: {
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file) // For preview
          },
          status: 'sent'
        };

        // Add to messages immediately
        setMessages(prev => [...prev, fileMessage]);

        // TODO: Upload to backend
        // const formData = new FormData();
        // formData.append('file', file);
        // await messageAPI.sendFile(selectedChat.id, formData);
      }

      // Clear selected files and close preview
      setSelectedFiles([]);
      setShowFilePreview(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Error sending files:', err);
      alert('Failed to send files');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Context menu triggered for message:', messageId);
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      messageId: messageId
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, messageId: null });
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      console.log('Attempting to delete message:', messageId);
      
      // Call backend API to delete message from database
      await messageAPI.deleteMessage(messageId);
      console.log('Message deleted from backend successfully');
      
      // Reload messages to get the updated state from backend
      await loadMessages(selectedChat.id);
      
      // Reload chats to update the sidebar with correct lastMessage
      await loadChats();
      
      closeContextMenu();
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message');
    }
  };

  const handleForwardMessage = (messageId) => {
    const messageToForward = messages.find(msg => msg.id === messageId);
    if (messageToForward) {
      setSelectedMessages([messageToForward]);
      setShowForwardModal(true);
      closeContextMenu();
    }
  };

  const handleCopyMessage = (messageId) => {
    const messageToCopy = messages.find(msg => msg.id === messageId);
    if (messageToCopy) {
      navigator.clipboard.writeText(messageToCopy.content);
      closeContextMenu();
    }
  };

  const handleForwardToChat = async (targetChatId) => {
    try {
      for (const msg of selectedMessages) {
        await messageAPI.sendMessage(targetChatId, {
          content: `Forwarded: ${msg.content}`,
          type: 'text',
          sender: 'You'
        });
      }
      setSelectedMessages([]);
      setShowForwardModal(false);
      alert('Message(s) forwarded successfully!');
    } catch (err) {
      console.error('Error forwarding message:', err);
      alert('Failed to forward message');
    }
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        closeContextMenu();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
          <p className="mt-2 text-sm text-gray-500">Chats loaded: {chats.length}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              loadChats();
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 text-red-600 text-sm">{error}</div>
          )}
          {filteredChats.map((chat) => {
            // Generate avatar colors based on chat name
            const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'];
            const colorIndex = chat.name.charCodeAt(0) % colors.length;
            const avatarColor = colors[colorIndex];
            
            // Get initials for avatar
            const getInitials = (name) => {
              return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
            };
            
            // Format timestamp
            const formatTime = (timestamp) => {
              const date = new Date(timestamp);
              const now = new Date();
              const diffInHours = (now - date) / (1000 * 60 * 60);
              
              if (diffInHours < 24) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else if (diffInHours < 168) { // 7 days
                return date.toLocaleDateString([], { weekday: 'short' });
              } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
              }
            };
            
            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-purple-50 border-r-3 border-r-purple-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar with status indicator */}
                  <div className="relative">
                    <div className={`w-12 h-12 ${avatarColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                      {chat.type === 'group' ? <Users className="w-6 h-6" /> : getInitials(chat.name)}
                    </div>
                    {/* Online status indicator (green dot) */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {chat.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastActivity)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 flex-1 min-w-0">
                        {chat.lastMessage && (
                          <>
                            <span className="text-xs text-gray-500 font-medium">
                              {chat.lastMessage.sender}:
                            </span>
                            <p className="text-sm text-gray-600 truncate">
                              {chat.lastMessage.content}
                            </p>
                          </>
                        )}
                        {!chat.lastMessage && (
                          <p className="text-sm text-gray-400 italic">No messages yet</p>
                        )}
                      </div>
                      
                      {/* Message status indicators */}
                      <div className="flex items-center space-x-1 ml-2">
                        {chat.lastMessage && chat.lastMessage.sender === 'You' && (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        )}
                        {chat.isMuted && (
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {chats.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {/* Use same avatar logic as in chat list */}
                    <div className={`w-10 h-10 ${(() => {
                      const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'];
                      const colorIndex = selectedChat.name.charCodeAt(0) % colors.length;
                      return colors[colorIndex];
                    })()} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                      {selectedChat.type === 'group' ? 
                        <Users className="w-5 h-5" /> : 
                        selectedChat.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
                      }
                    </div>
                    {/* Online status */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedChat.name}</h3>
                    <p className="text-sm text-green-500 font-medium">
                      {loadingMessages ? (
                        <span className="text-blue-500 flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                          Loading messages...
                        </span>
                      ) : (
                        selectedChat.type === 'group' 
                          ? `${selectedChat.participants?.length || 0} participants • Online` 
                          : 'Online'
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Header actions */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, index) => {
                const showDateSeparator = index === 0 || !isSameDay(messages[index - 1].timestamp, msg.timestamp);
                
                return (
                  <div key={`${msg.id}-container`}>
                    {showDateSeparator && (
                      <DateSeparator key={`date-${msg.id}`} date={msg.timestamp} />
                    )}
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      index={index}
                      messages={messages}
                      onContextMenu={handleContextMenu}
                    />
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={sendMessage} className="flex items-end space-x-3">
                {/* Attachment and emoji buttons */}
                <div className="flex space-x-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Message input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                
                {/* Send button and voice message */}
                <div className="flex space-x-1">
                  {message.trim() ? (
                    <button
                      type="submit"
                      className="p-3 bg-purple-600 text-white hover:bg-purple-700 rounded-full transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-32"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              console.log('Copy clicked for message:', contextMenu.messageId);
              handleCopyMessage(contextMenu.messageId);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
          <button
            onClick={() => {
              console.log('Forward clicked for message:', contextMenu.messageId);
              handleForwardMessage(contextMenu.messageId);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Forward className="w-4 h-4" />
            <span>Forward</span>
          </button>
          <button
            onClick={() => {
              console.log('Delete clicked for message:', contextMenu.messageId);
              handleDeleteMessage(contextMenu.messageId);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Files</h3>
              <button
                onClick={() => {
                  setShowFilePreview(false);
                  setSelectedFiles([]);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFilePreview(false);
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendFiles}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Send {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Forward Message</h3>
            <p className="text-sm text-gray-600 mb-4">Select a chat to forward the message to:</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {chats.filter(chat => chat.id !== selectedChat?.id).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleForwardToChat(chat.id)}
                  className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <div className={`w-10 h-10 ${(() => {
                    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'];
                    const colorIndex = chat.name.charCodeAt(0) % colors.length;
                    return colors[colorIndex];
                  })()} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                    {chat.type === 'group' ? 
                      <Users className="w-5 h-5" /> : 
                      chat.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{chat.name}</p>
                    <p className="text-sm text-gray-500">
                      {chat.participants?.length || 0} participants
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowForwardModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('Messages component error:', error);
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Something went wrong loading the messages</p>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default Messages;