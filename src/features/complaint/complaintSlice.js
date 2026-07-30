import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createComplaint,
  getComplaintById,
} from "../../services/complaintApi";

export const createComplaintThunk = createAsyncThunk(
  "complaint/createComplaint",
  async (payload, thunkAPI) => {
    try {
      return await createComplaint(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getComplaintByIdThunk = createAsyncThunk(
  "complaint/getComplaintById",
  async (complaintId, thunkAPI) => {
    try {
      return await getComplaintById(complaintId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentComplaint: null,
  loading: false,
  error: null,
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    clearComplaintError(state) {
      state.error = null;
    },
    clearCurrentComplaint(state) {
      state.currentComplaint = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createComplaintThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComplaintThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentComplaint = action.payload;
      })
      .addCase(createComplaintThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getComplaintByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getComplaintByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentComplaint = action.payload;
      })
      .addCase(getComplaintByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearComplaintError,
  clearCurrentComplaint,
} = complaintSlice.actions;

export default complaintSlice.reducer;