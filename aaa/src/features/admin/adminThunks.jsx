import { createAsyncThunk } from "@reduxjs/toolkit";
import { http } from "../../api/http";

export const adminListStudents = createAsyncThunk(
  "admin/listStudents",
  async ({ page = 1, limit = 10, q }, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("limit", String(limit));
      if (q) qs.set("q", q);

      const res = await http.get(`/admin/students?${qs.toString()}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Admin list xato" },
      );
    }
  },
);

export const adminDeleteStudent = createAsyncThunk(
  "admin/deleteStudent",
  async (id, { rejectWithValue }) => {
    try {
      await http.delete(`/admin/students/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Admin delete xato" },
      );
    }
  },
);
