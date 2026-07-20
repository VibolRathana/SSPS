import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Lock, BellRing, Info, ArrowLeft, CheckSquare, Award, ChevronRight, BookOpen, Brain, Calendar, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePushNotification } from "../../hooks/usePushNotification";
import Topbar from "../../components/layout/Topbar";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

export default function Profile() {
  const { user, updateUser }      = useAuth();
  const navigate                  = useNavigate();
  const { supported: pushSupported, subscribed: pushSubscribed, loading: pushLoading, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotification();
  const [editOpen, setEditOpen]   = useState(false);
  const [pwOpen, setPwOpen]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [stats, setStats]         = useState({ tasksCompleted: 0, achievements: 0 });
  const [form, setForm]           = useState({ fullName: "", email: "", major: "", phone: "", bio: "" });
  const [pwForm, setPwForm]       = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError]     = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

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

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwOpen(false);
    } catch (err) {
      setPwError(err.response?.data?.message || "Could not change password");
    } finally {
      setSaving(false);
    }
  }

  const field = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

  const statCards = [
    { icon: CheckSquare, label: "Tasks completed", value: stats.tasksCompleted, tint: "bg-indigo-50 text-indigo-600" },
    { icon: Award, label: "Achievements", value: stats.achievements, tint: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <>
      <Topbar title="Profile" subtitle="Your account and preferences" user={{ initials }} />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white">{initials}</div>
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
            <button onClick={() => { setPwError(""); setPwOpen(true); }} className="flex w-full items-center gap-4 border-b border-slate-100 px-6 py-4 text-left transition hover:bg-slate-50">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Lock size={17} /></span>
              <span className="flex-1 text-sm font-semibold text-slate-800">Change password</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
            <div className="flex w-full items-center gap-4 border-b border-slate-100 px-6 py-4">
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${pushSupported ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-300"}`}>
                <BellRing size={17} />
              </span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${pushSupported ? "text-slate-800" : "text-slate-400"}`}>Browser notifications</p>
                <p className="text-xs text-slate-400">
                  {!pushSupported
                    ? "Not supported in this browser"
                    : pushSubscribed
                      ? "You'll get pop-up reminders"
                      : "Enable pop-up reminders in your browser"}
                </p>
              </div>
              {pushSupported && (
                <button
                  onClick={pushSubscribed ? pushUnsubscribe : pushSubscribe}
                  disabled={pushLoading}
                  className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${pushSubscribed ? "bg-indigo-600" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${pushSubscribed ? "left-5.5" : "left-0.5"}`} />
                </button>
              )}
            </div>
            <button onClick={() => setAboutOpen(true)} className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Info size={17} /></span>
              <span className="flex-1 text-sm font-semibold text-slate-800">About</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>

          <button onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change password"
        footer={<>
          <Button variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
          <Button type="submit" form="change-password-form" disabled={saving}>{saving ? "Saving…" : "Update password"}</Button>
        </>}>
        <form id="change-password-form" onSubmit={handleChangePassword} className="space-y-4">
          {pwError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{pwError}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input type="password" className={field} value={pwForm.currentPassword} required
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Enter your current password" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input type="password" className={field} value={pwForm.newPassword} required minLength={8}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="At least 8 characters" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
            <input type="password" className={field} value={pwForm.confirmPassword} required
              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter new password" />
          </div>
        </form>
      </Modal>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About"
        footer={<Button onClick={() => setAboutOpen(false)}>Close</Button>}>
        <div className="space-y-6">
          {/* App identity */}
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white">P</div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Smart Study Planner</h3>
              <span className="text-xs text-slate-400">Version 1.0.0</span>
            </div>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed">
            An all-in-one academic productivity app to help students manage tasks, assignments, exams, schedules, and reminders — powered by AI recommendations.
          </p>

          {/* Feature list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Features</p>
            {[
              { icon: BookOpen,  label: "Tasks & Assignments & Exams",   desc: "Track and manage your academic workload"    },
              { icon: Calendar,  label: "Schedule & Reminders",  desc: "Plan study sessions and get email alerts"   },
              { icon: Brain,     label: "AI Recommendations",    desc: "Groq AI suggests what to prioritise"        },
              { icon: Award,     label: "Exam Tracker",          desc: "Monitor exam prep progress"                 },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Developer */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Developer</p>
            <p className="text-sm font-semibold text-slate-800">Soem VibolRathana</p>
            <a href="mailto:soemvibolrathana@gmail.com" className="flex items-center gap-1.5 mt-1 text-xs text-indigo-500 hover:underline">
              <Mail size={11} /> soemvibolrathana@gmail.com
            </a>
            <p className="text-sm font-semibold text-slate-800">Soeurn Tola</p>
            <a href="mailto:soeuntola@gmail.com" className="flex items-center gap-1.5 mt-1 text-xs text-indigo-500 hover:underline">
              <Mail size={11} /> soeuntola@gmail.com
            </a>
            <p className="text-sm font-semibold text-slate-800">Yuth Molika</p>
            <a href="mailto:yuthmolika@gmail.com" className="flex items-center gap-1.5 mt-1 text-xs text-indigo-500 hover:underline">
              <Mail size={11} /> yuthmolika@gmail.com
            </a>
          </div>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile"
        footer={<>
          <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button type="submit" form="edit-profile-form" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </>}>
        <form id="edit-profile-form" onSubmit={handleSave} className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input className={field} value={form.fullName} required onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" className={field} value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
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
