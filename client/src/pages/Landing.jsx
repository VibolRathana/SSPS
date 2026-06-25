import { Link } from "react-router-dom";

const tasks = [
  { title: "Database ER modelling",  time: "8:00 – 10:00 AM",  priority: "High",   color: "#EF4444" },
  { title: "HCI heuristic report",   time: "1:00 – 2:30 PM",   priority: "Medium", color: "#F59E0B" },
  { title: "SE sprint review prep",  time: "3:00 – 4:00 PM",   priority: "Low",    color: "#10B981" },
];

const priorityStyle = {
  High:   "bg-red-50    text-red-500",
  Medium: "bg-amber-50  text-amber-500",
  Low:    "bg-emerald-50 text-emerald-600",
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#EEEEFF] flex items-center">
      <div className="max-w-6xl mx-auto px-8 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── Left ─────────────────────────────────────────────── */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-white text-sm text-slate-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            Built for university students
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
            Smart Study{" "}
            <span className="text-indigo-600">Planner</span>{" "}
            System
          </h1>

          {/* Sub-copy */}
          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-md">
            One place for every task, assignment, and exam —
            with AI that tells you what to do next, so nothing slips
            through the cracks.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 mb-14">
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-4 rounded-2xl transition-colors text-base"
            >
              Create account
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="font-semibold px-7 py-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors text-base"
            >
              See the dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10">
            <div>
              <div className="text-3xl font-black text-slate-900">10k+</div>
              <div className="text-sm text-slate-500 mt-0.5">active students</div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">92%</div>
              <div className="text-sm text-slate-500 mt-0.5">hit their deadlines</div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">36h</div>
              <div className="text-sm text-slate-500 mt-0.5">avg. studied / month</div>
            </div>
          </div>
        </div>

        {/* ── Right ────────────────────────────────────────────── */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Blurred blob */}
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-indigo-300/50 blur-3xl pointer-events-none" />

          {/* Card */}
          <div className="relative bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
            {/* Card header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Up next today</h2>
              <span className="text-sm font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                3 tasks
              </span>
            </div>

            {/* Task list */}
            <div className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <div key={t.title} className="flex items-center gap-4 py-4">
                  {/* Colored icon */}
                  <div className="flex flex-col gap-1 shrink-0">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-0.75 rounded-full"
                        style={{ backgroundColor: t.color, opacity: i === 1 ? 0.6 : 1 }}
                      />
                    ))}
                  </div>

                  {/* Title + time */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">{t.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.time}</div>
                  </div>

                  {/* Priority badge */}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyle[t.priority]}`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
