import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useStudents } from "@/context/StudentsContext";

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-glass-border px-3 py-2 text-xs">
      <p className="text-foreground font-semibold">{payload[0].name}: <span className="text-primary">{payload[0].value}</span></p>
    </div>
  );
};

export function RiskCharts() {
  const { students } = useStudents();

  const low = students.filter(s => s.predicted_risk_probability <= 0.3).length;
  const med = students.filter(s => s.predicted_risk_probability > 0.3 && s.predicted_risk_probability <= 0.6).length;
  const high = students.filter(s => s.predicted_risk_probability > 0.6).length;
  const riskDistribution = [
    { name: "Low Risk", value: low, color: "hsl(160, 84%, 39%)" },
    { name: "Medium Risk", value: med, color: "hsl(38, 92%, 50%)" },
    { name: "High Risk", value: high, color: "hsl(0, 84%, 60%)" },
  ];

  const courses: Record<string, { total: number; highRisk: number }> = {};
  students.forEach(s => {
    if (!courses[s.course]) courses[s.course] = { total: 0, highRisk: 0 };
    courses[s.course].total++;
    if (s.predicted_risk_probability > 0.6) courses[s.course].highRisk++;
  });
  const courseData = Object.entries(courses).map(([name, d]) => ({ name: name.slice(0, 8), ...d }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
        <h2 className="text-lg font-semibold font-display text-foreground mb-1">Risk Distribution</h2>
        <p className="text-xs text-muted-foreground mb-4">Overall student risk breakdown</p>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} strokeWidth={0}>
                {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-5 mt-2">
          {riskDistribution.map(d => (
            <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span>{d.name}</span>
              <span className="font-bold text-foreground">{d.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
        <h2 className="text-lg font-semibold font-display text-foreground mb-1">Risk by Department</h2>
        <p className="text-xs text-muted-foreground mb-4">High-risk students per course</p>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseData} barGap={6} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 20%, 14%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="hsl(173, 80%, 40%)" radius={[6, 6, 0, 0]} name="Total" />
              <Bar dataKey="highRisk" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} name="High Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
