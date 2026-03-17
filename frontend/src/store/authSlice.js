import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Add token to requests if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// API Interceptor for handling auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 for non-admin/agent routes
    // Admin/agent routes may return 403 which shouldn't trigger logout
    if (error.response?.status === 401) {
      // Check if this is an admin or agent route
      const isAdminRoute = error.config?.url?.includes('/admin/');
      const isAgentRoute = error.config?.url?.includes('/agent/') || 
                           error.config?.url?.includes('/chat/agent');
      
      if (!isAdminRoute && !isAgentRoute) {
        // Token expired or invalid
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      
      // Check if OTP is required
      if (response.data.requiresOtp) {
        return {
          requiresOtp: true,
          tempUserId: response.data.tempUserId,
          email: response.data.email,
          message: response.data.message
        };
      }
      
      // Direct login (no OTP required - shouldn't happen with our implementation)
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ userId, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { userId, otp });
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/resend-otp', { userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
    }
  }
);

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/admin-login', credentials);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Admin login failed');
    }
  }
);

export const agentLogin = createAsyncThunk(
  'auth/agentLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/agent-login', credentials);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Agent login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      // Don't auto-login - just return success data
      // Store email for verification page
      localStorage.setItem('pendingVerificationEmail', userData.email);
      // Clear any existing token - user needs to verify email first
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return response.data;
    } catch (error) {
      // Handle validation errors (array) or single message
      const errorData = error.response?.data;
      let errorMessage = 'Registration failed';
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Validation errors from express-validator
        errorMessage = errorData.errors.map(e => e.msg).join(', ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/user/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/user/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: !!token,
  isLoading: !!token, // Set loading to true if token exists (need to verify it)
  error: null,
  registrationSuccess: false,
  // OTP state
  requiresOtp: false,
  tempUserId: null,
  maskedEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
      localStorage.removeItem('pendingVerificationEmail');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        // Check if OTP is required
        if (action.payload.requiresOtp) {
          state.requiresOtp = true;
          state.tempUserId = action.payload.tempUserId;
          state.maskedEmail = action.payload.email;
          state.isAuthenticated = false;
          state.user = null;
        } else {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.requiresOtp = false;
          state.tempUserId = null;
          state.maskedEmail = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Ensure user is not authenticated on login failure
        state.isAuthenticated = false;
        state.user = null;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.requiresOtp = false;
        state.tempUserId = null;
        state.maskedEmail = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        // Just clear any errors, the OTP was sent
        state.error = null;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Admin Login (no OTP required)
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.requiresOtp = false;
        state.tempUserId = null;
        state.maskedEmail = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Agent Login (no OTP required)
      .addCase(agentLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(agentLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.requiresOtp = false;
        state.tempUserId = null;
        state.maskedEmail = null;
      })
      .addCase(agentLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationSuccess = true;
        state.isAuthenticated = false;
        state.user = null;
        // Don't set isAuthenticated or user - user needs to verify email first
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload.user };
      });
  },
});

export const { logout, clearError, setUser, clearRegistrationSuccess } = authSlice.actions;

// Initialize auth from localStorage
export const initializeAuth = () => (dispatch) => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    dispatch(fetchProfile());
  }
};

export default authSlice.reducer;
