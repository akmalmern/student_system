import { createAsyncThunk } from "@reduxjs/toolkit";
import { http } from "../../api/http";
import { setAccessToken, setMe, logoutLocal } from "./authSlice";

export const signupRequest = createAsyncThunk(
  "auth/signupRequest",
  async (body, { rejectWithValue }) => {
    try {
      await http.post("/auth/signup/request", body);
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Signup request xato" },
      );
    }
  },
);

export const signupVerify = createAsyncThunk(
  "auth/signupVerify",
  async (body, { rejectWithValue }) => {
    try {
      await http.post("/auth/signup/verify", body);
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Signup verify xato" },
      );
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (body, { dispatch, rejectWithValue }) => {
    try {
      const res = await http.post("/auth/signin", body);
      dispatch(setAccessToken(res.data.accessToken));
      return true;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: "Login xato" });
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await http.get("/students/me");
      dispatch(setMe(res.data));
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Profile xato" },
      );
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await http.post("/auth/logout");
      dispatch(logoutLocal());
      return true;
    } catch (err) {
      dispatch(logoutLocal());
      return rejectWithValue(err?.response?.data || { message: "Logout xato" });
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (body, { rejectWithValue }) => {
    try {
      await http.post("/auth/forgot-password", body);
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Forgot password xato" },
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (body, { dispatch, rejectWithValue }) => {
    try {
      await http.post("/auth/reset-password", body);
      dispatch(logoutLocal());
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Reset password xato" },
      );
    }
  },
);
