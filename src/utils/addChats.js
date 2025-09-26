// Utility script to add new chats to the backend
import { chatAPI } from '../services/api';

// Function to create a new group chat
export const createGroupChat = async (chatData) => {
  try {
    console.log('Creating group chat:', chatData.name);
    const response = await chatAPI.createChat(chatData);
    console.log('Group chat created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating group chat:', error);
    throw error;
  }
};

// Function to create a new DM chat
export const createDMChat = async (chatData) => {
  try {
    console.log('Creating DM chat:', chatData.name);
    const response = await chatAPI.createChat(chatData);
    console.log('DM chat created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating DM chat:', error);
    throw error;
  }
};

// Function to add all new chats using bulk endpoint
export const addNewChats = async () => {
  try {
    console.log('🚀 Starting to add new chats...');

    // Prepare all chats for bulk creation
    const allNewChats = [
      // 1. New group chat
      {
        name: 'NeuroFest Planning Committee',
        type: 'group',
        participants: [], // Will be populated by backend with current user
        lastMessage: {
          content: 'Welcome to the NeuroFest Planning Committee! Let\'s make this event amazing.',
          sender: 'Admin'
        }
      },
      // 2. Four new DM chats
      {
        name: 'Sarah Johnson',
        type: 'dm',
        participants: [], // Backend will handle DM participant logic
        lastMessage: {
          content: 'Hey! How are the preparations going?',
          sender: 'Sarah Johnson'
        }
      },
      {
        name: 'Mike Chen',
        type: 'dm',
        participants: [],
        lastMessage: {
          content: 'Can we discuss the venue setup tomorrow?',
          sender: 'Mike Chen'
        }
      },
      {
        name: 'Emma Rodriguez',
        type: 'dm',
        participants: [],
        lastMessage: {
          content: 'The marketing materials look great!',
          sender: 'Emma Rodriguez'
        }
      },
      {
        name: 'Alex Thompson',
        type: 'dm',
        participants: [],
        lastMessage: {
          content: 'Thanks for the help with the registration system!',
          sender: 'Alex Thompson'
        }
      }
    ];

    // Use bulk creation endpoint
    const response = await chatAPI.post('/chats/bulk', {
      chats: allNewChats
    });

    console.log('🎉 All chats created successfully!');
    return response.data;

  } catch (error) {
    console.error('❌ Error adding chats:', error);
    throw error;
  }
};

// Function to test chat creation (you can call this from console)
export const testChatCreation = async () => {
  try {
    const result = await addNewChats();
    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    return null;
  }
};