import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  adminListStudents,
  adminDeleteStudent,
} from "../features/admin/adminThunks";
import { getApiErrorMessage } from "../api/error";
import {
  Page,
  CardWide,
  Input,
  Button,
  ButtonOutline,
  Divider,
} from "../components/ui";

export default function AdminStudents() {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => s.admin);

  const [q, setQ] = useState("akmal");
  const [page, setPage] = useState(1);
  const limit = 10;

  async function load(p = page) {
    try {
      await dispatch(
        adminListStudents({ page: p, limit, q: q || undefined }),
      ).unwrap();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDelete(id) {
    if (!confirm("O‘chirasizmi?")) return;
    try {
      await dispatch(adminDeleteStudent(id)).unwrap();
      toast.success("O‘chirildi ✅");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <Page>
      <CardWide>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Students</h1>
            <p className="text-sm text-slate-500">List & delete</p>
          </div>
        </div>

        <Divider />

        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search..."
          />
          <Button disabled={loading} onClick={() => load(1)}>
            Search
          </Button>
        </div>

        <Divider />

        {loading && <div className="text-sm text-slate-500">Loading...</div>}

        {data && (
          <>
            <div className="text-sm text-slate-500 mb-2">
              Total:{" "}
              <span className="font-semibold text-slate-900">{data.total}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">Email</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 font-semibold">{s.email}</td>
                      <td className="py-3">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="py-3">{s.phone || "-"}</td>
                      <td className="py-3 text-right">
                        <ButtonOutline onClick={() => onDelete(s.id)}>
                          Delete
                        </ButtonOutline>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Divider />

            <div className="flex gap-2">
              <ButtonOutline
                disabled={page <= 1 || loading}
                onClick={() => {
                  setPage(page - 1);
                  load(page - 1);
                }}
              >
                Prev
              </ButtonOutline>
              <ButtonOutline
                disabled={loading}
                onClick={() => {
                  setPage(page + 1);
                  load(page + 1);
                }}
              >
                Next
              </ButtonOutline>
            </div>
          </>
        )}
      </CardWide>
    </Page>
  );
}
