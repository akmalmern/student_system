import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAppDispatch } from "../app/hooks";
import { forgotPassword } from "../features/auth/authThunks";
import { getApiErrorMessage } from "../api/error";
import { Page, Card, Input, Button, Label } from "../components/ui";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(forgotPassword({ email })).unwrap();
      toast.success("Kod yuborildi ✅");
      nav("/reset", { state: { email } });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <Card>
        <h1 className="text-2xl font-bold">Forgot Password</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Kutilmoqda..." : "Kod yuborish"}
          </Button>
        </form>

        <div className="mt-4 text-sm">
          <Link
            to="/login"
            className="font-semibold text-slate-700 hover:text-slate-900"
          >
            Login
          </Link>
        </div>
      </Card>
    </Page>
  );
}
