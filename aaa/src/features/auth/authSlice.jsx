import { createSlice } from "@reduxjs/toolkit";

const initialState = { accessToken: null, me: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    setMe(state, action) {
      state.me = action.payload;
    },
    logoutLocal(state) {
      state.accessToken = null;
      state.me = null;
    },
  },
});

export const { setAccessToken, setMe, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
