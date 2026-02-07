import { createAsyncThunk } from "@reduxjs/toolkit";
import { http } from "../../api/http";
import { fetchMe } from "../auth/authThunks";

export const updateMe = createAsyncThunk(
  "student/updateMe",
  async (body, { dispatch, rejectWithValue }) => {
    try {
      await http.put("/students/me", body);
      await dispatch(fetchMe());
      return true;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: "Update xato" });
    }
  },
);

export const uploadImage = createAsyncThunk(
  "student/uploadImage",
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const form = new FormData();
      // backend: FileInterceptor('file') bo‘lsa key 'file' bo‘lishi kerak.
      // Postman collection’da 'imageUrl' deb ketgan, lekin backendda odatda 'file' bo‘ladi.
      // Sening backend qaysi key kutishini aniq bilish uchun: controllerga qaraladi.
      // Hozir eng ko‘p ishlatiladigani: 'file'
      form.append("file", file);

      await http.post("/students/me/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await dispatch(fetchMe());
      return true;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: "Upload xato" });
    }
  },
);

export const deleteRequest = createAsyncThunk(
  "student/deleteRequest",
  async (_, { rejectWithValue }) => {
    try {
      await http.post("/students/me/delete/request");
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Delete request xato" },
      );
    }
  },
);

export const deleteConfirm = createAsyncThunk(
  "student/deleteConfirm",
  async (body, { rejectWithValue }) => {
    try {
      await http.post("/students/me/delete/confirm", body);
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Delete confirm xato" },
      );
    }
  },
);
