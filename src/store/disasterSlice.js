// src/store/disasterSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axios';
import { logActivity } from '../utils/activityLogger';

export const fetchDisasters = createAsyncThunk(
  'disasters/fetchDisasters',
  async () => {
    const response = await axios.get('/disasters');
    return response.data;
  }
);

export const addDisaster = createAsyncThunk(
  'disasters/addDisaster',
  async (disasterData) => {
    const response = await axios.post('/disasters', disasterData);
    await logActivity(
      'info',
      `Bencana baru ditambahkan: ${disasterData.type}`,
      disasterData.location
    );
    return response.data;
  }
);

export const updateDisaster = createAsyncThunk(
  'disasters/updateDisaster',
  async ({ id, data }) => {
    const response = await axios.put(`/disasters/${id}`, data);
    await logActivity(
      'info',
      `Status bencana diperbarui: ${data.type}`,
      data.location
    );
    return response.data;
  }
);

export const deleteDisaster = createAsyncThunk(
  'disasters/deleteDisaster',
  async (id) => {
    await axios.delete(`/disasters/${id}`);
    return id;
  }
);

const disasterSlice = createSlice({
  name: 'disasters',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedDisaster: null,
    adminStats: {
      seismicActivity: 127,
      evacuees: 1234
    },
    lastUpdate: new Date().toISOString()
  },
  reducers: {
    setSelectedDisaster: (state, action) => {
      state.selectedDisaster = action.payload;
    },
    updateAdminStats: (state, action) => {
      state.adminStats = action.payload;
    },
    updateLastUpdate: (state) => {
      state.lastUpdate = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDisasters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDisasters.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchDisasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addDisaster.fulfilled, (state, action) => {
        state.data.push(action.payload);
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(updateDisaster.fulfilled, (state, action) => {
        const index = state.data.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(deleteDisaster.fulfilled, (state, action) => {
        state.data = state.data.filter(d => d.id !== action.payload);
        state.lastUpdate = new Date().toISOString();
      });
  },
});

export const { setSelectedDisaster, updateAdminStats, updateLastUpdate } = disasterSlice.actions;
export default disasterSlice.reducer;