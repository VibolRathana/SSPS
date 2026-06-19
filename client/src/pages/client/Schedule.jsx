import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Topbar from "../../components/layout/Topbar";

// June 2026 starts on a Monday; days with events get a dot
const eventDays = [10, 12, 14, 16, 28];
const today = 10;

const agenda = [
  { time: "08:00", title: "Database ER modelling", course: "Database Systems · 2h", color: "border-l-indigo-500" },
  { time: "13:00", title: "HCI heuristic report", course: "Human–Computer Interaction · 1.5h", color: "border-l-amber-500" },
  { time: "15:00", title: "SE sprint review prep", course: "Software Engineering · 1h", color: "border-l-emerald-500" },
  { time: "19:00", title: "Research methods reading", course: "Research Methods · 1h", color: "border-l-indigo-500" },
];

const dows = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Schedule() {
  const [view, setView] = useState("Month");
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <>
      <Topbar title="Schedule" subtitle="June 2026" user={{ initials: "AM" }} />
      <div className="p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* calendar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex rounded-xl bg-indigo-50 p-1">
                {["Month", "Week", "Day"].map((v) => (
                  <button key={v} onClick={() => setView(v)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      view === v ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-50">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold">June 2026</span>
                <button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7">
              {dows.map((d) => <span key={d} className="text-center text-xs font-semibold text-slate-500">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => (
                <div key={d}
                  className={`relative grid aspect-square place-items-center rounded-xl text-sm font-medium transition cursor-pointer ${
                    d === today ? "bg-indigo-600 font-bold text-white" : "text-slate-700 hover:bg-indigo-50"}`}>
                  {d}
                  {eventDays.includes(d) && (
                    <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${d === today ? "bg-white" : "bg-indigo-500"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* agenda */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Tuesday, 10 June</h3>
            <div className="flex flex-col gap-3">
              {agenda.map((e) => (
                <div key={e.title} className={`flex gap-4 rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm ${e.color}`}>
                  <span className="font-bold text-slate-900">{e.time}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{e.title}</p>
                    <p className="text-xs text-slate-500">{e.course}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}