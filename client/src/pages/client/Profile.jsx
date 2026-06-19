import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Lock, Bell, Settings, ArrowLeft, CheckSquare, Clock, Award, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Topbar from "../../components/layout/Topbar";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ tasksCompleted: 0, studyHours: 0, achievements: 0 });
  const [form, setForm] = useState({ fullName: "", email: "", major: "", phone: "", bio: "" });

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  useEffect(() => {
    api.get("/auth/stats").then((res) => setStats(res.data)).catch((e) => console.error(e));
  }, []);

  function openEdit() {
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      major: user?.major || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    });
    setEditOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      updateUser(data.user);
      setEditOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  const field = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

  const statCards = [
    { icon: CheckSquare, label: "Tasks completed", value: stats.tasksCompleted, tint: "bg-indigo-50 text-indigo-600" },
    { icon: Clock, label: "Study hours", value: `${stats.studyHours}h`, tint: "bg-amber-50 text-amber-600" },
    { icon: Award, label: "Achievements", value: stats.achievements, tint: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <>
      <Topbar title="Profile" subtitle="Your account and preferences" user={{ initials }} />
      <div className="p-8">
        <div className="mx-auto max-w-3xl space-y-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white">{initials}</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{user?.fullName || "User"}</h2>
                  <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">{user?.role || "Student"}</span>
                  <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
              <button onClick={openEdit} className="flex items-center gap-2 self-start rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                <Pencil size={15} /> Edit profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tint}`}><s.icon size={18} /></span>
                <p className="mt-3 text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button className="flex w-full items-center gap-4 border-b border-slate-100 px-6 py-4 text-left transition hover:bg-slate-50">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Lock size={17} /></span>
              <span className="flex-1 text-sm font-semibold text-slate-800">Change password</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
            <div className="flex w-full items-center gap-4 border-b border-slate-100 px-6 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Bell size={17} /></span>
              <span className="flex-1 text-sm font-semibold text-slate-800">Notifications</span>
              <button onClick={() => setNotifications((v) => !v)} className={`relative h-6 w-11 rounded-full transition ${notifications ? "bg-indigo-600" : "bg-slate-300"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${notifications ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <button className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Settings size={17} /></span>
              <span className="flex-1 text-sm font-semibold text-slate-800">Settings</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>

          <button onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile"
        footer={<>
          <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </>}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xl font-bold text-white">{initials}</div>
            <button type="button" className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">Upload picture</button>
          </div>
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input className={field} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Major</label>
            <input className={field} value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Phone number</label>
            <input className={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
            <textarea rows={3} className={field} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
        </form>
      </Modal>
    </>
  );
}