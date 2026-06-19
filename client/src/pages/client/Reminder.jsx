import { useState } from "react";
import { Plus, Trash2, Bell } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";

const initialReminders = [
  { id: 1, type: "Assignment", date: "12 Jun", time: "11:59 PM", notify: "1 hour", active: true },
  { id: 2, type: "Exam", date: "28 Jun", time: "9:00 AM", notify: "1 day", active: true },
  { id: 3, type: "Study session", date: "16 Jun", time: "7:00 PM", notify: "15 min", active: false },
];

const chips = ["15 min", "1 hour", "1 day"];

function ReminderCard({ r, onToggle, onChip }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50 px-5 py-4">
        <span className="rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-semibold text-indigo-600">{r.type}</span>
        <button onClick={() => onToggle(r.id)}
          className={`relative h-6 w-11 rounded-full transition ${r.active ? "bg-indigo-600" : "bg-slate-300"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${r.active ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">{r.date}</span>
          <span className="text-sm text-slate-500">· {r.time}</span>
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Notify before</p>
        <div className="mb-4 flex gap-2">
          {chips.map((c) => (
            <button key={c} onClick={() => onChip(r.id, c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                r.notify === c ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="h-10 flex-1 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700">Modify</button>
          <button className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Reminders() {
  const [reminders, setReminders] = useState(initialReminders);
  const toggle = (id) => setReminders((rs) => rs.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  const setChip = (id, c) => setReminders((rs) => rs.map((r) => r.id === id ? { ...r, notify: c } : r));

  return (
    <>
      <Topbar title="Reminders" subtitle="3 active reminders" user={{ initials: "AM" }}
        actions={<Button size="sm"><Plus size={15} /> Create reminder</Button>} />
      <div className="p-8">
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reminders.map((r) => <ReminderCard key={r.id} r={r} onToggle={toggle} onChip={setChip} />)}
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-600"><Bell size={20} /></span>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Never miss a deadline.</span> Set personalized reminders for assignments, exams,
            and study sessions. We'll email you at the time you choose.
          </p>
        </div>
      </div>
    </>
  );
}