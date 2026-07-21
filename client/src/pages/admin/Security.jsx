import { useEffect, useState } from "react";
import { ShieldCheck, Clock, Database, AlertTriangle } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value ?? "—"}</span>
    </div>
  );
}

export default function Security() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/security").then(r => setData(r.data)).catch(() => {});
  }, []);

  const counts = data?.counts ?? {};

  return (
    <>
      <Topbar title="Security" subtitle="Admin accounts and activity" user={{ initials: "AD" }} />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Admin accounts */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <ShieldCheck size={18} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-900">Admin accounts</h3>
              <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                {data?.admins?.length ?? 0}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {(data?.admins ?? []).length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-400">No admin accounts.</p>
              ) : (
                (data?.admins ?? []).map(a => (
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

          {/* System data counts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Database size={18} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-900">Database records</h3>
            </div>
            <InfoRow label="Total users"      value={counts.totalUsers} />
            <InfoRow label="Tasks"            value={counts.totalTasks} />
            <InfoRow label="Assignments"      value={counts.totalAssignments} />
            <InfoRow label="Exams"            value={counts.totalExams} />
            <InfoRow label="Reminders"        value={counts.totalReminders} />
            <InfoRow label="Study sessions"   value={counts.totalSessions} />
          </div>

        </div>

        {/* Recent logins */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <Clock size={18} className="text-indigo-500" />
            <h3 className="font-semibold text-slate-900">Recent logins</h3>
          </div>
          {(data?.recentLogins ?? []).length === 0 ? (
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
                  {(data?.recentLogins ?? []).map((u, i) => (
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

        {/* Security notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Security reminder</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Never share admin credentials. Ensure <code className="rounded bg-amber-100 px-1">.env</code> is excluded from version control and rotate API keys periodically.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
