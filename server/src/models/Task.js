import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

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

  useEffect(() => {
    api.get("/tasks")
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
            action={<Button size="sm"><Plus size={15} /> New task</Button>}
          />
        )}
      </div>
    </>
  );
}