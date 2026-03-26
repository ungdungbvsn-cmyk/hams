import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'https://hams-8xqq.onrender.com/api';
// Force override if the environment variable still points to the old backend
const finalBaseURL = rawBaseURL.includes('hams-1.onrender.com') 
  ? 'https://hams-8xqq.onrender.com/api' 
  : rawBaseURL;

export const apiClient = axios.create({
  baseURL: finalBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
