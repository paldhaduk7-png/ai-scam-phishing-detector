import axios from 'axios';

/**
 * ScamShield API Client
 * Configured with VITE_API_BASE_URL and withCredentials=true for HTTP-only cookie JWTs.
 */
const rawBaseURL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const cleanBaseURL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({
  baseURL: cleanBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 45000,
});

// ==============================================================================
// Authentication Endpoints
// ==============================================================================

/**
 * Register a new user account.
 * @param {Object} userData - { name, email, password, confirm_password }
 * @returns {Promise<Object>} Safe user response
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Log in to account. Sets HTTP-only access_token cookie.
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} Safe user response
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Log out and clear HTTP-only cookie.
 * @returns {Promise<Object>}
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Request 6-digit password reset OTP to email.
 * @param {string} email
 * @returns {Promise<Object>}
 */
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Verify 6-digit password reset OTP.
 * @param {Object} payload - { email, otp }
 * @returns {Promise<Object>}
 */
export const verifyOTP = async ({ email, otp }) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

/**
 * Reset password using verified 6-digit OTP.
 * @param {Object} payload - { email, otp, reset_token, password, confirm_password }
 * @returns {Promise<Object>}
 */
export const resetPassword = async (payload) => {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
};

/**
 * Get current authenticated user profile via cookie session.
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update authenticated user's profile details.
 * @param {Object} profileData - { name }
 * @returns {Promise<Object>}
 */
export const updateUserProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

/**
 * Upload profile photo avatar to Cloudinary via FastAPI UploadFile.
 * @param {FormData} formData - Multipart form data containing file
 * @returns {Promise<Object>} Updated user profile
 */
export const uploadProfilePhoto = async (formData) => {
  const response = await api.post('/auth/profile-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete profile photo avatar from Cloudinary.
 * @returns {Promise<Object>} Updated user profile
 */
export const deleteProfilePhoto = async () => {
  const response = await api.delete('/auth/profile-photo');
  return response.data;
};

// ==============================================================================
// Threat Detection Endpoints (Public & Authenticated)
// ==============================================================================

/**
 * Scan content for scam / phishing indicators using the unified ML detection pipeline.
 * Works for both Guest and Authenticated users.
 * @param {Object} payload - { content, content_type }
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
 * Works for both Guest and Authenticated users.
 * @param {Object} payload - { content }
 * @returns {Promise<Object>} DetectionResponse
 */
export const detectEmailDL = async ({ content }) => {
  const response = await api.post('/detect/dl', {
    content,
    content_type: 'email',
  });
  return response.data;
};

// ==============================================================================
// Dashboard & Detection History Endpoints (Authenticated)
// ==============================================================================

/**
 * Fetch dashboard overview statistics for current user.
 */
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

/**
 * Fetch recent detections for current user.
 */
export const getRecentDetections = async () => {
  const response = await api.get('/dashboard/recent');
  return response.data;
};

/**
 * Fetch 7-day scan activity breakdown for current user.
 */
export const getDashboardChart = async () => {
  const response = await api.get('/dashboard/chart');
  return response.data;
};

/**
 * Fetch paginated detection history with optional filters.
 */
export const getDetectionHistory = async (params = {}) => {
  const response = await api.get('/detections/history', { params });
  return response.data;
};

/**
 * Delete a detection record by ID.
 */
export const deleteDetectionRecord = async (id) => {
  const response = await api.delete(`/detections/history/${id}`);
  return response.data;
};

export default api;
