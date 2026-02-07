export function getApiErrorMessage(err) {
  // thunk rejectWithValue bo‘lsa: err.message bor bo‘ladi
  if (err?.message) {
    if (Array.isArray(err.message)) return err.message.join(", ");
    if (typeof err.message === "string") return err.message;
  }

  // axios error bo‘lsa:
  const data = err?.response?.data;
  if (!data) return err?.message || "Xatolik";

  const msg = data.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;

  return data.error || "Xatolik";
}
