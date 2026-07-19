import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const statusVariant = { Pending: "pending", "In Progress": "progress", Completed: "done" };
const EMPTY_FORM = { title: "", courseName: "", priority: "Medium", dueDate: "", status: "Pending" };

export default function Tasks() {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  function loadTasks() {
    setLoading(true);
    api.get("/tasks")
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadTasks(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/tasks", form);
      setForm(EMPTY_FORM);
      setOpen(false);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create task");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(row) {
    setEditItem(row);
    setForm({
      title:      row.name,
      courseName: row.course || "",
      priority:   row.priority || "Medium",
      dueDate:    row.rawDue ? new Date(row.rawDue).toISOString().split("T")[0] : "",
      status:     row.status || "Pending",
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/tasks/${editItem.id}`, form);
      setEditItem(null);
      setForm(EMPTY_FORM);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update task");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Could not delete task");
    }
  }

  const columns = [
    { key: "name", header: "Task", className: "font-semibold" },
    { key: "course", header: "Course" },
    { key: "due", header: "Due date" },
    { key: "priority", header: "Priority", render: (r) => <Badge variant={r.priority?.toLowerCase()}>{r.priority}</Badge> },
    { key: "status",   header: "Status",   render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
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

  const field = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

  const formFields = (showStatus) => (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Task title</label>
        <input className={field} value={form.title} required
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Database ER modelling" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Course</label>
        <input className={field} value={form.courseName}
          onChange={(e) => setForm((f) => ({ ...f, courseName: e.target.value }))}
          placeholder="e.g. Database Systems" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
        <select className={field} value={form.priority}
          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
        <input type="date" className={field} value={form.dueDate} required
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
      </div>
      {showStatus && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select className={field} value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Topbar title="Tasks" subtitle={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}`} user={{ initials: "AM" }} />
      <div className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <DataTable
            columns={columns}
            data={tasks}
            searchPlaceholder="Search tasks…"
            emptyText="No tasks yet. Add your first one to get started."
            action={
              <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setOpen(true); }}>
                <Plus size={15} /> New task
              </Button>
            }
          />
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New task"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create task"}</Button>
          </> 
        }
      >
        <form onSubmit={handleCreate}>{formFields(false)}</form>
      </Modal>

      <Modal open={!!editItem} onClose={() => { setEditItem(null); setForm(EMPTY_FORM); }} title="Edit task"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setEditItem(null); setForm(EMPTY_FORM); }}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </>
        }
      >
        <form onSubmit={handleUpdate}>{formFields(true)}</form>
      </Modal>
    </>
  );
}
