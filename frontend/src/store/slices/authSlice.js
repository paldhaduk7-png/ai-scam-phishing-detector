import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const RAW_API_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

/**
 * Check active session on app boot (GET /auth/me).
 * Kept lightweight so the user stays logged in across page refreshes.
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true,
      });
      return res.data;
    } catch {
      return rejectWithValue('Unauthenticated');
    }
  }
);

/**
 * Log out user (POST /auth/logout).
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true,
      });
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Logout failed');
    }
  }
);

/**
 * Upload avatar from Profile page.
 */
export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/profile-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to upload photo.');
    }
  }
);

/**
 * Delete avatar from Profile page.
 */
export const deleteAvatar = createAsyncThunk(
  'auth/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/auth/profile-photo`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to remove photo.');
    }
  }
);

/**
 * Update user display name from Profile page.
 */
export const updateProfileDetails = createAsyncThunk(
  'auth/updateProfileDetails',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/auth/profile`, profileData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update profile.');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

/**
 * Minimal, clean authSlice.
 * Form state, axios API calls, validations, and navigations are handled
 * directly in Login.jsx and Register.jsx as requested.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = state.user ? { ...state.user, ...action.payload } : action.payload;
    },
    setAuthLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.initialized = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.initialized = true;
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      // Avatar & Profile updates
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(deleteAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfileDetails.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const {
  setCredentials,
  logout,
  updateUser,
  setAuthLoading,
  setAuthError,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
