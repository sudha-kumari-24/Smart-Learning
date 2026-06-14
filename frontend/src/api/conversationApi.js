import axios from 'axios';

const API_URL = 'http://localhost:5000/api/conversations';


const api = axios.create({
  baseURL: API_URL,
});

// Adding token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Saving conversation session
export const saveConversationSession = async (sessionData) => {
  try {
    const response = await api.post('/save', sessionData);
    return response.data;
  } catch (error) {
    console.error('Error saving conversation session:', error);
    throw error;
  }
};


// Getting user's conversation history
export const getConversationHistory = async () => {
  try {
    const response = await api.get('/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
};

// Getting specific session details
export const getSessionDetails = async (sessionId) => {
  try {
    const response = await api.get(`/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching session details:', error);
    throw error;
  }
};

export default {
  saveConversationSession,
  getConversationHistory,
  getSessionDetails
};