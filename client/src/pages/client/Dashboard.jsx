import React from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie,
} from "recharts";
import { BookOpen, FileText, GraduationCap, CheckCircle2 } from "lucide-react";


const studyData = [
  { course: "Database", hours: 9, color: "#6366F1" },
  { course: "HCI", hours: 6, color: "#F59E0B" },
  { course: "Soft. Eng", hours: 7, color: "#10B981" },
  { course: "Research", hours: 4, color: "#3B82F6" },
  { course: "Web Dev", hours: 5, color: "#F43F5E" },
];

const statusData = [
  { name: "Completed", value: 40, color: "#10B981" },
  { name: "In progress", value: 30, color: "#6366F1" },
  { name: "Pending", value: 20, color: "#F59E0B" },
  { name: "Overdue", value: 10, color: "#F43F5E" },
];

const stats = [
  { label: "Total tasks", value: 10, icon: CheckCircle2, tint: "bg-indigo-50 text-indigo-600" },
  { label: "Assignments", value: 8, icon: FileText, tint: "bg-amber-50 text-amber-600" },
  { label: "Upcoming exams", value: 2, icon: GraduationCap, tint: "bg-rose-50 text-rose-600" },
  { label: "Hours studied", value: "31h", icon: BookOpen, tint: "bg-emerald-50 text-emerald-600" },
];


const peak = Math.max(...studyData.map((d) => d.hours));

const BarFlag = ({ x, y, width, value }) => {
  const cx = x + width / 2;
  const top = y - 32;
  const isPeak = value === peak;
  const bg = isPeak ? "#4F46E5" : "#FFFFFF";
  const fg = isPeak ? "#FFFFFF" : "#334155";
  const stroke = isPeak ? "#4F46E5" : "#E2E8F0";
  const w = 40;
  return (
    <g>
      <rect x={cx - w / 2} y={top} width={w} height={21} rx={6} fill={bg} stroke={stroke} />
      <text x={cx} y={top + 14} textAnchor="middle" fontSize="12" fontWeight="600" fill={fg}>
        {value}h
      </text>
      <path d={`M${cx - 4},${top + 21} L${cx + 4},${top + 21} L${cx},${top + 27} Z`} fill={bg} stroke={stroke} />
    </g>
  );
};

/* percentage labels drawn inside each pie slice */
const PieSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.62;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700">
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const ChartTooltip = ({ active, payload, suffix }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-700">
        {p.payload.course || p.payload.name}
      </p>
      <p className="text-xs text-slate-500">
        {p.value}
        {suffix}
      </p>
    </div>
  );
};


export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl">
        {/* header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back, Alex — here's your study overview</p>
        </div>

        {/* stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tint }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${tint}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* charts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* bar chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Study hours by course</h2>
                <p className="text-xs text-slate-500">This week</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                31h total
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={studyData} margin={{ top: 40, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#EEF0F6" />
                <XAxis dataKey="course" tickLine={false} axisLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis tickLine={false} axisLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }} width={36} />
                <Tooltip cursor={{ fill: "#F1F5F9" }} content={<ChartTooltip suffix="h studied" />} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={46} label={<BarFlag />}>
                  {studyData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* pie chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-2">
              <h2 className="text-base font-semibold">Task status</h2>
              <p className="text-xs text-slate-500">Across all courses</p>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={92}
                  stroke="#fff"
                  strokeWidth={2}
                  labelLine={false}
                  label={PieSliceLabel}
                >
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip suffix="% of tasks" />} />
              </PieChart>
            </ResponsiveContainer>
            {/* legend */}
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {statusData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                  <span className="text-xs text-slate-600">{d.name}</span>
                  <span className="ml-auto text-xs font-semibold text-slate-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}