import axios from 'axios';

/**
 * ScamShield API Client
 * Configured using VITE_API_BASE_URL environment variable.
 * Fallback to http://localhost:8000/api if not specified.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Scan content for scam / phishing indicators
 * @param {Object} payload - { type: 'message'|'email'|'url', text, subject, url }
 */
export const detectScam = async (payload) => {
  const response = await api.post('/detect', payload);
  return response.data;
};

/**
 * Fetch dashboard overview statistics
 */
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

/**
 * Fetch detection overview chart data
 */
export const getDetectionChartData = async () => {
  const response = await api.get('/dashboard/chart');
  return response.data;
};

/**
 * Fetch recent detections
 */
export const getRecentDetections = async () => {
  const response = await api.get('/dashboard/recent');
  return response.data;
};

/**
 * Fetch paginated detection history with optional filters
 */
export const getDetectionHistory = async (params = {}) => {
  const response = await api.get('/history', { params });
  return response.data;
};

/**
 * Delete a detection record by ID
 */
export const deleteDetectionRecord = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};

/**
 * Fetch current user profile
 */
export const getUserProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

export default api;
