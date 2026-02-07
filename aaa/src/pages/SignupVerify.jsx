import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAppDispatch } from "../app/hooks";
import { signupVerify } from "../features/auth/authThunks";
import { getApiErrorMessage } from "../api/error";
import { Page, Card, Input, Button, Label } from "../components/ui";

export default function SignupVerify() {
  const loc = useLocation();
  const [email, setEmail] = useState(loc.state?.email || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(signupVerify({ email, code })).unwrap();
      toast.success("Tasdiqlandi ✅ Endi login qiling");
      nav("/login");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <Card>
        <h1 className="text-2xl font-bold">Verify</h1>
        <p className="text-sm text-slate-500 mt-1">
          Emailga kelgan 5 xonali kod
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="12345"
            />
          </div>

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Kutilmoqda..." : "Tasdiqlash"}
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
