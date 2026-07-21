import { useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw, Clock, Send, Bot, User, Calendar, Plus } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import MarkdownText from "../../components/ui/MarkdownText";
import { useAuth } from "../../context/AuthContext";

// ── MarkdownText ─────────────────────────────────────────────────
<<<<<<< HEAD
function MarkdownText({ text }) {
  return (
    <div className="space-y-1.5 text-sm text-slate-700 leading-relaxed">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        if (line.trim().startsWith("- ") || line.trim().startsWith("* "))
          return <div key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" /><span dangerouslySetInnerHTML={{ __html: html.replace(/^[-*]\s/, "") }} /></div>;
        if (/^\d+\./.test(line.trim()))
          return <div key={i} className="flex gap-2"><span className="shrink-0 font-semibold text-indigo-600">{line.match(/^\d+/)?.[0]}.</span><span dangerouslySetInnerHTML={{ __html: html.replace(/^\d+\.\s*/, "") }} /></div>;
        if (line.startsWith("###")) return <p key={i} className="font-bold text-slate-900 mt-2" dangerouslySetInnerHTML={{ __html: html.replace(/^###\s*/, "") }} />;
        if (line.startsWith("##"))  return <p key={i} className="font-bold text-slate-900 text-base mt-2" dangerouslySetInnerHTML={{ __html: html.replace(/^##\s*/, "") }} />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}


=======
// ── Score label colors ────────────────────────────────────────────
const SCORE_STYLE = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  Urgent:   "bg-orange-100 text-orange-700 border-orange-200",
  Moderate: "bg-amber-100 text-amber-700 border-amber-200",
  Low:      "bg-slate-100 text-slate-600 border-slate-200",
};
const SCORE_BAR = {
  Critical: "bg-red-500",
  Urgent:   "bg-orange-400",
  Moderate: "bg-amber-400",
  Low:      "bg-slate-300",
};
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

const SESSION_DOT = {
  indigo: "bg-indigo-500", orange: "bg-orange-400", green: "bg-green-500",
  yellow: "bg-yellow-400", purple: "bg-purple-500", pink: "bg-pink-500", red: "bg-red-500",
};

// ── Tabs ──────────────────────────────────────────────────────────
const TABS = [
  { id: "plan",     label: "AI Plan",   icon: Sparkles  },
  { id: "schedule", label: "Schedule",  icon: Calendar  },
  { id: "chat",     label: "Chat",      icon: Bot       },
];

// ── sessionStorage helpers ────────────────────────────────────────
function ssGet(key, fallback) {
  try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function ssSet(key, value) {
<<<<<<< HEAD
  try { sessionStorage.setItem(key, JSON.stringify(value)); }
  catch(err){
    console.error(err);
  }
=======
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be disabled. */ }
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
}

// ─────────────────────────────────────────────────────────────────
export default function AIRecommendation() {
  const { user } = useAuth();
  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const [tab, setTab] = useState(() => ssGet("ai_tab", "plan"));

  // ── Plan tab ──
  const [recommendation, setRecommendation] = useState(() => ssGet("ai_plan", null));
  const [generatedAt,    setGeneratedAt]    = useState(() => ssGet("ai_plan_at", null));
  const [planLoading,    setPlanLoading]    = useState(false);
  const [planInit,       setPlanInit]       = useState(() => !recommendation);

  
  // ── Schedule tab ──
  const [sessions,         setSessions]         = useState(() => ssGet("ai_sessions", []));
  const [schedLoading,     setSchedLoading]     = useState(false);
  const [addingAll,        setAddingAll]        = useState(false);
  const [addedIds,         setAddedIds]         = useState(() => new Set(ssGet("ai_added", [])));
  const [addingIdx,        setAddingIdx]        = useState(null);

  // ── Chat tab ──
  const [messages,     setMessages]     = useState(() => ssGet("ai_chat", []));
  const [chatInput,    setChatInput]    = useState("");
  const [chatLoading,  setChatLoading]  = useState(false);
  const chatEndRef = useRef(null);

  // persist tab choice
  useEffect(() => { ssSet("ai_tab", tab); }, [tab]);

  // load last plan on mount (only if not already cached)
  useEffect(() => {
<<<<<<< HEAD
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (recommendation) { setPlanInit(false); return; }
=======
    if (recommendation) return;
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
    api.get("/recommendations")
      .then(r => {
        if (r.data.recommendation) {
          setRecommendation(r.data.recommendation);
          setGeneratedAt(r.data.generatedAt);
          ssSet("ai_plan", r.data.recommendation);
          ssSet("ai_plan_at", r.data.generatedAt);
        }
      })
      .catch(() => { /* The empty state is shown when loading fails. */ })
      .finally(() => setPlanInit(false));
  }, [recommendation]);

  // auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Handlers ──────────────────────────────────────────────────
  async function handleAskPlan() {
    setPlanLoading(true);
    try {
      const { data } = await api.post("/recommendations/ask");
      setRecommendation(data.recommendation);
      setGeneratedAt(null);
      ssSet("ai_plan", data.recommendation);
      ssSet("ai_plan_at", null);
    } catch (err) { alert(err.response?.data?.message || "Could not get recommendation."); }
    finally { setPlanLoading(false); }
  }


  async function handleGenerateSchedule() {
    setSchedLoading(true);
    try {
      const { data } = await api.post("/recommendations/generate-schedule");
      console.log("API Response:");
      console.log(data);
      console.log("Session:");
      console.log(data.sessions);
     const newSessions = Array.isArray(data.sessions)
  ? data.sessions
  : [];

setSessions(newSessions);

ssSet("ai_sessions", newSessions);
      
    } catch (err) { console.error(err); }
    finally { setSchedLoading(false); }
  }

  async function handleAddOne(session, idx) {
    setAddingIdx(idx);
    try {
      await api.post("/recommendations/add-schedule", { sessions: [session] });
      setAddedIds(prev => {
        const next = new Set([...prev, idx]);
        ssSet("ai_added", [...next]);
        return next;
      });
<<<<<<< HEAD
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Could not add session."); }
=======
    } catch { alert("Could not add session."); }
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
    finally { setAddingIdx(null); }
  }

  async function handleAddAll() {
    setAddingAll(true);
    try {
      const { data } = await api.post("/recommendations/add-schedule", { sessions });
      const allIdx = new Set(sessions.map((_, i) => i));
      setAddedIds(allIdx);
      ssSet("ai_added", [...allIdx]);
      alert(`${data.added} sessions added to your schedule!`);
<<<<<<< HEAD
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Could not add sessions."); }
=======
    } catch { alert("Could not add sessions."); }
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
    finally { setAddingAll(false); }
  }

  async function handleChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", content: chatInput.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    ssSet("ai_chat", newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const { data } = await api.post("/recommendations/chat", { messages: newMessages });
      setMessages(prev => {
        const next = [...prev, { role: "assistant", content: data.reply }];
        ssSet("ai_chat", next);
        return next;
      });
<<<<<<< HEAD
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
=======
    } catch {
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
      setMessages(prev => {
        const next = [...prev, { role: "assistant", content: "Sorry, I couldn't respond. Please try again." }];
        ssSet("ai_chat", next);
        return next;
      });
    } finally { setChatLoading(false); }
  }

  // ── UI ────────────────────────────────────────────────────────
  return (
    <>
      <Topbar title="AI Recommendations" subtitle="Powered by Groq AI" user={{ initials }} />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-5">

          {/* Hero */}
          <div className="rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Smart Study Planner AI</h3>
                <p className="mt-1 text-sm text-indigo-200">Get personalised study plans, urgency scores, auto-generated schedules, and chat with your AI tutor.</p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20"><Sparkles size={20} /></span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition
                  ${tab === t.id ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
              >
                <t.icon size={13} /> <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab: AI Plan ── */}
          {tab === "plan" && (
            <div className="space-y-4">
              <Button onClick={handleAskPlan} disabled={planLoading || planInit} className="w-full justify-center bg-indigo-600 text-white hover:bg-indigo-700">
                {planLoading ? <><RefreshCw size={14} className="animate-spin" /> Analysing…</> : <><Sparkles size={14} /> {recommendation ? "Refresh recommendations" : "Get AI recommendations"}</>}
              </Button>

              {planLoading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 animate-pulse">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-3 rounded bg-slate-100" style={{ width: `${[80,100,70,90,60][i-1]}%` }} />)}
                </div>
              )}

              {!planLoading && recommendation && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><Sparkles size={15} /></span>
                      <h4 className="font-semibold text-slate-900">AI Recommendation</h4>
                    </div>
                    {generatedAt && <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} /> {generatedAt}</span>}
                  </div>
                  <div className="border-t border-slate-100 pt-4"><MarkdownText text={recommendation} /></div>
                </div>
              )}

              {!planLoading && !recommendation && !planInit && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <Sparkles size={28} className="mx-auto mb-2 text-indigo-200" />
                  <p className="text-sm text-slate-500">Click "Get AI recommendations" to start.</p>
                </div>
              )}
            </div>
          )}

    

          {/* ── Tab: Schedule ── */}
          {tab === "schedule" && (
            <div className="space-y-4">
              <Button onClick={handleGenerateSchedule} disabled={schedLoading} className="w-full justify-center bg-indigo-600 text-white hover:bg-indigo-700">
                {schedLoading ? <><RefreshCw size={14} className="animate-spin" /> Generating schedule…</> : <><Calendar size={14} /> Generate 7-day study schedule</>}
              </Button>

              {schedLoading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 animate-pulse">
                  {[1,2,3,4].map(i => <div key={i} className="h-12 rounded-xl bg-slate-100" />)}
                </div>
              )}

              {!schedLoading && sessions?.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <Calendar size={28} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-sm text-slate-500">No items to schedule. Add tasks or exams first.</p>
                </div>
              )}

              {!schedLoading && sessions?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                    <h4 className="font-semibold text-slate-900 text-sm">{sessions.length} suggested sessions</h4>
                    <Button
                      size="sm"
                      onClick={handleAddAll}
                      disabled={addingAll || addedIds.size === sessions.length}
                      className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs h-8 px-3"
                    >
                      {addingAll ? <><RefreshCw size={12} className="animate-spin" /> Adding…</> : addedIds.size === sessions.length ? "All added ✓" : <><Plus size={12} /> Add all to schedule</>}
                    </Button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {sessions.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${SESSION_DOT[s.color] ?? "bg-indigo-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">{s.title}</p>
                          <p className="text-xs text-slate-400">{s.date} · {s.startTime} · {s.duration}h{s.courseName ? ` · ${s.courseName}` : ""}</p>
                        </div>
                        <button
                          onClick={() => handleAddOne(s, i)}
                          disabled={addedIds.has(i) || addingIdx === i}
                          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition
                            ${addedIds.has(i)
                              ? "bg-emerald-50 text-emerald-600 cursor-default"
                              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"}`}
                        >
                          {addedIds.has(i) ? "Added ✓" : addingIdx === i ? "…" : "Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Chat ── */}
          {tab === "chat" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "480px" }}>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-indigo-600"><Bot size={16} /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">AI Study Assistant</p>
                  <p className="text-xs text-slate-400">Ask anything about your studies</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: "380px" }}>
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Bot size={32} className="mb-2 text-indigo-200" />
                    <p className="text-sm text-slate-500">Hi! I'm your AI study assistant.</p>
                    <p className="text-xs text-slate-400 mt-1">Ask me about your tasks, study tips, time management, or anything academic.</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {["What should I focus on today?", "How do I manage exam stress?", "Give me a study tip"].map(q => (
                        <button key={q} onClick={() => { setChatInput(q); }} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-100">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white text-xs
                      ${m.role === "user" ? "bg-indigo-600" : "bg-slate-700"}`}>
                      {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
                    </span>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm
                      ${m.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-slate-100 text-slate-800 rounded-tl-sm"}`}>
                      {m.role === "assistant" ? <MarkdownText text={m.content} /> : m.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-700 text-white"><Bot size={13} /></span>
                    <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 flex gap-1 items-center">
                      {[0,1,2].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleChat} className="border-t border-slate-100 px-4 py-3 flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask your AI study assistant…"
                  disabled={chatLoading}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
