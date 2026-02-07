import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppRouter from "./routes/AppRouter";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop
        theme="light"
      />
    </div>
  );
}
