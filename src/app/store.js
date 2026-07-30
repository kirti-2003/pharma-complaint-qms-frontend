import { configureStore } from "@reduxjs/toolkit";

import aiReducer from "../features/ai/aiSlice";
import complaintReducer from "../features/complaint/complaintSlice";

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
    ai: aiReducer,
  },
});