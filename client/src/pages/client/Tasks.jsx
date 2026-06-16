import Topbar from "../../components/layout/Topbar";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Plus } from "lucide-react";

const sampleTasks = [
  { id: 1, name: "Database ER modelling", course: "Database Systems", due: "12 Jun 2026", priority: "High", status: "Pending" },
  { id: 2, name: "HCI heuristic report", course: "Human–Computer Interaction", due: "14 Jun 2026", priority: "Medium", status: "Pending" },
  { id: 3, name: "SE sprint review prep", course: "Software Engineering", due: "15 Jun 2026", priority: "Medium", status: "In progress" },
  { id: 4, name: "RM literature summary", course: "Research Methods", due: "16 Jun 2026", priority: "Low", status: "Pending" },
  { id: 5, name: "Web dev portfolio polish", course: "Web Development", due: "18 Jun 2026", priority: "Low", status: "Done" },
];

const statusVariant = { Pending: "pending", "In progress": "progress", Done: "done" };

const columns = [
  { key: "name", header: "Task", className: "font-semibold" },
  { key: "course", header: "Course" },
  { key: "due", header: "Due date" },
  { key: "priority", header: "Priority",
    render: (r) => <Badge variant={r.priority.toLowerCase()}>{r.priority}</Badge> },
  { key: "status", header: "Status",
    render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
];

export default function Tasks({ tasks = sampleTasks }) {
  return (
    <>
      <Topbar title="Tasks" subtitle="10 tasks · 4 due today" user={{ initials: "AM" }} />
      <div className="p-8">
        <DataTable
          columns={columns}
          data={tasks}
          searchPlaceholder="Search tasks…"
          action={<Button size="sm"><Plus size={15} /> New task</Button>}
        />
      </div>
    </>
  );
}