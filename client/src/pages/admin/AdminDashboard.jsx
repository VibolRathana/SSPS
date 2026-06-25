import { useEffect, useState } from "react";
import { Users, CheckSquare, FileText, GraduationCap, Clock, TrendingUp } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";

function StatCard({ icon: Icon, label, value, sub, tint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${tint}`}>
        <Icon size={20} />
      </span>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value ?? "—"}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Bar({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-semibold text-slate-700">{value} <span className="font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(r => setData(r.data)).catch(() => {});
  }, []);

  const u = data?.users   ?? {};
  const t = data?.tasks   ?? {};
  const a = data?.assignments ?? {};
  const e = data?.exams   ?? {};

  return (
    <>
      <Topbar title="Admin Dashboard" subtitle="System overview" user={{ initials: "AD" }} />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users}       label="Total users"       value={u.total}   sub={`${u.students ?? 0} students · ${u.admins ?? 0} admins`} tint="bg-indigo-50 text-indigo-600" />
          <StatCard icon={CheckSquare} label="Total tasks"       value={t.total}   sub={`${t.completed ?? 0} completed`}  tint="bg-emerald-50 text-emerald-600" />
          <StatCard icon={FileText}    label="Assignments"       value={a.total}   tint="bg-amber-50 text-amber-600" />
          <StatCard icon={GraduationCap} label="Exams tracked"  value={e.total}   tint="bg-purple-50 text-purple-600" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Task breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-900">Task status breakdown</h3>
            </div>
            <div className="space-y-4">
              <Bar label="Pending"     value={t.pending    ?? 0} total={t.total} color="bg-amber-400"   />
              <Bar label="In Progress" value={t.inProgress ?? 0} total={t.total} color="bg-indigo-500"  />
              <Bar label="Completed"   value={t.completed  ?? 0} total={t.total} color="bg-emerald-500" />
            </div>
          </div>

          {/* Recent users */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-900">Recently joined</h3>
            </div>
            {data?.recentUsers?.length === 0 ? (
              <p className="text-sm text-slate-400">No users yet.</p>
            ) : (
              <div className="space-y-3">
                {(data?.recentUsers ?? []).map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {u.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{u.fullName}</p>
                      <p className="truncate text-xs text-slate-400">{u.email}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === "Admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
