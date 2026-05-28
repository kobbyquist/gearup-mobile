import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import * as SecureStore from 'expo-secure-store';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: { phone: string; password: string }, { rejectWithValue }) => {
    try {
      return {
        user: {
          id: '1',
          name: 'Test User',
          phone: payload.phone,
          role: 'CAR_OWNER' as const,
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        token: 'mock-token-123',
      };
    } catch (error: any) {
      return rejectWithValue('Login failed');
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const userJson = await SecureStore.getItemAsync('gearup_user');
      const token = await SecureStore.getItemAsync('gearup_token');
      if (userJson && token) {
        return { user: JSON.parse(userJson), token };
      }
      return rejectWithValue('No session');
    } catch {
      return rejectWithValue('No session');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      SecureStore.deleteItemAsync('gearup_token');
      SecureStore.deleteItemAsync('gearup_user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;