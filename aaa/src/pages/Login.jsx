import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAppDispatch } from "../app/hooks";
import { login, fetchMe } from "../features/auth/authThunks";
import { getApiErrorMessage } from "../api/error";
import { Page, Card, Input, Button, Label } from "../components/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Student12345!");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(login({ email, password })).unwrap();
      await dispatch(fetchMe()).unwrap();
      toast.success("Kirdingiz ✅");
      nav("/profile");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <Card>
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-sm text-slate-500 mt-1">Accountga kirish</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@gmail.com"
            />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Kutilmoqda..." : "Kirish"}
          </Button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link
            to="/forgot"
            className="font-semibold text-slate-700 hover:text-slate-900"
          >
            Forgot?
          </Link>
          <Link
            to="/signup"
            className="font-semibold text-slate-700 hover:text-slate-900"
          >
            Signup
          </Link>
        </div>
      </Card>
    </Page>
  );
}
