import axios from 'axios';
import { getToken, logout } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/AdminLogin';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper function to convert File to Base64
 * @param {File} file - File object from input
 * @returns {Promise<string>} - Base64 data URI
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Helper function to validate image data
 * Images from API are now Base64 strings, so no URL construction needed
 * @param {string} imageData - Base64 string or URL
 * @returns {string|null} - The image data if valid, null otherwise
 */
export const getImageUrl = (imageData) => {
  if (!imageData) return null;
  
  // If it's already a Base64 data URI or external URL, return as is
  if (imageData.startsWith('data:') || 
      imageData.startsWith('http://') || 
      imageData.startsWith('https://')) {
    return imageData;
  }
  
  // If it's somehow still a path (legacy data), return null
  return null;
};

export default api;
export { API_URL };