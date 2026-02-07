import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchMe, logout } from "../features/auth/authThunks";
import {
  updateMe,
  uploadImage,
  deleteRequest,
  deleteConfirm,
} from "../features/student/studentThunks";
import { getApiErrorMessage } from "../api/error";
import {
  Page,
  CardWide,
  Input,
  Button,
  ButtonOutline,
  Label,
  Divider,
} from "../components/ui";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const me = useAppSelector((s) => s.auth.me);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(fetchMe()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (!me) return;
    setFirstName(me.firstName || "");
    setLastName(me.lastName || "");
    setPhone(me.phone || "");
  }, [me]);

  async function onSave() {
    setBusy(true);
    try {
      await dispatch(updateMe({ firstName, lastName, phone })).unwrap();
      toast.success("Saqlangan ✅");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      await dispatch(uploadImage(f)).unwrap();
      toast.success("Yuklandi ✅");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onDeleteRequest() {
    setBusy(true);
    try {
      await dispatch(deleteRequest()).unwrap();
      toast.success("Kod yuborildi ✅");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteConfirm() {
    setBusy(true);
    try {
      await dispatch(deleteConfirm({ code })).unwrap();
      toast.success("Account o‘chirildi ✅");
      await dispatch(logout()).unwrap();
      nav("/login");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    setBusy(true);
    try {
      await dispatch(logout()).unwrap();
      nav("/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <CardWide>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-sm text-slate-500">{me?.email || "..."}</p>
          </div>
          <div className="flex gap-2">
            {me?.role === "ADMIN" && (
              <Link
                to="/admin/students"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Admin
              </Link>
            )}
            <ButtonOutline disabled={busy} onClick={onLogout}>
              Logout
            </ButtonOutline>
          </div>
        </div>

        <Divider />

        {!me ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>First name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Last name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button disabled={busy} onClick={onSave}>
                Save
              </Button>
              <label className="cursor-pointer">
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={onUpload}
                />
                <span className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50">
                  Upload image
                </span>
              </label>
            </div>

            <Divider />

            <div className="space-y-2">
              <div className="text-sm font-bold">Delete account</div>
              <div className="flex gap-2 flex-col md:flex-row">
                <ButtonOutline disabled={busy} onClick={onDeleteRequest}>
                  Send code
                </ButtonOutline>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="code"
                />
                <Button disabled={busy || !code} onClick={onDeleteConfirm}>
                  Confirm delete
                </Button>
              </div>
            </div>
          </>
        )}
      </CardWide>
    </Page>
  );
}
