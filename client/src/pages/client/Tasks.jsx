import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const statusVariant = { Pending: "pending", "In Progress": "progress", Completed: "done" };

const columns = [
  { key: "name", header: "Task", className: "font-semibold" },
  { key: "course", header: "Course" },
  { key: "due", header: "Due date" },
  { key: "priority", header: "Priority", render: (r) => <Badge variant={r.priority?.toLowerCase()}>{r.priority}</Badge> },
  { key: "status", header: "Status", render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "Medium", dueDate: "" });

  function loadTasks() {
    setLoading(true);
    api.get("/tasks")
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadTasks(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/tasks", form);          // save to the database
      setForm({ title: "", priority: "Medium", dueDate: "" });
      setOpen(false);
      loadTasks();                              // refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Could not create task");
    } finally {
      setSaving(false);
    }
  }

  const field = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

  return (
    <>
      <Topbar title="Tasks" subtitle={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}`} user={{ initials: "AM" }} />
      <div className="p-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <DataTable
            columns={columns}
            data={tasks}
            searchPlaceholder="Search tasks…"
            emptyText="No tasks yet. Add your first one to get started."
            action={<Button size="sm" onClick={() => setOpen(true)}><Plus size={15} /> New task</Button>}
          />
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New task"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create task"}</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Task title</label>
            <input className={field} value={form.title} required
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Database ER modelling" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
            <select className={field} value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
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