
import axios from 'axios';
import { mockAPI, USE_MOCK_API } from '../utils/mockAPI';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  timeout: 15000, // Increased timeout for network reliability
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send httpOnly cookie for refreshToken
});

// Attach accessToken to requests if available
api.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const accessToken = localStorage.getItem('festie_access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If token is expired (401) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('festie_refresh_token');
      
      if (refreshToken) {
        try {
          // Import axios directly for refresh token call to avoid circular dependency
          const axios = (await import('axios')).default;
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken }
          );
          
          if (response.data.success) {
            const { accessToken } = response.data;
            localStorage.setItem('festie_access_token', accessToken);
            
            // Retry the original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear all tokens and redirect to login
          localStorage.removeItem('festie_user');
          localStorage.removeItem('festie_access_token');
          localStorage.removeItem('festie_refresh_token');
          window.location.reload();
        }
      }
    }
    
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('Backend server error - check backend logs');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const chatAPI = {
  getChats: () => USE_MOCK_API ? mockAPI.getChats() : api.get('/chats'),
  getChat: (id) => api.get(`/chats/${id}`),
  createChat: (data) => api.post('/chats', data),
  updateChat: (id, data) => api.put(`/chats/${id}`, data),
  deleteChat: (id) => api.delete(`/chats/${id}`),
  addParticipant: (id, participants) => api.post(`/chats/${id}/participants`, { participants }),
  removeParticipant: (chatId, participantId) => api.delete(`/chats/${chatId}/participants/${participantId}`),
};

export const messageAPI = {
  getMessages: (chatId, params) => USE_MOCK_API ? mockAPI.getMessages(chatId, params) : api.get(`/messages/${chatId}`, { params }),
  sendMessage: (chatId, data) => USE_MOCK_API ? mockAPI.sendMessage(chatId, data) : api.post(`/messages/${chatId}`, data),
  reactToMessage: (messageId, reaction) => api.post(`/messages/${messageId}/react`, { reaction }),
  forwardMessage: (messageId, data) => api.post(`/messages/${messageId}/forward`, data),
  markMessagesRead: (chatId, messageIds) => api.put(`/messages/${chatId}/read`, { messageIds }),
  deleteMessage: (messageId) => USE_MOCK_API ? mockAPI.deleteMessage(messageId) : api.delete(`/messages/${messageId}`),
  searchMessages: (chatId, query) => api.get(`/messages/${chatId}/search/${query}`),
};

export const eventAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  registerForEvent: (id) => api.post(`/events/${id}/register`),
  unregisterFromEvent: (id) => api.delete(`/events/${id}/register`),
  getEventRegistrations: (id) => api.get(`/events/${id}/registrations`),
};

export const uploadAPI = {
  uploadSingle: (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (files, folder = 'general') => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('folder', folder);
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (publicId) => api.delete(`/upload/${publicId}`),
};

export default api;