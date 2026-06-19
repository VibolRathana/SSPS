import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const statusVariant = { Pending: "pending", "In Progress": "progress", Submitted: "done", Graded: "done" };

const columns = [
  { key: "name", header: "Assignment", className: "font-semibold" },
  { key: "course", header: "Course" },
  { key: "due", header: "Due date" },
  { key: "status", header: "Status", render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
];

export default function Assignments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", dueDate: "" });

  function load() {
    setLoading(true);
    api.get("/assignments")
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/assignments", form);
      setForm({ title: "", dueDate: "" });
      setOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create assignment");
    } finally {
      setSaving(false);
    }
  }

  const field = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

  return (
    <>
      <Topbar title="Assignments" subtitle={`${items.length} assignment${items.length !== 1 ? "s" : ""}`} user={{ initials: "AM" }} />
      <div className="p-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            searchPlaceholder="Search assignments…"
            emptyText="No assignments yet. Add your first one to get started."
            action={<Button size="sm" onClick={() => setOpen(true)}><Plus size={15} /> Add assignment</Button>}
          />
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New assignment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create assignment"}</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Assignment title</label>
            <input className={field} value={form.title} required
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Heuristic evaluation report" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
            <input type="date" className={field} value={form.dueDate} required
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </form>
      </Modal>
    </>
  );
}