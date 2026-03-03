import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch site configuration
export const fetchSiteConfig = createAsyncThunk(
  'siteConfig/fetchSiteConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/site-config');
      return response.data.config;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch site config');
    }
  }
);

const siteConfigSlice = createSlice({
  name: 'siteConfig',
  initialState: {
    config: {
      siteName: 'BitSolidus',
      siteDescription: 'Secure Cryptocurrency Trading Platform',
      logo: null,
      footerLogo: null,
      favicon: null,
      loadingIcon: null,
      header: {
        showLogo: true,
        showNavigation: true,
        showUserMenu: true,
        customLinks: []
      },
      footer: {
        showLogo: true,
        showCopyright: true,
        copyrightText: '© 2026 BitSolidus. All rights reserved.',
        footerLinks: [],
        socialLinks: {
          twitter: '',
          facebook: '',
          telegram: '',
          discord: '',
          instagram: ''
        }
      },
      contact: {
        email: 'support@cryptoplatform.com',
        phone: '',
        address: ''
      },
      platform: {
        maintenanceMode: false,
        maintenanceMessage: 'We are currently performing maintenance. Please check back later.',
        allowRegistration: true,
        requireEmailVerification: false,
        requireKycForTrading: false
      },
      branding: {
        primaryColor: '#7c3aed',
        secondaryColor: '#4f46e5',
        accentColor: '#10b981'
      },
      meta: {
        title: 'BitSolidus - Secure Cryptocurrency Trading',
        description: 'Trade cryptocurrencies with confidence on our secure platform',
        keywords: 'crypto, trading, bitcoin, ethereum, cryptocurrency'
      }
    },
    isLoading: false,
    error: null
  },
  reducers: {
    clearSiteConfigError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSiteConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.config = { ...state.config, ...action.payload };
      })
      .addCase(fetchSiteConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSiteConfigError } = siteConfigSlice.actions;
export default siteConfigSlice.reducer;
