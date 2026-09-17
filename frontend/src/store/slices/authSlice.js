import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

/**
 * Check active session on app boot (GET /auth/me).
 * Kept lightweight so the user stays logged in across page refreshes.
 * Works seamlessly with both Bearer token and HTTP-only cookie.
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
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
      await api.post('/auth/logout');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('scamshield_token');
      }
      return null;
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('scamshield_token');
      }
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
      const res = await api.post('/auth/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      const res = await api.delete('/auth/profile-photo');
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
      const res = await api.put('/auth/profile', profileData);
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
      if (action.payload?.access_token && typeof window !== 'undefined') {
        localStorage.setItem('scamshield_token', action.payload.access_token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('scamshield_token');
      }
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
        if (typeof window !== 'undefined') {
          localStorage.removeItem('scamshield_token');
        }
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('scamshield_token');
        }
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('scamshield_token');
        }
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
