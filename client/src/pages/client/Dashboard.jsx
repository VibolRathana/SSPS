import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie,
} from "recharts";
import {
  CheckSquare, FileText, GraduationCap, Calendar,
  Plus, ArrowRight, Clock, AlertTriangle, Sparkles,
} from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import { useAuth } from "../../context/AuthContext";

// ── helpers ──────────────────────────────────────────────────────
const PRIORITY_COLOR = {
  High:   "bg-red-100 text-red-600",
  Medium: "bg-amber-100 text-amber-600",
  Low:    "bg-slate-100 text-slate-500",
};
const SESSION_BORDER = {
  indigo: "border-l-indigo-500", orange: "border-l-orange-400",
  green:  "border-l-green-500",  yellow: "border-l-yellow-400",
  purple: "border-l-purple-500", pink:   "border-l-pink-500",
  red:    "border-l-red-500",
};
const BAR_COLORS = ["#6366F1","#F59E0B","#10B981","#3B82F6","#F43F5E","#8B5CF6"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
function daysLeftLabel(rawDate) {
  const diff = Math.ceil((new Date(rawDate) - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff === 0) return { label: "Today",    color: "text-red-500"   };
  if (diff === 1) return { label: "Tomorrow", color: "text-amber-500" };
  if (diff <= 3)  return { label: `${diff}d`, color: "text-amber-500" };
  return            { label: `${diff}d`,      color: "text-slate-400" };
}

// ── chart helpers ─────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, suffix = "" }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700">{p.payload.course || p.payload.name}</p>
      <p className="text-slate-500">{p.value}{suffix}</p>
    </div>
  );
};
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.62;
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="700">
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

// ── component ─────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard").then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const firstName = user?.fullName?.split(" ")[0] || "there";
  const initials  = user?.fullName?.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() || "U";
  const s  = data?.stats        ?? {};
  const bc = data?.studyByCourse ?? [];
  const ts = data?.taskStatus    ?? [];
  const totalStudy = bc.reduce((a, d) => a + d.hours, 0);

  const statCards = [
    { icon: CheckSquare,   label: "Pending tasks",      value: s.pendingTasks,       to: "/app/tasks",           tint: "bg-indigo-50 text-indigo-600"  },
    { icon: FileText,      label: "Assignments due",    value: s.pendingAssignments, to: "/app/assignments",     tint: "bg-amber-50 text-amber-600"    },
    { icon: GraduationCap, label: "Upcoming exams",     value: s.upcomingExams,      to: "/app/exams",           tint: "bg-purple-50 text-purple-600"  },
    { icon: Calendar,      label: "Sessions this week", value: s.weekSessions,       to: "/app/schedule",        tint: "bg-emerald-50 text-emerald-600" },
  ];

  const quickActions = [
    { label: "New task",       to: "/app/tasks",            icon: CheckSquare,   color: "bg-indigo-600 text-white hover:bg-indigo-700" },
    { label: "New assignment", to: "/app/assignments",      icon: FileText,      color: "bg-amber-500 text-white hover:bg-amber-600"   },
    { label: "Add exam",       to: "/app/exams",            icon: GraduationCap, color: "bg-purple-600 text-white hover:bg-purple-700" },
    { label: "AI study plan",  to: "/app/recommendations",  icon: Sparkles,      color: "bg-slate-800 text-white hover:bg-slate-900"   },
  ];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={new Date().toLocaleDateString("en-US", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        user={{ initials }}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Welcome banner */}
        <div className="rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 px-6 py-5 text-white">
          <p className="text-sm text-indigo-200">{greeting()},</p>
          <h2 className="mt-0.5 text-2xl font-bold">{firstName} 👋</h2>
          <p className="mt-1 text-sm text-indigo-200">
            {(s.pendingTasks > 0 || s.pendingAssignments > 0)
              ? `You have ${s.pendingTasks ?? 0} pending task${s.pendingTasks !== 1 ? "s" : ""} and ${s.pendingAssignments ?? 0} assignment${s.pendingAssignments !== 1 ? "s" : ""} due.`
              : "You're all caught up — great work!"}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(({ icon: Icon, label, value, to, tint }) => (
            <Link key={label} to={to} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-200">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}><Icon size={18} /></span>
              <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "—" : (value ?? 0)}</p>
              <p className="mt-0.5 text-sm text-slate-500">{label}</p>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map(({ label, to, icon: Icon, color }) => (
            <Link key={label} to={to} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${color}`}>
              <Icon size={14} /> {label}
            </Link>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Bar chart — study hours by course */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Study hours by course</h3>
                <p className="text-xs text-slate-400">This week</p>
              </div>
              {totalStudy > 0 && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">{totalStudy}h total</span>
              )}
            </div>
            {bc.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <div className="text-center">
                  <Calendar size={28} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-sm text-slate-400">No study sessions this week</p>
                  <Link to="/app/schedule" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:underline"><Plus size={11} /> Add session</Link>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={bc} margin={{ top: 24, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="course" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} width={30} />
                  <Tooltip content={<ChartTooltip suffix="h" />} cursor={{ fill: "#F8FAFC" }} />
                  <Bar dataKey="hours" radius={[6,6,0,0]} maxBarSize={44}>
                    {bc.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart — task status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Task status</h3>
              <p className="text-xs text-slate-400">All your tasks</p>
            </div>
            {ts.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <div className="text-center">
                  <CheckSquare size={28} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-sm text-slate-400">No tasks yet</p>
                  <Link to="/app/tasks" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:underline"><Plus size={11} /> Add task</Link>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={ts} dataKey="value" cx="50%" cy="50%" outerRadius={82}
                      stroke="#fff" strokeWidth={2} labelLine={false} label={PieLabel}>
                      {ts.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip suffix=" tasks" />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 grid grid-cols-1 gap-1.5">
                  {ts.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
                      <span className="flex-1 text-xs text-slate-600">{d.name}</span>
                      <span className="text-xs font-semibold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Upcoming deadlines */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <h3 className="font-semibold text-slate-900">Upcoming deadlines</h3>
              </div>
              <span className="text-xs text-slate-400">Next 14 days</span>
            </div>
            {loading ? (
              <div className="space-y-3 p-5">{[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />)}</div>
            ) : (data?.deadlines ?? []).length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckSquare size={26} className="mx-auto mb-2 text-emerald-300" />
                <p className="text-sm text-slate-400">No deadlines in the next 14 days!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {(data?.deadlines ?? []).map(d => {
                  const { label, color } = daysLeftLabel(d.rawDue);
                  return (
                    <div key={`${d.type}-${d.id}`} className="flex items-center gap-3 px-5 py-3">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${d.type === "Task" ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-600"}`}>{d.type}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{d.title}</p>
                        {d.course && <p className="truncate text-xs text-slate-400">{d.course}</p>}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-xs font-semibold ${color}`}>{label}</p>
                        <p className="text-xs text-slate-400">{d.dueDate}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLOR[d.priority] ?? "bg-slate-100 text-slate-500"}`}>{d.priority}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to="/app/tasks" className="flex items-center justify-center gap-1 border-t border-slate-100 py-3 text-xs font-semibold text-indigo-500 hover:bg-indigo-50 transition">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-6">
            {/* Today's sessions */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-indigo-500" />
                  <h3 className="font-semibold text-slate-900">Today's sessions</h3>
                </div>
                <Link to="/app/schedule" className="text-xs font-semibold text-indigo-500 hover:underline">Schedule</Link>
              </div>
              {loading ? (
                <div className="space-y-2 p-4">{[1,2].map(i => <div key={i} className="h-8 rounded-lg bg-slate-100 animate-pulse" />)}</div>
              ) : (data?.todaySessions ?? []).length === 0 ? (
                <div className="px-5 py-5 text-center">
                  <p className="text-sm text-slate-400">No sessions today.</p>
                  <Link to="/app/schedule" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:underline"><Plus size={11} /> Add session</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {(data?.todaySessions ?? []).map(s => (
                    <div key={s.id} className="flex overflow-hidden">
                      <div className={`w-1 shrink-0 border-l-4 ${SESSION_BORDER[s.color] ?? "border-l-indigo-500"}`} />
                      <div className="flex flex-1 items-center gap-3 px-4 py-3">
                        <span className="w-12 shrink-0 text-xs font-semibold text-slate-500">{s.startTime}</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">{s.title}</p>
                          {s.course && <p className="text-xs text-slate-400">{s.course} · {s.duration}h</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming exams */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-purple-500" />
                  <h3 className="font-semibold text-slate-900">Upcoming exams</h3>
                </div>
                <Link to="/app/exams" className="text-xs font-semibold text-indigo-500 hover:underline">View all</Link>
              </div>
              {loading ? (
                <div className="space-y-2 p-4">{[1,2].map(i => <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />)}</div>
              ) : (data?.exams ?? []).length === 0 ? (
                <p className="px-5 py-5 text-center text-sm text-slate-400">No upcoming exams.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {(data?.exams ?? []).map(e => {
                    const prep = Number(e.preparation) || 0;
                    return (
                      <div key={e.id} className="px-5 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{e.subject}</p>
                            <p className="text-xs text-slate-400">{e.examDate} · <span className={Number(e.daysLeft) <= 3 ? "text-red-500 font-semibold" : ""}>{Number(e.daysLeft) === 0 ? "Today!" : `${e.daysLeft}d left`}</span></p>
                          </div>
                          <span className="shrink-0 ml-3 text-xs font-bold text-slate-600">{prep}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100">
                          <div className={`h-1.5 rounded-full transition-all ${prep >= 80 ? "bg-emerald-500" : prep >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${prep}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
