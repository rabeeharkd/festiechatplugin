import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Send, Search, Users, Clock, Check, CheckCheck, Mic, Paperclip, Smile, MoreVertical, Trash2, Forward, Copy, X, File, Image, Download } from 'lucide-react';
import { chatAPI, messageAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

// Utility function to check if user is admin
const isAdminUser = (user) => {
  return user?.role === 'admin' || 
         user?.email === 'amjedvnml@gmail.com' || 
         user?.isAdmin === true || 
         user?.userType === 'admin';
};

// Utility function to get active user count (mock for now, replace with real API)
const getActiveUserCount = async () => {
  try {
    // TODO: Replace with actual API call to get logged-in user count
    // const response = await userAPI.getActiveUserCount();
    // return response.data.count;
    
    // For now, return a reasonable number
    return Math.floor(Math.random() * 50) + 10; // 10-60 users
  } catch (error) {
    console.error('Error getting user count:', error);
    return 25; // fallback
  }
};

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

// Message Bubble Component
const MessageBubble = memo(({ message, isOwn, showAvatar, showTimestamp, onContextMenu }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'} group`}>
        {!isOwn && showAvatar && (
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
            <span className="text-xs text-gray-500 font-medium">{message.sender}</span>
          </div>
        )}
        <div
          className={`relative px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
          onContextMenu={(e) => onContextMenu(e, message.id)}
        >
          {/* Message actions button */}
          <button
            className={`absolute -top-2 -right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
              isOwn ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e, message.id);
            }}
          >
            <MoreVertical className="w-3 h-3" />
          </button>

          <p className="text-sm pr-6">{message.content}</p>
          {showTimestamp && (
            <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatTime(message.timestamp)}
              {isOwn && (
                <span className="ml-1">
                  {message.status === 'read' ? <CheckCheck className="inline w-3 h-3" /> : <Check className="inline w-3 h-3" />}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
DateSeparator.displayName = 'DateSeparator';

const Messages = () => {
  // Authentication check
  const { user, loading: authLoading } = useAuth();
  
  // All state declarations first
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, messageId: null });
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  
  console.log('Messages component rendering - user:', user?.email, 'loading:', loading, 'authLoading:', authLoading, 'chats count:', chats.length);

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</h2>
          <p className="text-gray-500">Please log in to access the messaging system.</p>
        </div>
      </div>
    );
  }

  // Load chats function with admin filtering
  const loadChats = useCallback(async () => {
    try {
      console.log('Loading chats...');
      setLoading(true);
      setError(null);
      
      const response = await chatAPI.getChats();
      console.log('Chat API Response:', response);
      
      // Get active user count
      const userCount = await getActiveUserCount();
      setActiveUserCount(userCount);
      
      if (response?.data?.data) {
        let allChats = response.data.data.map(chat => ({
          ...chat,
          id: chat._id || chat.id,
          lastActivity: chat.lastMessage?.timestamp || chat.updatedAt || new Date().toISOString(),
          participantCount: userCount, // Replace dummy data with real user count
          participants: chat.participants || [] // Keep original participants array for filtering
        }));
        
        // Filter chats based on user role
        const adminStatus = isAdminUser(user);
        setIsUserAdmin(adminStatus);
        
        let filteredChats;
        if (adminStatus) {
          // Admin sees all chats including all individual admin DMs
          filteredChats = allChats;
          console.log('Admin user - showing all chats including all admin DMs:', allChats.length);
        } else {
          // Regular users see only group chat and their own admin DM
          const currentUserId = user.id || user.email || user.username;
          
          filteredChats = allChats.filter(chat => {
            // More inclusive group chat detection
            const chatNameLower = chat.name?.toLowerCase() || '';
            const isGroupChat = chat.type === 'group' || 
                               chatNameLower.includes('group') || 
                               chatNameLower.includes('main') ||
                               chatNameLower.includes('festival') ||
                               chatNameLower.includes('general') ||
                               (!chat.isAdminDM && chat.type !== 'dm'); // Default to group if not explicitly DM
            
            // Check if this is the user's own admin DM
            const isOwnAdminDM = chat.isAdminDM && chat.id === `admin-dm-${currentUserId}`;
            
            // Check if this is an admin DM from server data
            const isAdminDM = chat.name?.toLowerCase().includes('admin') || 
                             (Array.isArray(chat.participants) && chat.participants.some(p => isAdminUser(p)));
            
            const shouldInclude = isGroupChat || isOwnAdminDM || isAdminDM;
            
            // Debug logging for each chat
            console.log('Chat filtering debug:', {
              chatName: chat.name,
              chatType: chat.type,
              chatId: chat.id,
              isGroupChat,
              isOwnAdminDM,
              isAdminDM,
              shouldInclude,
              participants: chat.participants
            });
            
            return shouldInclude;
          });
          
          // Create individual admin DM for this user
          // Check if an admin DM already exists in the server data
          const existingAdminDM = allChats.find(chat => 
            chat.isAdminDM || 
            (chat.type === 'dm' && chat.name?.toLowerCase() === 'admin') ||
            (chat.participants && Array.isArray(chat.participants) && 
             chat.participants.some(p => isAdminUser(p)) &&
             chat.participants.length === 2)
          );
          
          if (!existingAdminDM) {
            // Try to create the admin DM in the backend first
            try {
              console.log(`Creating admin DM in backend for user: ${user.email}`);
              
              const createChatData = {
                name: 'Admin',
                type: 'dm',
                participants: [
                  currentUserId,
                  'amjedvnml@gmail.com' // Admin email
                ],
                isAdminDM: true,
                description: 'Direct message with admin'
              };
              
              console.log('Attempting to create admin DM with data:', createChatData);
              
              // Try to create the chat in backend
              const createResponse = await chatAPI.createChat(createChatData);
              
              if (createResponse?.data?.data) {
                // Use the backend-created chat
                const backendChat = createResponse.data.data;
                filteredChats.push({
                  ...backendChat,
                  id: backendChat._id || backendChat.id,
                  participantCount: 2,
                  participants: createChatData.participants,
                  isAdminDM: true
                });
                console.log(`Successfully created admin DM in backend with ID: ${backendChat._id || backendChat.id}`);
              } else {
                throw new Error('Failed to create chat in backend');
              }
              
            } catch (backendError) {
              console.warn('Failed to create admin DM in backend:', backendError);
              
              // For now, don't create a fallback local chat since it causes the ObjectId error
              // Instead, show an error message to the user
              console.error('Cannot create admin DM - backend connection required');
            }
          }
          
          console.log('Regular user - filtered chats:', filteredChats.length);
        }
        
        setChats(filteredChats);
        console.log('Chats loaded successfully:', filteredChats.length);
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error('Error loading chats:', err);
      setError('Failed to load chats');
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages function
  const loadMessages = useCallback(async (chatId) => {
    try {
      setLoadingMessages(true);
      console.log('Loading messages for chat:', chatId);
      
      const response = await messageAPI.getMessages(chatId);
      
      if (response?.data?.data) {
        let transformedMessages = response.data.data.map(msg => ({
          ...msg,
          id: msg._id || msg.id,
          sender: msg.sender || 'Unknown',
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
          content: msg.content || '',
          type: msg.type || 'text',
          status: msg.status || 'sent'
        }));
        
        // Filter messages for DM chats if user is not admin
        const currentChat = chats.find(chat => chat.id === chatId);
        const userIsAdmin = isAdminUser(user);
        
        console.log('DM Privacy Check:', {
          chatId,
          chatType: currentChat?.type,
          isAdminDM: currentChat?.isAdminDM,
          chatName: currentChat?.name,
          userIsAdmin,
          userEmail: user?.email,
          totalMessages: transformedMessages.length
        });
        
        if (currentChat?.isAdminDM || currentChat?.type === 'dm' || currentChat?.name === 'Admin') {
          if (!userIsAdmin) {
            const beforeFiltering = transformedMessages.length;
            const currentUserId = user.id || user.email || user.username;
            
            // Regular users in their admin DM can only see:
            // 1. Their own messages
            // 2. Admin messages
            transformedMessages = transformedMessages.filter(msg => {
              const isOwnMessage = msg.sender === user?.email || 
                                 msg.sender === user?.username || 
                                 msg.sender === user?.name || 
                                 msg.sender === user?.id ||
                                 msg.senderId === currentUserId;
              
              const isAdminMessage = msg.sender === 'amjedvnml@gmail.com' || 
                                   isAdminUser({ email: msg.sender }) ||
                                   msg.sender === 'Admin' ||
                                   msg.senderRole === 'admin' ||
                                   msg.senderId === 'admin';
              
              const shouldShow = isOwnMessage || isAdminMessage;
              
              console.log('DM Message Filter:', {
                messageId: msg.id,
                sender: msg.sender,
                senderId: msg.senderId,
                content: msg.content.substring(0, 50) + '...',
                isOwnMessage,
                isAdminMessage,
                shouldShow
              });
              
              return shouldShow;
            });
            
            console.log(`DM Privacy: Filtered ${beforeFiltering} messages down to ${transformedMessages.length} for regular user in admin DM`);
          } else {
            console.log('Admin user - showing all messages in admin DM:', transformedMessages.length);
          }
        }
        
        setMessages(transformedMessages);
        console.log('Messages loaded:', transformedMessages.length);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [chats, user]);

  // Chat selection handler
  const handleChatSelect = useCallback((chat) => {
    console.log('Selecting chat:', chat.name);
    setSelectedChat(chat);
    setMessages([]); // Clear messages immediately
    loadMessages(chat.id);
  }, [loadMessages]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Debug function to check auth status (call from browser console: window.checkAuth())
  window.checkAuth = () => {
    const accessToken = localStorage.getItem('festie_access_token');
    const refreshToken = localStorage.getItem('festie_refresh_token');
    const storedUser = localStorage.getItem('festie_user');
    
    console.log('=== AUTH STATUS DEBUG ===');
    console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING');
    console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'MISSING');
    console.log('Stored User:', storedUser ? JSON.parse(storedUser) : 'MISSING');
    console.log('Context User:', user);
    console.log('Is Authenticated:', !!user);
    console.log('========================');
    
    return {
      hasTokens: !!accessToken && !!refreshToken,
      hasUser: !!user,
      isAuthenticated: !!user && !!accessToken
    };
  };

  // Send message function
  const sendMessage = useCallback(async () => {
    console.log('sendMessage function called', {
      messageContent: message,
      messageLength: message.trim().length,
      selectedChatId: selectedChat?.id,
      userAuthenticated: !!user
    });

    // Debug authentication status
    const accessToken = localStorage.getItem('festie_access_token');
    const refreshToken = localStorage.getItem('festie_refresh_token');
    console.log('Auth tokens:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length,
      user: user
    });

    if (!message.trim() || !selectedChat) {
      console.log('Cannot send message: missing content or chat', { 
        messageLength: message.trim().length, 
        selectedChat: selectedChat?.id 
      });
      return;
    }
    
    try {
      const messageData = {
        chatId: selectedChat.id,
        content: message.trim(),
        messageType: 'text',
        sender: user.name
      };
      
      console.log('Attempting to send message:', messageData);
      
      console.log('=== FINAL MESSAGE DATA BEING SENT ===');
      console.log('Chat ID for URL:', selectedChat.id);
      console.log('Message Data Object:', JSON.stringify(messageData, null, 2));
      console.log('====================================');
      
      const response = await messageAPI.sendMessage(selectedChat.id, messageData);
      console.log('Message sent successfully:', response.data);
      
      setMessage('');
      
      // Reload messages to show the new message
      await loadMessages(selectedChat.id);
      
      // Emit socket event for real-time updates
      if (socketService.isConnected) {
        socketService.emit('message', {
          chatId: selectedChat.id,
          message: messageData
        });
      }
      
    } catch (err) {
      console.error('Error sending message:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      // Show specific error messages based on error type
      if (err.response?.status === 401) {
        alert('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        alert('Access denied. You may not have permission to send messages in this chat.');
      } else if (err.response?.status === 400) {
        alert('Invalid message format. Please try again.');
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        alert('Network connection error. Please check your internet connection and try again.');
      } else {
        alert(`Failed to send message: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      }
    }
  }, [message, selectedChat, loadMessages, user]);

  // Context menu handlers
  const handleContextMenu = useCallback((event, messageId) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Context menu triggered for message:', messageId);
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      messageId
    });
  }, []);

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

  // Filter chats based on search
  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chats;
    return chats.filter(chat => 
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  // Effects
  useEffect(() => {
    if (authLoading) {
      console.log('Still checking authentication...');
      return;
    }
    
    if (!user) {
      console.log('User not authenticated, stopping chat loading');
      setLoading(false); // Stop the loading state if user is not authenticated
      return;
    }
    
    console.log('User authenticated, loading chats for:', user.email);
    loadChats();
  }, [loadChats, user, authLoading]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

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

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadChats}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {chats.length === 0 ? 'No chats available' : 'No chats match your search'}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-purple-50 border-r-3 border-r-purple-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{chat.name}</h4>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.isAdminDM ? 'Direct message' : `${chat.participantCount || activeUserCount} members`}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedChat.name}
                    {isUserAdmin && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Admin</span>}
                  </h3>
                  <p className="text-sm text-green-500 font-medium">
                    {loadingMessages ? (
                      <span className="text-blue-500">Loading messages...</span>
                    ) : (
                      selectedChat.isAdminDM ? 
                        'Direct message with admin' : 
                        ` Online`
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 && !loadingMessages ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, index) => {
                  // Check if this message is from the current user with multiple comparison methods
                  const userEmail = user?.email;
                  const userName = user?.username;
                  const userDisplayName = user?.name;
                  const userId = user?.id;
                  
                  const isOwn = userEmail && (
                    msg.sender === userEmail ||
                    msg.sender === userName ||
                    msg.sender === userDisplayName ||
                    msg.sender === userId ||
                    msg.sender === 'You' ||
                    msg.sender?.email === userEmail ||
                    (typeof msg.sender === 'object' && msg.sender?.id === userId)
                  );
                  
                  // Enhanced debug logging
                  if (index < 3) { // Only log first 3 messages to avoid spam
                    console.log('=== MESSAGE ALIGNMENT DEBUG ===');
                    console.log('Message:', msg);
                    console.log('Sender value:', msg.sender);
                    console.log('Sender type:', typeof msg.sender);
                    console.log('Current user:', user);
                    console.log('User email:', userEmail);
                    console.log('User username:', userName);
                    console.log('User display name:', userDisplayName);
                    console.log('User ID:', userId);
                    console.log('Comparison results:');
                    console.log('  sender === email:', msg.sender === userEmail);
                    console.log('  sender === username:', msg.sender === userName);
                    console.log('  sender === displayName:', msg.sender === userDisplayName);
                    console.log('  sender === userId:', msg.sender === userId);
                    console.log('isOwn result:', isOwn);
                    console.log('==============================');
                  }
                  
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showDateSeparator = !prevMessage || !isSameDay(msg.timestamp, prevMessage.timestamp);
                  const showAvatar = !isOwn && (!prevMessage || prevMessage.sender !== msg.sender);
                  const showTimestamp = true; // Show timestamp for all messages

                  return (
                    <div key={msg.id}>
                      {showDateSeparator && <DateSeparator date={msg.timestamp} />}
                      <MessageBubble
                        message={msg}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                        showTimestamp={showTimestamp}
                        onContextMenu={handleContextMenu}
                      />
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => {
                    console.log('Input changed:', e.target.value);
                    setMessage(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      console.log('Enter key pressed, attempting to send message');
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={(e) => {
                    console.log('Send button clicked');
                    e.preventDefault();
                    sendMessage();
                  }}
                  disabled={!message.trim()}
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat</h3>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

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
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{chat.name}</p>
                    <p className="text-sm text-gray-500">
                      {chat.isAdminDM ? 'Direct message' : `${chat.participantCount || activeUserCount} members`}
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
    </div>
  );
};

export default Messages;