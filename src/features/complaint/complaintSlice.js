import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  commitComplaint,
  createComplaint,
  getComplaintById,
} from "../../services/complaintApi";

export const createComplaintThunk = createAsyncThunk(
  "complaint/createComplaint",
  async (payload, thunkAPI) => {
    try {
      return await createComplaint(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.detail ||
          error.message ||
          "Failed to create complaint."
      );
    }
  }
);

export const getComplaintByIdThunk =
  createAsyncThunk(
    "complaint/getComplaintById",
    async (complaintId, thunkAPI) => {
      try {
        return await getComplaintById(
          complaintId
        );
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error?.response?.data?.detail ||
            error.message ||
            "Failed to fetch complaint."
        );
      }
    }
  );

export const commitComplaintThunk =
  createAsyncThunk(
    "complaint/commitComplaint",
    async (complaintId, thunkAPI) => {
      try {
        return await commitComplaint(
          complaintId
        );
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error?.response?.data?.detail ||
            error.message ||
            "Failed to commit complaint."
        );
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

    resetComplaint(state) {
      state.currentComplaint = null;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Create complaint
      .addCase(
        createComplaintThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        createComplaintThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.currentComplaint =
            action.payload;
        }
      )
      .addCase(
        createComplaintThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to create complaint.";
        }
      )

      // Get complaint
      .addCase(
        getComplaintByIdThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        getComplaintByIdThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.currentComplaint =
            action.payload;
        }
      )
      .addCase(
        getComplaintByIdThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch complaint.";
        }
      )

      // Commit complaint
      .addCase(
        commitComplaintThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        commitComplaintThunk.fulfilled,
        (state, action) => {
          state.loading = false;

          state.currentComplaint =
            action.payload?.complaint ||
            action.payload;
        }
      )
      .addCase(
        commitComplaintThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to commit complaint.";
        }
      );
  },
});

export const {
  clearComplaintError,
  clearCurrentComplaint,
  resetComplaint,
} = complaintSlice.actions;

export default complaintSlice.reducer;