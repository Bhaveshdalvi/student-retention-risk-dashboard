import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { getRiskLevel } from "@/data/mockStudents";
import { useStudents } from "@/context/StudentsContext";

export function TopAtRiskStudents() {
  const { students } = useStudents();
  const topRisk = [...students]
    .sort((a, b) => b.predicted_risk_probability - a.predicted_risk_probability)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-risk-high/10">
          <AlertTriangle className="w-4 h-4 text-risk-high" />
        </div>
        <h2 className="text-lg font-semibold font-display text-foreground">Top At-Risk Students</h2>
      </div>

      <div className="space-y-3">
        {topRisk.map((student, i) => {
          const risk = getRiskLevel(student.predicted_risk_probability);
          const pct = student.predicted_risk_probability * 100;
          const hue = student.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

          return (
            <motion.div
              key={student.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors group"
            >
              <span className="text-xs font-bold text-muted-foreground w-5 text-center">#{i + 1}</span>

              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue}, 60%, 40%), hsl(${hue + 40}, 70%, 50%))`,
                  color: "white",
                }}
              >
                {student.name.split(" ").map(n => n[0]).join("")}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{student.name}</p>
                <p className="text-[11px] text-muted-foreground">{student.course} · {student.year} Year</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-lg font-bold font-display text-risk-high">{pct.toFixed(0)}%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{risk.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
