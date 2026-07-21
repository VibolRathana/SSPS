import { useEffect, useState } from "react";
import { Trash2, ShieldCheck, UserIcon } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import DataTable from "../../components/ui/DataTable";
<<<<<<< HEAD

=======
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("/admin/users")
      .then(r => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  async function handleRole(user) {
    const newRole = user.role === "Admin" ? "Student" : "Admin";
    if (!confirm(`Change ${user.fullName}'s role to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update role.");
    }
  }

  async function handleDelete(user) {
    if (!confirm(`Permanently delete ${user.fullName}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete user.");
    }
  }

  const columns = [
    {
      key: "fullName", header: "Name",
      render: r => (
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
            {r.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{r.fullName}</p>
            <p className="text-xs text-slate-400">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", header: "Role",
      render: r => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.role === "Admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
          {r.role === "Admin" ? <ShieldCheck size={11} /> : <UserIcon size={11} />}
          {r.role}
        </span>
      ),
    },
    { key: "major",    header: "Major",      render: r => r.major    || <span className="text-slate-300">—</span> },
    { key: "joinedAt", header: "Joined",     render: r => r.joinedAt || <span className="text-slate-300">—</span> },
    { key: "lastLogin",header: "Last login", render: r => r.lastLogin || <span className="text-slate-300">Never</span> },
    {
      key: "actions", header: "",
      render: r => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleRole(r)}
            title={r.role === "Admin" ? "Demote to Student" : "Promote to Admin"}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ShieldCheck size={14} />
          </button>
          <button
            onClick={() => handleDelete(r)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Users"
        subtitle={`${users.length} registered user${users.length !== 1 ? "s" : ""}`}
        user={{ initials: "AD" }}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            searchPlaceholder="Search users…"
            emptyText="No users found."
          />
        )}
      </div>
    </>
  );
}
