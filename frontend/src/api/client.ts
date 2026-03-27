import axios from 'axios';

const finalBaseURL = import.meta.env.VITE_API_URL || 'https://hams-1.onrender.com/api';

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
