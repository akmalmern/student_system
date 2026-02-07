import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAppDispatch } from "../app/hooks";
import { signupRequest } from "../features/auth/authThunks";
import { getApiErrorMessage } from "../api/error";
import { Page, Card, Input, Button, Label } from "../components/ui";

export default function SignupRequest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Student12345!");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(
        signupRequest({ email, password, firstName, lastName, phone }),
      ).unwrap();
      toast.success("Kod yuborildi ✅");
      nav("/signup/verify", { state: { email } });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <Card>
        <h1 className="text-2xl font-bold">Signup</h1>
        <p className="text-sm text-slate-500 mt-1">Emailga kod yuboramiz</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Last</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
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
