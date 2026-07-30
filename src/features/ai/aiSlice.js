import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getComplaintAIRuns,
  processComplaint,
  sendChatCorrection,
} from "../../services/aiApi";

export const processComplaintThunk =
  createAsyncThunk(
    "ai/processComplaint",
    async (
      {
        complaintId,
        triggerType = "TEXT_SUBMISSION",
      },
      thunkAPI
    ) => {
      try {
        return await processComplaint(
          complaintId,
          triggerType
        );
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error?.response?.data?.detail ||
            error.message ||
            "Failed to process complaint."
        );
      }
    }
  );

export const sendChatCorrectionThunk =
  createAsyncThunk(
    "ai/sendChatCorrection",
    async (
      {
        complaintId,
        messageText,
      },
      thunkAPI
    ) => {
      try {
        return await sendChatCorrection(
          complaintId,
          messageText
        );
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error?.response?.data?.detail ||
            error.message ||
            "Failed to apply correction."
        );
      }
    }
  );

export const getComplaintAIRunsThunk =
  createAsyncThunk(
    "ai/getComplaintAIRuns",
    async (complaintId, thunkAPI) => {
      try {
        return await getComplaintAIRuns(
          complaintId
        );
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error?.response?.data?.detail ||
            error.message ||
            "Failed to fetch AI runs."
        );
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

    resetAI(state) {
      state.latestRun = null;
      state.runs = [];
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Process complaint
      .addCase(
        processComplaintThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        processComplaintThunk.fulfilled,
        (state, action) => {
          state.loading = false;

          state.latestRun =
            action.payload?.ai_run ||
            action.payload;
        }
      )
      .addCase(
        processComplaintThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to process complaint.";
        }
      )

      // Chat correction
      .addCase(
        sendChatCorrectionThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        sendChatCorrectionThunk.fulfilled,
        (state, action) => {
          state.loading = false;

          state.latestRun =
            action.payload?.ai_run ||
            action.payload;
        }
      )
      .addCase(
        sendChatCorrectionThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to apply correction.";
        }
      )

      // Get AI runs
      .addCase(
        getComplaintAIRunsThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        getComplaintAIRunsThunk.fulfilled,
        (state, action) => {
          state.loading = false;

          const items =
            action.payload?.items || [];

          state.runs = items;
          state.latestRun =
            items[0] || null;
        }
      )
      .addCase(
        getComplaintAIRunsThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch AI runs.";
        }
      );
  },
});

export const {
  clearAIError,
  resetAI,
} = aiSlice.actions;

export default aiSlice.reducer;