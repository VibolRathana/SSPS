import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Sparkles, RefreshCw, Clock } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAY_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const COLORS = [
  { value: "indigo",  bg: "bg-indigo-500",  border: "border-l-indigo-500"  },
  { value: "orange",  bg: "bg-orange-400",  border: "border-l-orange-400"  },
  { value: "green",   bg: "bg-green-500",   border: "border-l-green-500"   },
  { value: "yellow",  bg: "bg-yellow-400",  border: "border-l-yellow-400"  },
  { value: "purple",  bg: "bg-purple-500",  border: "border-l-purple-500"  },
  { value: "pink",    bg: "bg-pink-500",    border: "border-l-pink-500"    },
  { value: "red",     bg: "bg-red-500",     border: "border-l-red-500"     },
];

function borderClass(color) {
  return COLORS.find(c => c.value === color)?.border ?? "border-l-indigo-500";
}
function dotBg(color) {
  return COLORS.find(c => c.value === color)?.bg ?? "bg-indigo-400";
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const EMPTY_FORM = { title: "", courseName: "", date: "", startTime: "", duration: "1", color: "indigo" };

function MarkdownText({ text }) {
  return (
    <div className="space-y-1.5 text-sm text-slate-700 leading-relaxed">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span dangerouslySetInnerHTML={{ __html: html.replace(/^[-*]\s/, "") }} />
            </div>
          );
        }
        if (/^\d+\./.test(line.trim())) {
          return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 font-semibold text-indigo-600">{line.match(/^\d+/)[0]}.</span>
              <span dangerouslySetInnerHTML={{ __html: html.replace(/^\d+\.\s*/, "") }} />
            </div>
          );
        }
        if (line.startsWith("###")) return <p key={i} className="font-bold text-slate-900 mt-2" dangerouslySetInnerHTML={{ __html: html.replace(/^###\s*/, "") }} />;
        if (line.startsWith("##"))  return <p key={i} className="font-bold text-slate-900 text-base mt-2" dangerouslySetInnerHTML={{ __html: html.replace(/^##\s*/, "") }} />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}

export default function Schedule() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate,     setViewDate]     = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [sessions,     setSessions]     = useState([]);
  const [modal,        setModal]        = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);

  const [aiRec,     setAiRec]     = useState(null);
  const [aiAt,      setAiAt]      = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInit,    setAiInit]    = useState(true);

  useEffect(() => { loadSessions(); }, [viewDate]);

  useEffect(() => {
    api.get("/recommendations")
      .then(res => {
        if (res.data.recommendation) {
          setAiRec(res.data.recommendation);
          setAiAt(res.data.generatedAt);
        }
      })
      .catch(() => {})
      .finally(() => setAiInit(false));
  }, []);

  async function handleAskAI() {
    setAiLoading(true);
    try {
      const { data } = await api.post("/recommendations/ask");
      setAiRec(data.recommendation);
      setAiAt(null);
    } catch (err) {
      alert(err.response?.data?.message || "Could not get recommendation.");
    } finally {
      setAiLoading(false);
    }
  }

  function loadSessions() {
    api.get(`/schedule?year=${viewDate.getFullYear()}&month=${viewDate.getMonth() + 1}`)
      .then(res => setSessions(res.data))
      .catch(() => {});
  }

  // Build 6-week Mon-Sun grid
  const calendarDays = useMemo(() => {
    const yr  = viewDate.getFullYear();
    const mo  = viewDate.getMonth();
    const first = new Date(yr, mo, 1);
    // Mon-based offset: Sun=0 → 6, Mon=1 → 0, Tue=2 → 1 …
    const offset = (first.getDay() + 6) % 7;
    const days = [];
    for (let i = offset - 1; i >= 0; i--) {
      days.push({ date: new Date(yr, mo, -i), inMonth: false });
    }
    const last = new Date(yr, mo + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      days.push({ date: new Date(yr, mo, d), inMonth: true });
    }
    let next = 1;
    while (days.length < 42) {
      days.push({ date: new Date(yr, mo + 1, next++), inMonth: false });
    }
    return days;
  }, [viewDate]);

  const sessionsByDate = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [sessions]);

  const dayEvents = sessionsByDate[dateKey(selectedDate)] ?? [];

  const todayKey = dateKey(today);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: dateKey(selectedDate) });
    setModal(true);
  }

  function openEdit(s) {
    setEditing(s.id);
    setForm({
      title:      s.title,
      courseName: s.course || "",
      date:       s.date,
      startTime:  s.startTime,
      duration:   String(s.duration),
      color:      s.color || "indigo",
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date || !form.startTime) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/schedule/${editing}`, form);
      } else {
        await api.post("/schedule", form);
      }
      setModal(false);
      loadSessions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save session.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this session?")) return;
    try {
      await api.delete(`/schedule/${id}`);
      loadSessions();
    } catch { /* empty */ }
  }

  function fmtDuration(d) {
    const n = parseFloat(d);
    return Number.isInteger(n) ? `${n}h` : `${n}h`;
  }

  function fmtDayHeader(d) {
    return `${DAY_FULL[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  }

  return (
    <>
      <Topbar
        title="Schedule"
        subtitle={`${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
        user={{ initials: "AM" }}
        actions={
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus size={15} /> Add session
          </Button>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Calendar ── */}
          <div className="w-full lg:w-140 shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              {/* View tabs */}
              <div className="flex rounded-lg bg-slate-100 p-0.5 gap-0.5">
                {["Month", "Week", "Day"].map(v => (
                  <button
                    key={v}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                      ${v === "Month"
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {/* Month nav */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-slate-900 w-32 text-center">
                  {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map(({ date, inMonth }, i) => {
                const key      = dateKey(date);
                const isToday  = key === todayKey;
                const isSel    = key === dateKey(selectedDate);
                const dots     = sessionsByDate[key];

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(new Date(date))}
                    className="flex flex-col items-center py-1.5 cursor-pointer select-none"
                  >
                    <span className={`
                      w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors
                      ${isSel  ? "bg-indigo-600 text-white font-semibold" : ""}
                      ${!isSel && isToday  ? "bg-indigo-100 text-indigo-700 font-semibold" : ""}
                      ${!isSel && !isToday && inMonth  ? "text-slate-700 hover:bg-slate-100" : ""}
                      ${!isSel && !isToday && !inMonth ? "text-slate-300" : ""}
                    `}>
                      {date.getDate()}
                    </span>
                    {dots ? (
                      <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSel ? "bg-white/80" : dotBg(dots[0].color)}`} />
                    ) : (
                      <span className="mt-0.5 h-1.5 w-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Day event list ── */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-800 mb-4">{fmtDayHeader(selectedDate)}</h3>

            {dayEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <p className="text-sm text-slate-400">No sessions scheduled for this day.</p>
                <button
                  onClick={openCreate}
                  className="mt-2 text-xs text-indigo-500 hover:underline"
                >
                  + Add a session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map(s => (
                  <div
                    key={s.id}
                    className={`flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm`}
                  >
                    {/* Colored left stripe */}
                    <div className={`w-1 shrink-0 border-l-4 ${borderClass(s.color)}`} />
                    <div className="flex flex-1 items-center gap-4 px-4 py-3">
                      <span className="w-14 shrink-0 text-sm font-semibold text-slate-500">{s.startTime}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{s.title}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {s.course ? `${s.course} · ` : ""}{fmtDuration(s.duration)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── AI Recommendation panel ── */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles size={16} />
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">AI Study Plan</h4>
                <p className="text-xs text-slate-400">Gemini analyses your tasks, assignments &amp; exams</p>
              </div>
            </div>
            <button
              onClick={handleAskAI}
              disabled={aiLoading || aiInit}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {aiLoading
                ? <><RefreshCw size={13} className="animate-spin" /> Analysing…</>
                : <><RefreshCw size={13} /> {aiRec ? "Refresh" : "Generate"}</>}
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {/* Loading skeleton */}
            {aiLoading && (
              <div className="space-y-2.5 animate-pulse">
                <div className="h-3 w-2/5 rounded bg-slate-100" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
                <div className="h-3 w-4/6 rounded bg-slate-100" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-3/4 rounded bg-slate-100" />
              </div>
            )}

            {/* Result */}
            {!aiLoading && aiRec && (
              <>
                {aiAt && (
                  <div className="mb-3 flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={11} /> Generated {aiAt}
                  </div>
                )}
                <MarkdownText text={aiRec} />
              </>
            )}

            {/* Empty state */}
            {!aiLoading && !aiRec && !aiInit && (
              <div className="py-8 text-center">
                <Sparkles size={28} className="mx-auto mb-2 text-indigo-200" />
                <p className="text-sm text-slate-500">No recommendations yet.</p>
                <p className="mt-0.5 text-xs text-slate-400">Click "Generate" to let Gemini analyse your workload.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{editing ? "Edit Session" : "New Session"}</h3>
              <button
                onClick={() => setModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Title</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Database ER modelling"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Course</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Database Systems"
                  value={form.courseName}
                  onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Start time</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Duration (hours)</label>
                <input
                  type="number"
                  min="0.5"
                  max="8"
                  step="0.5"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setForm(f => ({ ...f, color: c.value }))}
                      className={`h-7 w-7 rounded-full ${c.bg} transition-all
                        ${form.color === c.value ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "opacity-50 hover:opacity-90"}`}
                      title={c.value}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModal(false)}>Cancel</Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.date || !form.startTime}
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Add session"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
