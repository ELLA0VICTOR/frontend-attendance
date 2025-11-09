import axios from 'axios';
import { getToken, logout } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Extract base URL without /api for static files
const BASE_URL = API_URL.replace(/\/api$/, '');

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
      // Token expired or invalid - logout
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/AdminLogin';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper function to construct proper image URLs
 * @param {string} imagePath - Path from database (e.g., "/uploads/photo-123.jpg")
 * @returns {string|null} - Full URL to access the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Normalize path (ensure it starts with /)
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Use BASE_URL (without /api) for static files
  return `${BASE_URL}${normalizedPath}`;
};

export default api;
export { API_URL, BASE_URL };