import { createSlice } from "@reduxjs/toolkit";
import { adminListStudents, adminDeleteStudent } from "./adminThunks";

const initialState = { data: null, loading: false };

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(adminListStudents.pending, (s) => {
      s.loading = true;
    });
    b.addCase(adminListStudents.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload;
    });
    b.addCase(adminListStudents.rejected, (s) => {
      s.loading = false;
    });
    b.addCase(adminDeleteStudent.fulfilled, (s, a) => {
      if (!s.data) return;
      s.data.items = s.data.items.filter((x) => x.id !== a.payload);
      s.data.total = Math.max(0, s.data.total - 1);
    });
  },
});

export default adminSlice.reducer;
