function renderInline(text) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function MarkdownText({ text = "" }) {
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-700">
      {text.split("\n").map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1" />;
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return <div key={index} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" /><span>{renderInline(trimmed.slice(2))}</span></div>;
        }
        const numbered = trimmed.match(/^(\d+)\.\s*(.*)$/);
        if (numbered) {
          return <div key={index} className="flex gap-2"><span className="shrink-0 font-semibold text-indigo-600">{numbered[1]}.</span><span>{renderInline(numbered[2])}</span></div>;
        }
        if (trimmed.startsWith("### ")) return <p key={index} className="mt-2 font-bold text-slate-900">{renderInline(trimmed.slice(4))}</p>;
        if (trimmed.startsWith("## ")) return <p key={index} className="mt-2 text-base font-bold text-slate-900">{renderInline(trimmed.slice(3))}</p>;
        return <p key={index}>{renderInline(line)}</p>;
      })}
    </div>
  );
}
