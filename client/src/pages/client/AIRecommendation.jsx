import { Brain } from "lucide-react";
import Topbar from "../../components/layout/Topbar";

const priorities = [
  { rank: 1, name: "Database ER modelling", score: 70, color: "text-rose-600 bg-rose-50" },
  { rank: 2, name: "HCI heuristic report", score: 58, color: "text-amber-600 bg-amber-50" },
  { rank: 3, name: "SE sprint review prep", score: 50, color: "text-indigo-600 bg-indigo-50" },
];

const actions = [
  { rank: 1, verb: "Finish", text: "the ERD — it's due first and worth the most" },
  { rank: 2, verb: "Continue", text: "the HCI report; you're 40% through" },
  { rank: 3, verb: "Review", text: "SE notes before the sprint meeting" },
];

export default function AIRecommendations() {
  return (
    <>
      <Topbar title="AI recommendations" subtitle="Ranked by deadline, difficulty, and your progress" user={{ initials: "AM" }} />
      <div className="p-8">
        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* priority order */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4 text-base font-bold">Priority order</div>
            {priorities.map((p) => (
              <div key={p.rank} className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-0">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">{p.rank}</span>
                <span className="flex-1 text-sm font-semibold text-slate-800">{p.name}</span>
                <span className={`grid h-11 w-11 place-items-center rounded-full text-sm font-bold ${p.color}`}>{p.score}</span>
              </div>
            ))}
          </div>

          {/* recommended actions */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4 text-base font-bold">What to do next</div>
            {actions.map((a) => (
              <div key={a.rank} className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-0">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">{a.rank}</span>
                <span className="text-sm text-slate-600">
                  <span className="font-semibold text-indigo-600">{a.verb}</span> {a.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-600"><Brain size={20} /></span>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">How this works.</span> The planner weighs each task's deadline, estimated difficulty,
            and how far along you are, then orders them so you tackle the highest-impact work first.
          </p>
        </div>
      </div>
    </>
  );
}