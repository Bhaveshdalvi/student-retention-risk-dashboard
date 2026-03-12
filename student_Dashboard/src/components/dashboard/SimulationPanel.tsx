import { useState, useRef, useEffect, useMemo, memo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, User, BookOpen, Calendar, Search, Check } from "lucide-react";
import { getRiskLevel, type Student } from "@/data/mockStudents";
import { useStudents } from "@/context/StudentsContext";
import { predictRisk } from "@/services/api";
import { RiskGauge } from "./RiskGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const SimulationPanel = memo(() => {
  const { students } = useStudents();
  const [selectedName, setSelectedName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<(Student & { liveRisk?: number }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return students
      .filter(s => s.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
      .slice(0, 50); // Limit to 50 for performance
  }, [students, debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    startTransition(() => {
      setSelectedName(name);
      setSearchQuery(name);
      setIsOpen(false);
    });
  };

  const handlePredict = async () => {
    const student = students.find(s => s.name === selectedName);
    if (!student) return;

    setIsLoading(true);
    setResult(null);

    try {
      const riskProbability = await predictRisk(selectedName);
      startTransition(() => {
        setResult({ ...student, predicted_risk_probability: riskProbability, liveRisk: riskProbability });
      });
    } catch {
      startTransition(() => {
        setResult(student);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const riskBadgeClass = {
    low: "risk-low border text-xs px-3 py-1 font-semibold",
    medium: "risk-medium border text-xs px-3 py-1 font-semibold",
    high: "risk-high border text-xs px-3 py-1 font-semibold",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card-glow p-6 relative z-50"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold font-display text-foreground">Risk Prediction Engine</h2>
        {result?.liveRisk !== undefined && (
          <Badge variant="outline" className="text-[10px] ml-2 text-risk-low border-risk-low/30">LIVE</Badge>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Selection */}
        <div className="w-full lg:w-72 space-y-3 relative z-50">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedName) setSelectedName("");
                  if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Type or search student name..."
                className="flex h-11 w-full items-center rounded-md border border-input bg-secondary/50 pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <AnimatePresence>
              {isOpen && searchQuery.trim() && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-md max-h-52 overflow-y-auto"
                >
                  {filtered.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      No students found
                    </div>
                  ) : (
                    filtered.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => handleSelect(s.name)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <span className="truncate">{s.name}</span>
                        {selectedName === s.name && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={handlePredict}
            disabled={!selectedName || isLoading || isPending}
            className="w-full gap-2 h-11 font-semibold text-sm"
          >
            {isLoading || isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isLoading || isPending ? "Analyzing..." : "Run Prediction"}
          </Button>

          {selectedName && !result && !isLoading && !isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-muted-foreground text-center mt-2">
              Click to analyze risk probability
            </motion.div>
          )}
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col sm:flex-row items-center gap-8"
            >
              <div className="shrink-0">
                <RiskGauge value={result.predicted_risk_probability} />
              </div>

              <div className="space-y-3 text-center sm:text-left flex-1">
                <div>
                  <p className="text-xl font-bold font-display text-foreground">{result.name}</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                    <Badge variant="outline" className={riskBadgeClass[getRiskLevel(result.predicted_risk_probability).level]}>
                      {getRiskLevel(result.predicted_risk_probability).label}
                    </Badge>
                  </div>
                  {/* Rich prediction sentence */}
                  {result.liveRisk !== undefined && (() => {
                    const pct = Math.round(result.liveRisk! * 100);
                    const level = getRiskLevel(result.liveRisk!).level;
                    const colorClass = level === "high" ? "text-red-400" : level === "medium" ? "text-yellow-400" : "text-green-400";
                    const label = level === "high" ? "High Risk" : level === "medium" ? "Medium Risk" : "Low Risk";
                    return (
                      <p className={`text-sm font-semibold mt-2 ${colorClass}`}>
                        {label} — {pct}% probability of dropout
                      </p>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Attendance</span>
                    </div>
                    <p className="text-lg font-bold font-display text-foreground">{result.attendance}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">GPA</span>
                    </div>
                    <p className="text-lg font-bold font-display text-foreground">{result.avg_gpa.toFixed(1)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Backlogs</span>
                    </div>
                    <p className="text-lg font-bold font-display text-foreground">{result.backlog_count}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
SimulationPanel.displayName = "SimulationPanel";
