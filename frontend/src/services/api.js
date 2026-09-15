import axios from 'axios';

/**
 * ScamShield API Client
 * Configured using VITE_API_BASE_URL environment variable.
 * Fallback to http://localhost:8000/api/v1 if not specified.
 */
const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Scan content for scam / phishing indicators using the unified ML detection pipeline.
 * @param {Object} payload
 * @param {string} payload.content - Text message, email body, or URL to analyze
 * @param {'email'|'sms'|'url'} payload.content_type - Content classification channel
 * @returns {Promise<Object>} DetectionResponse
 */
export const detectScam = async ({ content, content_type }) => {
  const response = await api.post('/detect', {
    content,
    content_type,
  });
  return response.data;
};

/**
 * Scan email content for phishing threats using the trained Deep Learning Bi-LSTM neural network.
 * Note: Exclusively supports email content channel.
 * @param {Object} payload
 * @param {string} payload.content - Email subject and body content to analyze
 * @returns {Promise<Object>} DetectionResponse
 */
export const detectEmailDL = async ({ content }) => {
  const response = await api.post('/detect/dl', {
    content,
    content_type: 'email',
  });
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
