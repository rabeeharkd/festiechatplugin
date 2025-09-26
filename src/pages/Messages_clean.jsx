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

// Message Bubble Component
const MessageBubble = memo(({ message, isOwn, showAvatar, showTimestamp }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && showAvatar && (
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
            <span className="text-xs text-gray-500 font-medium">{message.sender}</span>
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm">{message.content}</p>
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
  // All state declarations first
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  
  console.log('Messages component rendering - loading:', loading, 'chats count:', chats.length);

  // Load chats function
  const loadChats = useCallback(async () => {
    try {
      console.log('Loading chats...');
      setLoading(true);
      setError(null);
      
      const response = await chatAPI.getChats();
      console.log('Chat API Response:', response);
      
      if (response?.data?.data) {
        const transformedChats = response.data.data.map(chat => ({
          ...chat,
          id: chat._id || chat.id,
          lastActivity: chat.lastMessage?.timestamp || chat.updatedAt || new Date().toISOString()
        }));
        
        setChats(transformedChats);
        console.log('Chats loaded successfully:', transformedChats.length);
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
        const transformedMessages = response.data.data.map(msg => ({
          ...msg,
          id: msg._id || msg.id,
          sender: msg.sender || 'Unknown',
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
          content: msg.content || '',
          type: msg.type || 'text',
          status: msg.status || 'sent'
        }));
        
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
  }, []);

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

  // Send message function
  const sendMessage = useCallback(async () => {
    if (!message.trim() || !selectedChat) return;
    
    try {
      const messageData = {
        content: message.trim(),
        type: 'text'
      };
      
      await messageAPI.sendMessage(selectedChat.id, messageData);
      setMessage('');
      loadMessages(selectedChat.id); // Reload messages
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }, [message, selectedChat, loadMessages]);

  // Filter chats based on search
  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chats;
    return chats.filter(chat => 
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  // Effects
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

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
                      {chat.participants?.length || 0} participants
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
                  <h3 className="text-lg font-semibold text-gray-900">{selectedChat.name}</h3>
                  <p className="text-sm text-green-500 font-medium">
                    {loadingMessages ? (
                      <span className="text-blue-500">Loading messages...</span>
                    ) : (
                      `${selectedChat.participants?.length || 0} participants • Online`
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
                  const isOwn = msg.sender === 'You'; // Adjust this logic as needed
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
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
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
    </div>
  );
};

export default Messages;