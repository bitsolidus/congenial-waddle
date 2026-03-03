import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Cache prices to reduce API calls
let priceCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

// Async thunks
export const fetchCryptoPrices = createAsyncThunk(
  'crypto/fetchPrices',
  async (_, { rejectWithValue }) => {
    try {
      // Check cache first
      const now = Date.now();
      if (priceCache && (now - lastFetchTime) < CACHE_DURATION) {
        return priceCache;
      }
      
      // Using CoinGecko API for real-time prices
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,tether&vs_currencies=usd&include_24hr_change=true',
        { timeout: 5000 }
      );
      
      const data = response.data;
      const prices = {
        BTC: {
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change || 0,
        },
        ETH: {
          price: data.ethereum.usd,
          change24h: data.ethereum.usd_24h_change || 0,
        },
        BNB: {
          price: data.binancecoin.usd,
          change24h: data.binancecoin.usd_24h_change || 0,
        },
        USDT: {
          price: 1, // USDT is pegged to USD
          change24h: 0,
        },
      };
      
      // Update cache
      priceCache = prices;
      lastFetchTime = now;
      
      return prices;
    } catch (error) {
      console.warn('CoinGecko API error, using fallback prices:', error.message);
      // Return cached prices if available, otherwise fallback
      if (priceCache) {
        return priceCache;
      }
      // Fallback prices if API fails
      return {
        BTC: { price: 65000, change24h: 0 },
        ETH: { price: 3500, change24h: 0 },
        BNB: { price: 600, change24h: 0 },
        USDT: { price: 1, change24h: 0 },
      };
    }
  }
);

const initialState = {
  prices: {
    BTC: { price: 65000, change24h: 0 },
    ETH: { price: 3500, change24h: 0 },
    BNB: { price: 600, change24h: 0 },
    USDT: { price: 1, change24h: 0 },
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoPrices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCryptoPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prices = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCryptoPrices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default cryptoSlice.reducer;
