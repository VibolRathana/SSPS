import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm text-slate-600">{value}%</span>
    </div>
  );
}

function daysUntil(rawDate) {
  if (!rawDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(rawDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

const EMPTY_FORM = { subject: "", courseName: "", examDate: "", preparation: 0 };

export default function Exams() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  function load() {
    setLoading(true);
    api.get("/exams")
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/exams", form);
      setForm(EMPTY_FORM);
      setOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create exam");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(row) {
    setEditItem(row);
    setForm({
      subject:     row.name,
      courseName:  row.course || "",
      examDate:    row.rawDate ? new Date(row.rawDate).toISOString().split("T")[0] : "",
      preparation: row.preparation ?? 0,
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/exams/${editItem.id}`, form);
      setEditItem(null);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update exam");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this exam?")) return;
    try {
      await api.delete(`/exams/${id}`);
      load();
    } catch (err) {
      alert("Could not delete exam");
    }
  }

  const columns = [
    { key: "name", header: "Exam", className: "font-semibold" },
    {
      key: "course",
      header: "Course",
      render: (r) =>
        r.course ? (
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: r.courseColor || "#6366F1" }}
            />
            {r.course}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    { key: "date", header: "Date" },
    {
      key: "preparation",
      header: "Preparation",
      render: (r) => <ProgressBar value={r.preparation ?? 0} />,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(r)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const upcoming = items
    .map((i) => daysUntil(i.rawDate))
    .filter((d) => d !== null && d >= 0)
    .sort((a, b) => a - b);
  const nextIn = upcoming.length > 0 ? upcoming[0] : null;
  const subtitle =
    nextIn !== null
      ? `${items.length} exam${items.length !== 1 ? "s" : ""} · next in ${nextIn} day${nextIn !== 1 ? "s" : ""}`
      : `${items.length} exam${items.length !== 1 ? "s" : ""}`;

  const field = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

  const formFields = (onSubmit) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Exam subject</label>
        <input className={field} value={form.subject} required
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          placeholder="e.g. Final — Normalization & SQL" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Course</label>
        <input className={field} value={form.courseName}
          onChange={(e) => setForm((f) => ({ ...f, courseName: e.target.value }))}
          placeholder="e.g. Database Systems" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Exam date</label>
        <input type="date" className={field} value={form.examDate} required
          onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Preparation: {form.preparation}%
        </label>
        <input type="range" min="0" max="100" className="w-full accent-indigo-500"
          value={form.preparation}
          onChange={(e) => setForm((f) => ({ ...f, preparation: Number(e.target.value) }))} />
      </div>
    </form>
  );

  return (
    <>
      <Topbar title="Exams" subtitle={subtitle} user={{ initials: "AM" }} />
      <div className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            searchPlaceholder="Search exams…"
            emptyText="No exams yet. Add your first one to get started."
            action={
              <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setOpen(true); }}>
                <Plus size={15} /> Add exam
              </Button>
            }
          />
        )}
      </div>

      {/* Create modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New exam"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Saving…" : "Add exam"}
            </Button>
          </>
        }
      >
        {formFields(handleCreate)}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editItem}
        onClose={() => { setEditItem(null); setForm(EMPTY_FORM); }}
        title="Edit exam"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setEditItem(null); setForm(EMPTY_FORM); }}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        {formFields(handleUpdate)}
      </Modal>
    </>
  );
}
