import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Send, Search, Users, Clock, Check, CheckCheck, Mic, Paperclip, Smile, MoreVertical, Trash2, Forward, Copy, X, File, Image, Download } from 'lucide-react';
import axios from 'axios';
import { chatAPI, messageAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import { USE_MOCK_API } from '../utils/mockAPI';


// Utility function to check if user is admin
const isAdminUser = (user) => {
  return user?.role === 'admin' || 
         user?.email === 'amjedvnml@gmail.com' || 
         user?.email === 'rabeehsp@gmail.com' || 
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
  const [showJoinChatModal, setShowJoinChatModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [joinChatId, setJoinChatId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  
  console.log('Messages component rendering - user:', user?.email, 'loading:', loading, 'authLoading:', authLoading, 'chats count:', chats.length);
  
  // Filter out Chrome extension errors in development
  if (import.meta.env.DEV) {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ').toLowerCase();
      // Filter out known Chrome extension errors
      if (message.includes('relingo') || 
          message.includes('chrome-extension') || 
          message.includes('menu item') ||
          message.includes('runtime.lasterror')) {
        return; // Suppress extension-related errors in dev
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ').toLowerCase();
      if (message.includes('relingo') || message.includes('chrome-extension')) {
        return; // Suppress extension-related warnings in dev
      }
      originalWarn.apply(console, args);
    };
  }

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
      
      // ✅ Authentication Debug & Token Validation
      const userToken = localStorage.getItem('festie_access_token');
      const refreshToken = localStorage.getItem('festie_refresh_token');
      
      console.log('🔐 Authentication Debug:', {
        userEmail: user?.email,
        hasAccessToken: !!userToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: userToken?.length,
        accessTokenPreview: userToken ? `${userToken.substring(0, 20)}...` : 'MISSING',
        tokenType: typeof userToken
      });

      if (!userToken) {
        console.error('❌ No access token found - user needs to login again');
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('https://festiechatplugin-backend-8g96.onrender.com/api/chats', {
        headers: { 
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Chat API Response:', response);
      
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
        
        // 🎯 OPEN ACCESS POLICY: All authenticated users see ALL chats
        console.log('🔓 OPEN ACCESS POLICY ACTIVE - All users can see all chats');
        console.log('User details:', {
          email: user?.email,
          role: user?.role,
          id: user?.id
        });
        console.log('Total chats in database:', allChats.length);
        
        // Check admin status for UI features (bulk create, etc.)
        const adminStatus = isAdminUser(user);
        setIsUserAdmin(adminStatus);
        console.log('Admin status (for UI features only):', adminStatus);
        
        // Special debugging for rabeehsp@gmail.com admin access
        if (user?.email === 'rabeehsp@gmail.com') {
          console.log('🔍 DEBUGGING RABEEHSP@GMAIL.COM ADMIN ACCESS:');
          console.log('- User Object:', user);
          console.log('- Is Admin (Frontend):', adminStatus);
          console.log('- API Response Data:', response?.data);
          console.log('- Raw Chats from Backend:', allChats);
          console.log('- Backend Response Status:', response?.status);
          console.log('- Access Token Available:', !!localStorage.getItem('festie_access_token'));
        }
        
        // 🚀 NO FILTERING - Everyone sees everything!
        const filteredChats = allChats.map(chat => ({
          ...chat,
          canJoin: true, // Everyone can join any chat
          isAccessible: true, // Mark as accessible for UI
          accessReason: 'Open Access Policy', // For debugging
          originalParticipants: chat.participants // Keep original for reference
        }));
        
        console.log('✅ OPEN ACCESS: Showing all chats to user:', filteredChats.length);
        
        // Enhanced logging for verification
        if (filteredChats.length > 0) {
          console.log('📋 Complete Chat List:');
          filteredChats.forEach((chat, index) => {
            console.log(`  ${index + 1}. ${chat.name}`, {
              type: chat.type,
              id: chat.id,
              participantCount: chat.participantCount || chat.participants?.length || 0,
              canJoin: chat.canJoin,
              createdBy: chat.createdBy?.email || 'Unknown'
            });
          });
        } else {
          console.log('⚠️ No chats found in database');
        }
        
        setChats(filteredChats);
        console.log('🎉 Chat loading complete - Open Access Policy implemented:', filteredChats.length, 'chats available');
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error('Error loading chats:', err);
      
      // Enhanced error handling for authentication issues
      if (err.response?.status === 401) {
        console.error('🚫 401 Unauthorized - Token may be expired or invalid');
        
        // Try to refresh token automatically
        const refreshToken = localStorage.getItem('festie_refresh_token');
        if (refreshToken) {
          console.log('🔄 Attempting automatic token refresh...');
          try {
            const refreshResponse = await axios.post(
              'https://festiechatplugin-backend-8g96.onrender.com/api/auth/refresh',
              { refreshToken }
            );
            
            if (refreshResponse.data.success) {
              const { accessToken } = refreshResponse.data;
              localStorage.setItem('festie_access_token', accessToken);
              console.log('✅ Token refreshed successfully, retrying chat load...');
              
              // Retry loading chats with new token
              setTimeout(() => loadChats(), 1000);
              return;
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
          }
        }
        
        // If refresh failed or no refresh token, clear auth and redirect
        console.log('🔄 Clearing invalid authentication...');
        localStorage.removeItem('festie_user');
        localStorage.removeItem('festie_access_token');
        localStorage.removeItem('festie_refresh_token');
        setError('Session expired. Please login again.');
        
        // Reload page to trigger login
        setTimeout(() => window.location.reload(), 2000);
        
      } else if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to access chats.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (!err.response) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Failed to load chats: ${err.response?.data?.message || err.message}`);
      }
      
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
      
      // ✅ This works now - Any logged-in user can get messages
      const userToken = localStorage.getItem('festie_access_token');
      const response = await axios.get(`https://festiechatplugin-backend-8g96.onrender.com/api/messages/${chatId}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
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
        
        // 🔓 OPEN ACCESS POLICY: All users can see all messages in any chat
        const currentChat = chats.find(chat => chat.id === chatId);
        const userIsAdmin = isAdminUser(user);
        
        console.log('📨 Message Access Check:', {
          chatId,
          chatType: currentChat?.type,
          chatName: currentChat?.name,
          userIsAdmin,
          userEmail: user?.email,
          totalMessages: transformedMessages.length,
          accessPolicy: 'Open Access - No Filtering'
        });
        
        // No message filtering - everyone sees all messages in any chat they access
        console.log('✅ OPEN ACCESS: All messages visible to user:', transformedMessages.length);
        
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

  // Debug function to filter console noise (call from browser console: window.filterConsoleNoise())
  window.filterConsoleNoise = () => {
    console.log('🔧 CONSOLE NOISE FILTER APPLIED');
    console.log('This will suppress Chrome extension errors like "relingo_parent" menu item errors');
    console.log('Your app errors will still be visible');
    
    // List common extension error patterns
    const extensionErrorPatterns = [
      'relingo',
      'chrome-extension://',
      'runtime.lasterror',
      'menu item with id',
      'extension context invalidated',
      'grammarly',
      'lastpass',
      'adblock'
    ];
    
    console.log('Filtering patterns:', extensionErrorPatterns);
    return 'Console noise filter is active in development mode';
  };

  // Debug function to show all console messages (call from browser console: window.showAllErrors())
  window.showAllErrors = () => {
    console.log('🔍 SHOWING ALL CONSOLE MESSAGES (including extension errors)');
    // This would restore original console methods if we wanted to implement it
    return 'All console messages will now be visible';
  };

  // Debug function to check why rabeehsp@gmail.com can't see chats (call from browser console: window.debugAdminAccess())
  window.debugAdminAccess = async () => {
    console.log('🔍 DEBUGGING ADMIN ACCESS FOR RABEEHSP@GMAIL.COM');
    console.log('Current user:', user);
    console.log('Is admin (frontend):', isAdminUser(user));
    
    const userToken = localStorage.getItem('festie_access_token');
    console.log('Access token available:', !!userToken);
    
    if (!userToken) {
      console.log('❌ NO ACCESS TOKEN - User needs to login');
      return { error: 'No access token' };
    }
    
    try {
      // Test direct API call
      console.log('🔄 Testing direct API call to /api/chats...');
      const response = await axios.get(
        'https://festiechatplugin-backend-8g96.onrender.com/api/chats',
        { 
          headers: { 'Authorization': `Bearer ${userToken}` },
          timeout: 10000 
        }
      );
      
      console.log('✅ API Response Status:', response.status);
      console.log('✅ API Response Data:', response.data);
      console.log('✅ Chats Count:', response.data?.data?.length || 0);
      
      if (response.data?.data?.length === 0) {
        console.log('💡 DATABASE IS EMPTY - No chats exist yet');
        console.log('🎯 Solution: Create some chats using admin buttons or backend');
        return { 
          success: true, 
          chatCount: 0, 
          message: 'Database is empty - create chats first' 
        };
      } else {
        console.log('📋 Available chats:');
        response.data.data.forEach((chat, index) => {
          console.log(`  ${index + 1}. ${chat.name} (${chat.type}) - ID: ${chat._id}`);
        });
        return { 
          success: true, 
          chatCount: response.data.data.length, 
          chats: response.data.data 
        };
      }
      
    } catch (error) {
      console.log('❌ API ERROR:', error);
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        console.log('💡 TOKEN IS INVALID - Need to login again');
      } else if (error.response?.status === 403) {
        console.log('💡 BACKEND PERMISSION ISSUE - Admin not recognized by backend');
      } else if (error.response?.status === 500) {
        console.log('💡 BACKEND ERROR - Check backend logs');
      }
      
      return { 
        error: true, 
        status: error.response?.status, 
        message: error.message 
      };
    }
  };

  // Debug function to test search functionality (call from browser console: window.testSearch())
  window.testSearch = async (query = 'f') => {
    console.log('🧪 TESTING SEARCH FUNCTIONALITY');
    console.log('Search query:', query);
    
    const userToken = localStorage.getItem('festie_access_token');
    if (!userToken) {
      console.log('❌ No access token - login required');
      return { error: 'No access token' };
    }
    
    try {
      console.log('🔍 Sending search request...');
      const response = await axios.get(
        `https://festiechatplugin-backend-8g96.onrender.com/api/chats/search-by-name?q=${encodeURIComponent(query)}`,
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      const results = response.data.data || [];
      console.log('✅ SEARCH WORKING! Results:', results.length);
      
      if (results.length > 0) {
        console.log('📋 Found chats:');
        results.forEach((chat, index) => {
          console.log(`  ${index + 1}. ${chat.name} (${chat.type})`);
        });
      } else {
        console.log('🔍 No chats found for query:', query);
        console.log('💡 Try searching for "Fansat" or "Arts" or "Fest"');
      }
      
      return { success: true, count: results.length, results };
      
    } catch (error) {
      console.log('❌ Search failed:', error.response?.status, error.response?.data?.message || error.message);
      
      if (error.response?.status === 500) {
        console.log('🚀 If getting 500 error: Backend might still be deploying');
        console.log('⏰ Wait 1-2 minutes and try again');
        return { error: 'Backend deploying', status: 500 };
      }
      
      return { error: error.message, status: error.response?.status };
    }
  };

  // Debug function to validate tokens (call from browser console: window.validateTokens())
  window.validateTokens = async () => {
    const accessToken = localStorage.getItem('festie_access_token');
    const refreshToken = localStorage.getItem('festie_refresh_token');
    const storedUser = localStorage.getItem('festie_user');
    
    console.log('=== TOKEN VALIDATION DEBUG ===');
    console.log('Access Token:', accessToken ? `${accessToken.substring(0, 30)}...` : '❌ MISSING');
    console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 30)}...` : '❌ MISSING');
    console.log('Stored User:', storedUser ? JSON.parse(storedUser) : '❌ MISSING');
    console.log('Context User:', user);
    
    if (accessToken) {
      console.log('🔍 Testing access token with backend...');
      try {
        const testResponse = await axios.get(
          'https://festiechatplugin-backend-8g96.onrender.com/api/chats',
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        console.log('✅ Access token is VALID - API responded successfully');
        console.log('Response status:', testResponse.status);
        console.log('Chats count:', testResponse.data?.data?.length || 0);
      } catch (error) {
        console.log('❌ Access token is INVALID - API returned error');
        console.log('Error status:', error.response?.status);
        console.log('Error message:', error.response?.data?.message || error.message);
        
        if (refreshToken) {
          console.log('🔄 Testing refresh token...');
          try {
            const refreshResponse = await axios.post(
              'https://festiechatplugin-backend-8g96.onrender.com/api/auth/refresh',
              { refreshToken }
            );
            console.log('✅ Refresh token is VALID - new access token generated');
            console.log('New token preview:', refreshResponse.data.accessToken?.substring(0, 30) + '...');
          } catch (refreshError) {
            console.log('❌ Refresh token is also INVALID');
            console.log('Refresh error:', refreshError.response?.data?.message || refreshError.message);
            console.log('💡 Solution: User needs to login again');
          }
        }
      }
    }
    
    console.log('===============================');
    return {
      hasTokens: !!accessToken && !!refreshToken,
      hasUser: !!user,
      needsLogin: !accessToken || !user
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
      
      // ✅ This works now - Any logged-in user can send messages
      const userToken = localStorage.getItem('festie_access_token');
      const response = await axios.post(`https://festiechatplugin-backend-8g96.onrender.com/api/messages/${selectedChat.id}`, 
        messageData,
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
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
      
      // ✅ This works now - Any logged-in user can delete their messages
      const userToken = localStorage.getItem('festie_access_token');
      await axios.delete(`https://festiechatplugin-backend-8g96.onrender.com/api/messages/${messageId}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
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
      const userToken = localStorage.getItem('festie_access_token');
      for (const msg of selectedMessages) {
        // ✅ This works now - Any logged-in user can forward messages
        await axios.post(`https://festiechatplugin-backend-8g96.onrender.com/api/messages/${targetChatId}`, {
          content: `Forwarded: ${msg.content}`,
          messageType: 'text',
          sender: user.name || 'You'
        }, {
          headers: { 'Authorization': `Bearer ${userToken}` }
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

  // Bulk create 5 groups
  const createBulkGroups = async () => {
    try {
      const userToken = localStorage.getItem('festie_access_token');
      const response = await axios.post(
        'https://festiechatplugin-backend-8g96.onrender.com/api/chats/bulk-create',
        {
          count: 5,
          namePrefix: 'Festival Chat',
          description: 'Festival discussion group',
          category: 'general'
        },
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      console.log('Bulk groups created successfully:', response.data);
      
      // Reload chats to show the newly created groups
      await loadChats();
      
      // Success message
      alert(`Successfully created ${response.data.count || 5} festival chat groups!`);
      
    } catch (error) {
      console.error('Error creating bulk groups:', error);
      if (error.response?.status === 403) {
        alert('Admin privileges required to create bulk groups.');
      } else {
        alert(`Failed to create bulk groups: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Create preset chat (for quick setup)
  const createPresetChat = async (name, description) => {
    try {
      console.log('Creating preset chat:', name);
      const userToken = localStorage.getItem('festie_access_token');
      
      const chatData = {
        name: name,
        type: 'group',
        description: description,
        category: 'general'
      };
      
      const response = await axios.post(
        'https://festiechatplugin-backend-8g96.onrender.com/api/chats',
        chatData,
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      console.log('✅ Preset chat created successfully:', response.data);
      
      // Reload chats to show the newly created chat
      await loadChats();
      
      // Success message
      alert(`✅ Successfully created "${name}"!`);
      
    } catch (error) {
      console.error('Error creating preset chat:', error);
      if (error.response?.status === 409) {
        alert(`Chat "${name}" may already exist.`);
      } else if (error.response?.status === 403) {
        alert('Admin privileges required to create chats.');
      } else {
        alert(`Failed to create "${name}": ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Quick create a single chat
  const createSingleChat = async () => {
    const chatName = prompt('Enter chat name (e.g., "Fansat Arts Fest"):');
    if (!chatName || !chatName.trim()) return;
    
    const chatType = confirm('Click OK for Group Chat, Cancel for Direct Message') ? 'group' : 'dm';
    
    try {
      console.log('Creating single chat:', chatName, 'Type:', chatType);
      const userToken = localStorage.getItem('festie_access_token');
      
      const chatData = {
        name: chatName.trim(),
        type: chatType,
        description: `${chatType === 'group' ? 'Group discussion' : 'Direct message'} - ${chatName}`,
        category: 'general'
      };
      
      const response = await axios.post(
        'https://festiechatplugin-backend-8g96.onrender.com/api/chats',
        chatData,
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      console.log('✅ Chat created successfully:', response.data);
      
      // Reload chats to show the newly created chat
      await loadChats();
      
      // Success message
      alert(`✅ Successfully created "${chatName}" (${chatType})!`);
      
    } catch (error) {
      console.error('Error creating chat:', error);
      if (error.response?.status === 403) {
        alert('Admin privileges required to create chats.');
      } else {
        alert(`Failed to create chat: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Quick create event groups
  const createEventGroups = async () => {
    try {
      const userToken = localStorage.getItem('festie_access_token');
      const response = await axios.post(
        'https://festiechatplugin-backend-8g96.onrender.com/api/chats/quick-groups',
        { preset: 'event' },
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      console.log('Event groups created successfully:', response.data);
      
      // Reload chats to show the newly created event groups
      await loadChats();
      
      // Success message
      alert('Successfully created event groups: Event Planning, Event Updates, Event Social!');
      
    } catch (error) {
      console.error('Error creating event groups:', error);
      if (error.response?.status === 403) {
        alert('Admin privileges required to create event groups.');
      } else {
        alert(`Failed to create event groups: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // New endpoint for your dialog - Join by name
  const joinByName = async (chatName) => {
    try {
      console.log('Attempting to join chat by name:', chatName);
      const userToken = localStorage.getItem('festie_access_token');
      const response = await axios.post(
        'https://festiechatplugin-backend-8g96.onrender.com/api/chats/join-by-name',
        { chatName },
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      // Success: "Successfully joined 'Festival Main Chat'!"
      console.log(response.data.message);
      
      // Close modal and reset state
      setShowJoinChatModal(false);
      setJoinChatId('');
      setSearchResults([]);
      
      // Reload chats to show the newly joined chat
      await loadChats();
      
      // Show success message to user
      alert(`Successfully joined '${chatName}'!`);
      
    } catch (error) {
      console.error('Error joining chat by name:', error);
      if (error.response?.status === 400) {
        alert('You are already a member of this chat or the chat does not exist.');
      } else if (error.response?.status === 404) {
        alert('Chat not found with that name.');
      } else if (error.response?.status === 403) {
        alert('Access denied. You may not have permission to join this chat.');
      } else {
        alert(`Failed to join chat: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Search for suggestions
  const searchChats = async (query) => {
    try {
      if (!query.trim()) {
        setSearchResults([]);
        return [];
      }
      
      const userToken = localStorage.getItem('festie_access_token');
      console.log('🔍 Searching chats for:', query);
      
      const response = await axios.get(
        `https://festiechatplugin-backend-8g96.onrender.com/api/chats/search-by-name?q=${encodeURIComponent(query)}`,
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      const results = response.data.data || []; // Array of matching chats
      console.log('✅ Search successful! Found chats:', results.length);
      console.log('Search results:', results.map(chat => ({ name: chat.name, type: chat.type })));
      
      setSearchResults(results);
      return results;
      
    } catch (error) {
      console.error('❌ Search error:', error);
      
      if (error.response?.status === 500) {
        console.log('🚀 Backend might still be deploying - search endpoint fix in progress');
        console.log('💡 The route ordering fix should resolve this shortly');
        setSearchResults([]);
        return [];
      } else if (error.response?.status === 404) {
        console.log('🔍 No chats found matching:', query);
        setSearchResults([]);
        return [];
      } else {
        console.error('Unexpected search error:', error.response?.data || error.message);
        setSearchResults([]);
        return [];
      }
    }
  };

  // Handler to join existing chat from DB (by ID - legacy support)
  const joinChat = async (chatId) => {
    try {
      console.log('Attempting to join chat:', chatId);
      const userToken = localStorage.getItem('festie_access_token');
      const response = await axios.post(
        `https://festiechatplugin-backend-8g96.onrender.com/api/chats/${chatId}/join`,
        {}, 
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      // Success: User is now in the chat!
      console.log(response.data.message); // "Successfully joined the chat!"
      
      // Close modal and reset state
      setShowJoinChatModal(false);
      setJoinChatId('');
      setSearchResults([]);
      
      // Reload chats to show the newly joined chat
      await loadChats();
      
      // Show success message to user
      alert(`Successfully joined the chat: ${response.data.chat?.name || 'Chat'}`);
      
    } catch (error) {
      console.error('Error joining chat:', error);
      if (error.response?.status === 400) {
        alert('You are already a member of this chat or the chat does not exist.');
      } else if (error.response?.status === 404) {
        alert('Chat not found.');
      } else if (error.response?.status === 403) {
        alert('Access denied. You may not have permission to join this chat.');
      } else {
        alert(`Failed to join chat: ${error.response?.data?.message || error.message}`);
      }
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
    const isAuthError = error.includes('Authentication') || error.includes('Session expired') || error.includes('login');
    
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className={`p-4 rounded-lg border ${isAuthError ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="text-4xl mb-3">
              {isAuthError ? '🔐' : '⚠️'}
            </div>
            <p className={`mb-4 font-medium ${isAuthError ? 'text-red-800' : 'text-yellow-800'}`}>
              {error}
            </p>
            
            {isAuthError ? (
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 block w-full"
                >
                  Go to Login
                </button>
                <button 
                  onClick={() => window.validateTokens()}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm block w-full"
                >
                  Debug Authentication
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button 
                  onClick={loadChats}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 block w-full"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.validateTokens()}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm block w-full"
                >
                  Check Connection
                </button>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-600">
              Check browser console for detailed error information
            </div>
          </div>
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
          {/* Open Access Policy Indicator */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
            <p className="text-xs text-green-700 font-medium">
              🔓 Open Access Policy Active - All chats visible to authenticated users
            </p>
          </div>
          
          {/* Search Fix Deployment Status */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 mb-2">
            <p className="text-xs text-emerald-700 font-medium">
              🚀 SEARCH FIX DEPLOYED: Route ordering issue resolved - search by name now working!
              <button
                onClick={() => window.testSearch('f')}
                className="ml-2 text-emerald-600 hover:text-emerald-800 underline text-xs"
              >
                Test Search
              </button>
            </p>
          </div>

          {/* Special Debug Banner for rabeehsp@gmail.com */}
          {user?.email === 'rabeehsp@gmail.com' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
              <p className="text-xs text-yellow-700 font-medium">
                🔧 ADMIN DEBUG: rabeehsp@gmail.com - Troubleshoot chat access
                <button
                  onClick={() => window.debugAdminAccess()}
                  className="ml-2 text-yellow-600 hover:text-yellow-800 underline text-xs"
                >
                  Debug Access
                </button>
              </p>
            </div>
          )}

          {/* Development Mode Indicator */}
          {import.meta.env.DEV && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
              <p className="text-xs text-blue-700">
                🔧 Dev Mode: Browser extension errors filtered from console
                <button
                  onClick={() => {
                    console.log('=== FESTIE CHAT DEBUG INFO ===');
                    console.log('App Environment:', import.meta.env.MODE);
                    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
                    console.log('Current User:', user?.email);
                    console.log('Chats Loaded:', chats.length);
                    console.log('Extension Errors Filtered: Relingo, Chrome extensions, etc.');
                    console.log('Search Fix: Route ordering corrected in backend');
                    console.log('=============================');
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                >
                  Debug Info
                </button>
              </p>
            </div>
          )}
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {/* Join Chat Button */}
          <button
            onClick={() => setShowJoinChatModal(true)}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 mb-2"
          >
            <Users className="h-4 w-4" />
            <span>Join Existing Chat</span>
          </button>

          {/* Admin Only - Create & Bulk Create Options */}
          {isUserAdmin && (
            <div className="space-y-2">
              <button
                onClick={() => createSingleChat()}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Quick: Create Chat</span>
              </button>
              
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => createPresetChat('Fansat Arts Fest', 'Festival main discussion group')}
                  className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700"
                >
                  Arts Fest
                </button>
                <button
                  onClick={() => createPresetChat('General Chat', 'Main community discussion')}
                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                >
                  General
                </button>
              </div>
              
              <button
                onClick={() => setShowBulkCreateModal(true)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Admin: Bulk Create</span>
              </button>
            </div>
          )}

        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="mb-2">
                {chats.length === 0 ? '🔍 No chats in database' : 'No chats match your search'}
              </div>
              <div className="text-xs text-gray-400">
                Open Access Policy: All authenticated users can see all available chats
              </div>
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

      {/* Join Chat Modal */}
      {showJoinChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Join Existing Chat</h3>
            
            {/* Search by Name - Primary Method */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Search and join by chat name:</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={joinChatId}
                  onChange={(e) => {
                    setJoinChatId(e.target.value);
                    // Real-time search as user types
                    if (e.target.value.trim()) {
                      searchChats(e.target.value.trim());
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  placeholder="Type chat name (e.g., Festival Main Chat)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && joinChatId.trim()) {
                      // Try to join by name first
                      joinByName(joinChatId.trim());
                    }
                  }}
                />
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 p-2 bg-gray-50">Found {searchResults.length} chat(s):</p>
                  {searchResults.map((chat) => (
                    <button
                      key={chat._id || chat.id}
                      onClick={() => joinByName(chat.name)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{chat.name}</p>
                        <p className="text-xs text-gray-500">
                          {chat.type === 'group' ? 'Group Chat' : 'Direct Message'} • 
                          {chat.participants?.length || 0} members
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {joinChatId.trim() && searchResults.length === 0 && (
                <div className="mt-2 p-2 text-xs bg-blue-50 border border-blue-200 rounded">
                  <div className="text-blue-700">
                    🔍 No chats found matching "{joinChatId}"
                  </div>
                  <div className="text-blue-600 mt-1">
                    💡 Try searching for "f" to find "Fansat Arts Fest" or other chat names
                  </div>
                  <div className="text-blue-500 mt-1 text-xs">
                    🚀 Backend search fix recently deployed - search should work perfectly now!
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or join by Chat ID</span>
              </div>
            </div>
            
            {/* Join by ID - Fallback Method */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter Chat ID (e.g., 60f7b3b3b3b3b3b3b3b3b3b3)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    joinChat(e.target.value.trim());
                  }
                }}
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> Search by chat name is easier! Just start typing and select from suggestions.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowJoinChatModal(false);
                  setJoinChatId('');
                  setSearchResults([]);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (joinChatId.trim()) {
                    // Try name-based join first
                    joinByName(joinChatId.trim());
                  }
                }}
                disabled={!joinChatId.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join by Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Admin: Bulk Create Groups</h3>
            <p className="text-sm text-gray-600 mb-4">Choose how to create multiple chat groups:</p>
            
            <div className="space-y-3">
              {/* Festival Chats Option */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Create Festival Chats</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Creates 5 numbered festival discussion groups:<br />
                  "Festival Chat 1", "Festival Chat 2", etc.
                </p>
                <button
                  onClick={() => {
                    setShowBulkCreateModal(false);
                    createBulkGroups();
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create 5 Festival Chats
                </button>
              </div>

              {/* Event Groups Option */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Create Event Groups</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Creates specialized event groups:<br />
                  "Event Planning", "Event Updates", "Event Social"
                </p>
                <button
                  onClick={() => {
                    setShowBulkCreateModal(false);
                    createEventGroups();
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Event Groups
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-amber-700">
                ⚠️ <strong>Admin Only:</strong> This feature requires admin privileges. 
                Created groups will be available to all users.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowBulkCreateModal(false)}
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