import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  register as registerApi,
  login as loginApi,
  logout as logoutApi,
  getCurrentUser as getCurrentUserApi,
  uploadProfilePhoto as uploadProfilePhotoApi,
  deleteProfilePhoto as deleteProfilePhotoApi,
  updateUserProfile as updateUserProfileApi,
} from '../../services/api';

/**
 * Check active session on app boot.
 * Reads the HTTP-only cookie by requesting GET /auth/me.
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const user = await getCurrentUserApi();
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Unauthenticated');
    }
  }
);

/**
 * Log in with email and password.
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await loginApi(credentials);
      return user;
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string'
        ? detail
        : (detail?.[0]?.msg || 'Login failed. Please check your credentials.');
      return rejectWithValue(message);
    }
  }
);

/**
 * Register a new user and automatically establish session.
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      await registerApi(userData);
      // Auto login after successful registration
      const user = await loginApi({
        email: userData.email,
        password: userData.password,
      });
      return user;
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string'
        ? detail
        : (detail?.[0]?.msg || 'Registration failed. Please check your information.');
      return rejectWithValue(message);
    }
  }
);

/**
 * Log out and clear session.
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Logout failed');
    }
  }
);

/**
 * Upload profile avatar image to Cloudinary.
 */
export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const updatedUser = await uploadProfilePhotoApi(formData);
      return updatedUser;
    } catch (err) {
      const detail = err.response?.data?.detail;
      return rejectWithValue(detail || 'Failed to upload photo.');
    }
  }
);

/**
 * Delete profile avatar from Cloudinary.
 */
export const deleteAvatar = createAsyncThunk(
  'auth/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const updatedUser = await deleteProfilePhotoApi();
      return updatedUser;
    } catch (err) {
      const detail = err.response?.data?.detail;
      return rejectWithValue(detail || 'Failed to remove photo.');
    }
  }
);

/**
 * Update user display name.
 */
export const updateProfileDetails = createAsyncThunk(
  'auth/updateProfileDetails',
  async (profileData, { rejectWithValue }) => {
    try {
      const updatedUser = await updateUserProfileApi(profileData);
      return updatedUser;
    } catch (err) {
      const detail = err.response?.data?.detail;
      return rejectWithValue(detail || 'Failed to update profile.');
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
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

      // uploadAvatar
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // deleteAvatar
      .addCase(deleteAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // updateProfileDetails
      .addCase(updateProfileDetails.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
