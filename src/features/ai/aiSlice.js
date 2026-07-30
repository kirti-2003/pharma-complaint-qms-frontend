import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getComplaintAIRuns,
  processComplaint,
  sendChatCorrection,
} from "../../services/aiApi";

export const processComplaintThunk = createAsyncThunk(
  "ai/processComplaint",
  async (complaintId, thunkAPI) => {
    try {
      return await processComplaint(complaintId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const sendChatCorrectionThunk = createAsyncThunk(
  "ai/sendChatCorrection",
  async ({ complaintId, messageText }, thunkAPI) => {
    try {
      return await sendChatCorrection(
        complaintId,
        messageText
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getComplaintAIRunsThunk = createAsyncThunk(
  "ai/getComplaintAIRuns",
  async (complaintId, thunkAPI) => {
    try {
      return await getComplaintAIRuns(complaintId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  latestRun: null,
  runs: [],
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearAIError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processComplaintThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processComplaintThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.latestRun = action.payload.ai_run;
      })
      .addCase(processComplaintThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendChatCorrectionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        sendChatCorrectionThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.latestRun = action.payload.ai_run;
        }
      )
      .addCase(
        sendChatCorrectionThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(getComplaintAIRunsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getComplaintAIRunsThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.runs = action.payload.items || [];
          state.latestRun = action.payload.items?.[0] || null;
        }
      )
      .addCase(
        getComplaintAIRunsThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearAIError } = aiSlice.actions;

export default aiSlice.reducer;