import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/user/balance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch balance');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async ({ page = 1, limit = 10, type = null } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (type) params.type = type;
      const response = await axios.get('/api/user/transactions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

const initialState = {
  balance: {
    total: 0,
    currency: 'USD',
    change24h: 0,
    change24hValue: 0,
  },
  portfolio: {
    USDT: { amount: 0, value: 0, price: 1 },
    BTC: { amount: 0, value: 0, price: 0 },
    ETH: { amount: 0, value: 0, price: 0 },
    BNB: { amount: 0, value: 0, price: 0 },
  },
  prices: {
    USDT: 1,
    BTC: 0,
    ETH: 0,
    BNB: 0,
  },
  totalDeposited: 0,
  totalWithdrawn: 0,
  transactions: [],
  transactionsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
    updateBalance: (state, action) => {
      state.balance = { ...state.balance, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Balance
      .addCase(fetchBalance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
        state.portfolio = action.payload.portfolio || state.portfolio;
        state.prices = action.payload.prices || state.prices;
        state.totalDeposited = action.payload.totalDeposited || 0;
        state.totalWithdrawn = action.payload.totalWithdrawn || 0;
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.transactionsPagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWalletError, updateBalance } = walletSlice.actions;
export default walletSlice.reducer;
