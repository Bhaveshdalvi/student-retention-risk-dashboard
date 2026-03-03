import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { getRiskLevel } from "@/data/mockStudents";
import { useStudents } from "@/context/StudentsContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SortKey = "name" | "attendance" | "avg_gpa" | "backlog_count" | "predicted_risk_probability";

function RiskBar({ value }: { value: number }) {
  const level = value <= 0.3 ? "low" : value <= 0.6 ? "medium" : "high";
  const barClass = {
    low: "risk-bar-low",
    medium: "risk-bar-medium",
    high: "risk-bar-high",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barClass[level]}`}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

function StudentAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 60%, 40%), hsl(${hue + 40}, 70%, 50%))`,
        color: "white",
      }}
    >
      {initials}
    </div>
  );
}

export function StudentTable() {
  const { students } = useStudents();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("predicted_risk_probability");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = students
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.course.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="inline w-3 h-3 ml-1 opacity-30" />;
    return sortAsc ? <ChevronUp className="inline w-3 h-3 ml-1 text-primary" /> : <ChevronDown className="inline w-3 h-3 ml-1 text-primary" />;
  };

  const riskBadgeClass = {
    low: "risk-low border text-[10px] uppercase tracking-wider font-semibold",
    medium: "risk-medium border text-[10px] uppercase tracking-wider font-semibold",
    high: "risk-high border text-[10px] uppercase tracking-wider font-semibold",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold font-display text-foreground">Student Records</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} students found</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or course..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="max-h-[600px] overflow-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("name")}>
                Student <SortIcon col="name" />
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Course</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("attendance")}>
                Attendance <SortIcon col="attendance" />
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3 whitespace-nowrap">Sem 1</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3 whitespace-nowrap">Sem 2</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3 whitespace-nowrap">Sem 3</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3 whitespace-nowrap">Sem 4</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3 whitespace-nowrap">Sem 5</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("avg_gpa")}>
                Avg GPA <SortIcon col="avg_gpa" />
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("backlog_count")}>
                Backlogs <SortIcon col="backlog_count" />
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("predicted_risk_probability")}>
                Risk <SortIcon col="predicted_risk_probability" />
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Level</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, idx) => {
              const risk = getRiskLevel(student.predicted_risk_probability);
              return (
                <motion.tr
                  key={student.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors group"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <StudentAvatar name={student.name} />
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{student.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{student.course}</td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <span className={`text-sm font-medium ${student.attendance < 50 ? "text-risk-high" : student.attendance < 70 ? "text-risk-medium" : "text-foreground"}`}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center text-sm text-muted-foreground">{student.gpa_sem1.toFixed(1)}</td>
                  <td className="px-3 py-3.5 text-center text-sm text-muted-foreground">{student.gpa_sem2.toFixed(1)}</td>
                  <td className="px-3 py-3.5 text-center text-sm text-muted-foreground">{student.gpa_sem3.toFixed(1)}</td>
                  <td className="px-3 py-3.5 text-center text-sm text-muted-foreground">{student.gpa_sem4.toFixed(1)}</td>
                  <td className="px-3 py-3.5 text-center text-sm text-muted-foreground">{student.gpa_sem5.toFixed(1)}</td>
                  <td className="px-4 py-3.5 text-center text-sm font-semibold text-primary">{student.avg_gpa.toFixed(1)}</td>
                  <td className="px-4 py-3.5 text-center text-sm">
                    {student.backlog_count > 0 ? (
                      <span className="text-risk-high font-semibold">{student.backlog_count}</span>
                    ) : (
                      <span className="text-risk-low">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <RiskBar value={student.predicted_risk_probability} />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Badge variant="outline" className={riskBadgeClass[risk.level]}>
                      {risk.level}
                    </Badge>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
