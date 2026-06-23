import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, Clock } from "lucide-react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";

function MarkdownText({ text }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        // Bold **text**
        const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        // Bullet points
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*]\s/, "") }} />
            </div>
          );
        }
        // Numbered list
        if (/^\d+\./.test(line.trim())) {
          return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 font-semibold text-indigo-600">{line.match(/^\d+/)[0]}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s*/, "") }} />
            </div>
          );
        }
        // Heading lines (###)
        if (line.startsWith("###")) {
          return <p key={i} className="font-bold text-slate-900 mt-3" dangerouslySetInnerHTML={{ __html: formatted.replace(/^###\s*/, "") }} />;
        }
        if (line.startsWith("##")) {
          return <p key={i} className="font-bold text-slate-900 text-base mt-3" dangerouslySetInnerHTML={{ __html: formatted.replace(/^##\s*/, "") }} />;
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}

export default function AIRecommendation() {
  const [recommendation, setRecommendation] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    api.get("/recommendations")
      .then((res) => {
        if (res.data.recommendation) {
          setRecommendation(res.data.recommendation);
          setGeneratedAt(res.data.generatedAt);
        }
      })
      .catch(() => {})
      .finally(() => setInitialising(false));
  }, []);

  async function handleAsk() {
    setLoading(true);
    try {
      const { data } = await api.post("/recommendations/ask");
      setRecommendation(data.recommendation);
      setGeneratedAt(null);
    } catch (err) {
      alert(err.response?.data?.message || "Could not get recommendation. Check your Groq API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar title="AI Recommendations" subtitle="Powered by Groq AI" user={{ initials: "AM" }} />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">

          {/* Hero card */}
          <div className="rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Smart Study Planner</h3>
                <p className="mt-1 text-sm text-indigo-200">
                  Groq AI analyses your tasks, assignments, and exams to recommend what to focus on first and how to prepare effectively.
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20">
                <Sparkles size={22} />
              </span>
            </div>
            <div className="mt-5">
              <Button
                onClick={handleAsk}
                disabled={loading || initialising}
                className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold"
              >
                {loading ? (
                  <><RefreshCw size={15} className="animate-spin" /> Analysing your data…</>
                ) : (
                  <><Sparkles size={15} /> {recommendation ? "Refresh recommendations" : "Get AI recommendations"}</>
                )}
              </Button>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-5/6 rounded bg-slate-100" />
              <div className="h-3 w-4/6 rounded bg-slate-100" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-3/4 rounded bg-slate-100" />
            </div>
          )}

          {/* Recommendation result */}
          {!loading && recommendation && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Sparkles size={16} />
                  </span>
                  <h4 className="font-semibold text-slate-900">Groq's Recommendation</h4>
                </div>
                {generatedAt && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} /> {generatedAt}
                  </span>
                )}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <MarkdownText text={recommendation} />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !recommendation && !initialising && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <Sparkles size={32} className="mx-auto mb-3 text-indigo-300" />
              <p className="font-medium text-slate-600">No recommendations yet</p>
              <p className="mt-1 text-sm text-slate-400">Click "Get AI recommendations" to let Groq analyse your workload.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
