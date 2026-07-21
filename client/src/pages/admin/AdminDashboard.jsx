import { useEffect, useState } from "react";
import { Users, CheckSquare, FileText, GraduationCap, Clock, TrendingUp, ShieldCheck, Database } from "lucide-react";
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value ?? "—"}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [secData, setSecData] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(r => setData(r.data)).catch(() => {});
    api.get("/admin/security").then(r => setSecData(r.data)).catch(() => {});
  }, []);

  const u = data?.users       ?? {};
  const t = data?.tasks       ?? {};
  const a = data?.assignments ?? {};
  const e = data?.exams       ?? {};
  const c = secData?.counts   ?? {};

  return (
    <>
      <Topbar title="Admin Dashboard" subtitle="System overview" user={{ initials: "AD" }} />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users}        label="Total users"    value={u.total} sub={`${u.students ?? 0} students · ${u.admins ?? 0} admins`} tint="bg-indigo-50 text-indigo-600" />
          <StatCard icon={CheckSquare}  label="Total tasks"    value={t.total} sub={`${t.completed ?? 0} completed`} tint="bg-emerald-50 text-emerald-600" />
          <StatCard icon={FileText}     label="Assignments"    value={a.total} tint="bg-amber-50 text-amber-600" />
          <StatCard icon={GraduationCap} label="Exams tracked" value={e.total} tint="bg-purple-50 text-purple-600" />
        </div>

        {/* ── Task breakdown + Recently joined ── */}
        <div className="grid gap-6 lg:grid-cols-2">
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

        {/* ── Admin accounts + Database records ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <ShieldCheck size={18} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-900">Admin accounts</h3>
              <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                {secData?.admins?.length ?? 0}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {(secData?.admins ?? []).length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-400">No admin accounts.</p>
              ) : (
                (secData?.admins ?? []).map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-6 py-3.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {a.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{a.fullName}</p>
                      <p className="truncate text-xs text-slate-400">{a.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">Last login</p>
                      <p className="text-xs font-medium text-slate-600">{a.lastLogin || "Never"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Database size={18} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-900">Database records</h3>
            </div>
            <InfoRow label="Total users"    value={c.totalUsers} />
            <InfoRow label="Tasks"          value={c.totalTasks} />
            <InfoRow label="Assignments"    value={c.totalAssignments} />
            <InfoRow label="Exams"          value={c.totalExams} />
            <InfoRow label="Reminders"      value={c.totalReminders} />
            <InfoRow label="Study sessions" value={c.totalSessions} />
          </div>
        </div>

        {/* ── Recent logins ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <Clock size={18} className="text-indigo-500" />
            <h3 className="font-semibold text-slate-900">Recent logins</h3>
          </div>
          {(secData?.recentLogins ?? []).length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-400">No login history available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["User", "Email", "Role", "Last login"].map(h => (
                      <th key={h} className="bg-slate-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(secData?.recentLogins ?? []).map((u, i) => (
                    <tr key={u.id ?? i} className="border-t border-slate-100 hover:bg-indigo-50/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === "Admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{u.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
