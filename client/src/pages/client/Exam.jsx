import { Plus } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";

const sampleExams = [
  { id: 1, name: "Final — Normalization & SQL", course: "Database Systems", date: "28 Jun 2026", prep: 82 },
  { id: 2, name: "Midterm — Usability principles", course: "HCI", date: "02 Jul 2026", prep: 64 },
  { id: 3, name: "Quiz — Agile fundamentals", course: "Software Engineering", date: "05 Jul 2026", prep: 45 },
];

const ProgressBar = ({ value }) => (
  <div className="flex items-center gap-3">
    <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700" style={{ width: `${value}%` }} />
    </div>
    <span className="text-sm font-semibold text-slate-700">{value}%</span>
  </div>
);

const columns = [
  { key: "name", header: "Exam", className: "font-semibold" },
  { key: "course", header: "Course" },
  { key: "date", header: "Date" },
  { key: "prep", header: "Preparation", render: (r) => <ProgressBar value={r.prep} /> },
];

export default function Exams({ exams = sampleExams }) {
  return (
    <>
      <Topbar title="Exams" subtitle="2 exams · next in 18 days" user={{ initials: "AM" }} />
      <div className="p-8">
        <DataTable
          columns={columns}
          data={exams}
          searchPlaceholder="Search exams…"
          action={<Button size="sm"><Plus size={15} /> Add exam</Button>}
        />
      </div>
    </>
  );
}