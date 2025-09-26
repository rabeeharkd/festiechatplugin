// Mock chats data
const mockChats = [
  {
    _id: 'chat-1',
    id: 'chat-1',
    name: 'General Chat',
    type: 'group',
    participants: ['user1', 'user2', 'admin', 'user3', 'user4'],
    participantCount: 45,
    lastMessage: {
      content: 'Welcome to NeuroFest 2024!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      sender: 'Admin'
    },
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'chat-2',
    id: 'chat-2',
    name: 'Admin',
    type: 'dm',
    isAdminDM: true,
    participants: ['current-user', 'amjedvnml@gmail.com'],
    participantCount: 2,
    lastMessage: {
      content: 'Hello! How can I help you?',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      sender: 'Admin'
    },
    lastActivity: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    _id: 'chat-3',
    id: 'chat-3',
    name: 'Event Coordinators',
    type: 'group',
    participants: ['admin1', 'admin2', 'coordinator1', 'coordinator2'],
    participantCount: 12,
    lastMessage: {
      content: 'Meeting at 3 PM for event planning',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      sender: 'Event Coordinator'
    },
    lastActivity: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  },
  
  // New group chat
  {
    _id: 'chat-4',
    id: 'chat-4',
    name: 'NeuroFest Planning Committee',
    type: 'group',
    participants: ['admin', 'organizer1', 'organizer2', 'volunteer1'],
    participantCount: 15,
    lastMessage: {
      content: 'Welcome to the NeuroFest Planning Committee! Let\'s make this event amazing.',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      sender: 'Admin'
    },
    lastActivity: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString()
  },
  
  // New DM chats
  {
    _id: 'dm-sarah',
    id: 'dm-sarah',
    name: 'Sarah Johnson',
    type: 'dm',
    participants: ['currentUser', 'sarah.johnson'],
    participantCount: 2,
    lastMessage: {
      content: 'Hey! How are the preparations going?',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      sender: 'Sarah Johnson'
    },
    lastActivity: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString()
  },
  
  {
    _id: 'dm-mike',
    id: 'dm-mike',
    name: 'Mike Chen',
    type: 'dm',
    participants: ['currentUser', 'mike.chen'],
    participantCount: 2,
    lastMessage: {
      content: 'Can we discuss the venue setup tomorrow?',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      sender: 'Mike Chen'
    },
    lastActivity: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString()
  },
  
  {
    _id: 'dm-emma',
    id: 'dm-emma',
    name: 'Emma Rodriguez',
    type: 'dm',
    participants: ['currentUser', 'emma.rodriguez'],
    participantCount: 2,
    lastMessage: {
      content: 'The marketing materials look great!',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      sender: 'Emma Rodriguez'
    },
    lastActivity: new Date(Date.now() - 2400000).toISOString(),
    updatedAt: new Date(Date.now() - 2400000).toISOString()
  },
  
  {
    _id: 'dm-alex',
    id: 'dm-alex',
    name: 'Alex Thompson',
    type: 'dm',
    participants: ['currentUser', 'alex.thompson'],
    participantCount: 2,
    lastMessage: {
      content: 'Thanks for the help with the registration system!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      sender: 'Alex Thompson'
    },
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Mock messages data
const mockMessages = {
  'chat-1': [
    {
      _id: 'msg-1',
      id: 'msg-1',
      content: 'Welcome to NeuroFest 2024! We are excited to have you all here.',
      sender: 'Admin',
      senderId: 'amjedvnml@gmail.com',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      type: 'text',
      status: 'read'
    },
    {
      _id: 'msg-2',
      id: 'msg-2',
      content: 'Looking forward to all the amazing events!',
      sender: 'Participant 1',
      senderId: 'participant1@email.com',
      timestamp: new Date(Date.now() - 6900000).toISOString(),
      createdAt: new Date(Date.now() - 6900000).toISOString(),
      type: 'text',
      status: 'read'
    },
    {
      _id: 'msg-3',
      id: 'msg-3',
      content: 'When does the coding competition start?',
      sender: 'Participant 2',
      senderId: 'participant2@email.com',
      timestamp: new Date(Date.now() - 6600000).toISOString(),
      createdAt: new Date(Date.now() - 6600000).toISOString(),
      type: 'text',
      status: 'read'
    },
    {
      _id: 'msg-4',
      id: 'msg-4',
      content: 'The coding competition starts tomorrow at 10 AM. Check the schedule for more details!',
      sender: 'Admin',
      senderId: 'amjedvnml@gmail.com',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      type: 'text',
      status: 'read'
    }
  ],
  'chat-2': [
    {
      _id: 'admin-msg-1',
      id: 'admin-msg-1',
      content: 'Hello! Welcome to your personal admin chat. How can I assist you today?',
      sender: 'Admin',
      senderId: 'amjedvnml@gmail.com',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      type: 'text',
      status: 'read'
    },
    {
      _id: 'admin-msg-2',
      id: 'admin-msg-2',
      content: 'Feel free to ask any questions about the festival or report any issues.',
      sender: 'Admin',
      senderId: 'amjedvnml@gmail.com',
      timestamp: new Date(Date.now() - 7100000).toISOString(),
      createdAt: new Date(Date.now() - 7100000).toISOString(),
      type: 'text',
      status: 'read'
    }
  ],
  'chat-3': [
    {
      _id: 'coord-msg-1',
      id: 'coord-msg-1',
      content: 'Team meeting scheduled for today at 3 PM',
      sender: 'Event Coordinator',
      senderId: 'coordinator@email.com',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      type: 'text',
      status: 'read'
    }
  ]
};

// Mock API for development when backend is not available
export const mockAPI = {
  login: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login for development
    if (email && password) {
      return {
        data: {
          success: true,
          user: {
            id: '1',
            name: 'Demo User',
            email: email,
            role: email.includes('admin') ? 'admin' : 'user'
          },
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now()
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },
  
  register: async (name, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: {
        success: true,
        user: {
          id: '1',
          name: name,
          email: email,
          role: 'user'
        },
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      }
    };
  },

  // Chat API endpoints
  getChats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        success: true,
        data: mockChats
      }
    };
  },

  getMessages: async (chatId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const messages = mockMessages[chatId] || [];
    return {
      data: {
        success: true,
        data: messages
      }
    };
  },

  sendMessage: async (chatId, messageData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newMessage = {
      _id: 'msg-' + Date.now(),
      id: 'msg-' + Date.now(),
      content: messageData.content,
      sender: messageData.sender || 'You',
      senderId: 'current-user',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: messageData.messageType || 'text',
      status: 'sent'
    };

    // Add message to mock data
    if (!mockMessages[chatId]) {
      mockMessages[chatId] = [];
    }
    mockMessages[chatId].push(newMessage);

    // Update last message in chat
    const chat = mockChats.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = {
        content: messageData.content,
        timestamp: newMessage.timestamp,
        sender: messageData.sender || 'You'
      };
      chat.lastActivity = newMessage.timestamp;
    }

    return {
      data: {
        success: true,
        data: newMessage
      }
    };
  },

  deleteMessage: async (messageId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find and remove message from mock data
    for (const chatId in mockMessages) {
      const messageIndex = mockMessages[chatId].findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        mockMessages[chatId].splice(messageIndex, 1);
        break;
      }
    }

    return {
      data: {
        success: true
      }
    };
  }
};

// Toggle between mock and real API
export const USE_MOCK_API = false;