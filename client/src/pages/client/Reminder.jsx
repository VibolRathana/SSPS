import { useEffect, useState } from "react";
import { Plus, Trash2, Bell } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const NOTIFY_OPTIONS = ["15 minutes", "1 hour", "1 day"];
const TYPES = ["Task", "Assignment", "Exam", "Study Session"];
const EMPTY_FORM = { type: "Assignment", remindDate: "", remindTime: "", notifyBefore: "1 hour", description: "" };

function Toggle({ active, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${active ? "bg-indigo-600" : "bg-slate-300"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? "left-5.5" : "left-0.5"}`} />
    </button>
  );
}

function ReminderCard({ reminder, onToggle, onModify, onDelete, onNotifyChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700">
          {reminder.type}
        </span>
        <Toggle active={!!reminder.isActive} onChange={() => onToggle(reminder.id)} />
      </div>

      <p className="mb-1 text-2xl font-bold text-slate-900">
        {reminder.date}
        <span className="ml-2 text-sm font-normal text-slate-500">· {reminder.time}</span>
      </p>
      {reminder.description && (
        <p className="mb-3 text-xs text-slate-500 truncate">{reminder.description}</p>
      )}

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Notify before</p>
      <div className="mb-4 flex gap-2">
        {NOTIFY_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onNotifyChange(reminder.id, opt)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              reminder.notifyBefore === opt
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
            }`}
          >
            {opt === "15 minutes" ? "15 min" : opt}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onModify(reminder)}
          className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Modify
        </button>
        <button
          onClick={() => onDelete(reminder.id)}
          className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-red-400 transition hover:bg-red-100 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Reminders() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  function load() {
    setLoading(true);
    api.get("/reminders")
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/reminders", form);
      setForm(EMPTY_FORM);
      setOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create reminder");
    } finally {
      setSaving(false);
    }
  }

  function openModify(reminder) {
    setEditItem(reminder);
    setForm({
      type:        reminder.type,
      remindDate:  reminder.rawDate || "",
      remindTime:  reminder.rawTime || "",
      notifyBefore: reminder.notifyBefore,
      description: reminder.description || "",
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/reminders/${editItem.id}`, form);
      setEditItem(null);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update reminder");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id) {
    try {
      await api.patch(`/reminders/${id}/toggle`);
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleNotifyChange(id, notifyBefore) {
    try {
      await api.put(`/reminders/${id}`, { notifyBefore });
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, notifyBefore } : r));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await api.delete(`/reminders/${id}`);
      load();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Could not delete reminder");
    }
  }

  const active = items.filter((r) => r.isActive).length;
  const field = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

  const formFields = (onSubmit) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
        <select className={field} value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Notes / Info</label>
        <input className={field} value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="e.g. Database Systems final exam" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
          <input type="date" className={field} value={form.remindDate} required
            onChange={(e) => setForm((f) => ({ ...f, remindDate: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Time</label>
          <input type="time" className={field} value={form.remindTime} required
            onChange={(e) => setForm((f) => ({ ...f, remindTime: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Notify before</label>
        <div className="flex gap-2">
          {NOTIFY_OPTIONS.map((opt) => (
            <button key={opt} type="button"
              onClick={() => setForm((f) => ({ ...f, notifyBefore: opt }))}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${
                form.notifyBefore === opt
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:border-indigo-300"
              }`}>
              {opt === "15 minutes" ? "15 min" : opt}
            </button>
          ))}
        </div>
      </div>
    </form>
  );

  return (
    <>
      <Topbar
        title="Reminders"
        subtitle={`${active} active reminder${active !== 1 ? "s" : ""}`}
        user={{ initials: "AM" }}
        actions={
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setOpen(true); }}>
            <Plus size={15} /> Create reminder
          </Button>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400">No reminders yet. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                onToggle={handleToggle}
                onModify={openModify}
                onDelete={handleDelete}
                onNotifyChange={handleNotifyChange}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <Bell size={20} />
          </span>
          <p className="text-sm text-slate-600">
            <strong>Never miss a deadline.</strong> Set personalized reminders for assignments, exams, and study sessions.
            We'll email you at the time you choose.
          </p>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create reminder"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create reminder"}</Button>
        </>}>
        {formFields(handleCreate)}
      </Modal>

      <Modal open={!!editItem} onClose={() => { setEditItem(null); setForm(EMPTY_FORM); }} title="Modify reminder"
        footer={<>
          <Button variant="ghost" onClick={() => { setEditItem(null); setForm(EMPTY_FORM); }}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </>}>
        {formFields(handleUpdate)}
      </Modal>
    </>
  );
}
