import React, { useState, useMemo, useEffect, memo, useRef } from "react";
import { motion } from "framer-motion";
import { Search, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { getRiskLevel } from "@/data/mockStudents";
import { useStudents } from "@/context/StudentsContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SortKey = "name" | "attendance" | "avg_gpa" | "backlog_count" | "predicted_risk_probability";

const RiskBar = memo(({ value }: { value: number }) => {
  const level = value <= 0.3 ? "low" : value <= 0.6 ? "medium" : "high";
  const barClass = {
    low: "risk-bar-low",
    medium: "risk-bar-medium",
    high: "risk-bar-high",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
        {/* Non-animated bar for performance since virtualized rows unmount/remount often */}
        <div className={`h-full rounded-full ${barClass[level]}`} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums">{(value * 100).toFixed(0)}%</span>
    </div>
  );
});
RiskBar.displayName = "RiskBar";

const StudentAvatar = memo(({ name }: { name: string }) => {
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
});
StudentAvatar.displayName = "StudentAvatar";

const gridCols = "minmax(200px, 1.5fr) 100px 100px 60px 60px 60px 60px 60px 80px 80px 140px 100px";

const VirtualRow = memo(({ index, style, data }: any) => {
  const { filtered, riskBadgeClass } = data;
  const student = filtered[index];
  const risk = getRiskLevel(student.predicted_risk_probability);

  return (
    <div style={style} className="border-b border-border/50 hover:bg-accent/30 transition-colors group box-border">
      <div className="grid items-center h-full w-full px-4" style={{ gridTemplateColumns: gridCols, minWidth: "1100px" }}>
        <div className="flex items-center gap-3 truncate pr-4">
          <StudentAvatar name={student.name} />
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{student.name}</p>
        </div>
        <div className="text-sm text-muted-foreground truncate px-2">{student.course}</div>
        <div className="text-center px-2">
          <span className={`text-sm font-medium ${student.attendance < 50 ? "text-risk-high" : student.attendance < 70 ? "text-risk-medium" : "text-foreground"}`}>
            {student.attendance}%
          </span>
        </div>
        <div className="text-center text-sm text-muted-foreground">{student.gpa_sem1.toFixed(1)}</div>
        <div className="text-center text-sm text-muted-foreground">{student.gpa_sem2.toFixed(1)}</div>
        <div className="text-center text-sm text-muted-foreground">{student.gpa_sem3.toFixed(1)}</div>
        <div className="text-center text-sm text-muted-foreground">{student.gpa_sem4.toFixed(1)}</div>
        <div className="text-center text-sm text-muted-foreground">{student.gpa_sem5.toFixed(1)}</div>
        <div className="text-center text-sm font-semibold text-primary">{student.avg_gpa.toFixed(1)}</div>
        <div className="text-center text-sm">
          {student.backlog_count > 0 ? (
            <span className="text-risk-high font-semibold">{student.backlog_count}</span>
          ) : (
            <span className="text-risk-low">0</span>
          )}
        </div>
        <div className="px-2">
          <RiskBar value={student.predicted_risk_probability} />
        </div>
        <div className="text-center">
          <Badge variant="outline" className={riskBadgeClass[risk.level]}>
            {risk.level}
          </Badge>
        </div>
      </div>
    </div>
  );
});
VirtualRow.displayName = "VirtualRow";

const VirtualList = memo(({ items, itemHeight, height, renderRow, riskBadgeClass }: any) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
  const endIndex = Math.min(items.length, Math.floor((scrollTop + height) / itemHeight) + 3);

  const visibleItems = [];
  for (let i = startIndex; i < endIndex; i++) {
    visibleItems.push(
      React.createElement(renderRow, {
        key: `row-${i}`,
        index: i,
        style: {
          position: "absolute",
          top: i * itemHeight,
          left: 0,
          width: "100%",
          height: itemHeight,
        },
        data: { filtered: items, riskBadgeClass }
      })
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height, overflowY: "auto", position: "relative" }}
      className="custom-scrollbar"
    >
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {visibleItems}
      </div>
    </div>
  );
});
VirtualList.displayName = "VirtualList";

export const StudentTable = memo(() => {
  const { students } = useStudents();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("predicted_risk_probability");
  const [sortAsc, setSortAsc] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Memoize filtered and sorted list
  const filtered = useMemo(() => {
    return students
      .filter(s => search ? (s.name.toLowerCase().includes(search.toLowerCase()) || s.course.toLowerCase().includes(search.toLowerCase())) : true)
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
        return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
      });
  }, [students, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="inline w-3 h-3 ml-1 opacity-30" />;
    return sortAsc ? <ChevronUp className="inline w-3 h-3 ml-1 text-primary" /> : <ChevronDown className="inline w-3 h-3 ml-1 text-primary" />;
  };

  const riskBadgeClass = useMemo(() => ({
    low: "risk-low border text-[10px] uppercase tracking-wider font-semibold",
    medium: "risk-medium border text-[10px] uppercase tracking-wider font-semibold",
    high: "risk-high border text-[10px] uppercase tracking-wider font-semibold",
  }), []);

  // Use animation only if fewer than 2000 items according to rules
  const Container = students.length > 2000 ? "div" : motion.div;
  const animProps = students.length > 2000 ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.1, duration: 0.3 }
  };

  return (
    <Container {...animProps} className="glass-card overflow-hidden">
      <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold font-display text-foreground">Student Records</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} students found</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or course..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9 bg-secondary/50 border-border focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <div style={{ minWidth: "1100px" }}>
          <div className="grid items-center px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm z-10 sticky top-0" style={{ gridTemplateColumns: gridCols }}>
            <div className="text-left text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("name")}>
              Student <SortIcon col="name" />
            </div>
            <div className="text-left text-xs font-medium text-muted-foreground whitespace-nowrap px-2">Course</div>
            <div className="text-center text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap px-2" onClick={() => toggleSort("attendance")}>
              Attendance <SortIcon col="attendance" />
            </div>
            <div className="text-center text-xs font-medium text-muted-foreground whitespace-nowrap">Sem 1</div>
            <div className="text-center text-xs font-medium text-muted-foreground whitespace-nowrap">Sem 2</div>
            <div className="text-center text-xs font-medium text-muted-foreground whitespace-nowrap">Sem 3</div>
            <div className="text-center text-xs font-medium text-muted-foreground whitespace-nowrap">Sem 4</div>
            <div className="text-center text-xs font-medium text-muted-foreground whitespace-nowrap">Sem 5</div>
            <div className="text-center text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("avg_gpa")}>
              Avg GPA <SortIcon col="avg_gpa" />
            </div>
            <div className="text-center text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("backlog_count")}>
              Backlogs <SortIcon col="backlog_count" />
            </div>
            <div className="text-left text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap px-2" onClick={() => toggleSort("predicted_risk_probability")}>
              Risk <SortIcon col="predicted_risk_probability" />
            </div>
            <div className="text-center text-xs font-medium text-muted-foreground whitespace-nowrap">Level</div>
          </div>

          <VirtualList
            height={600}
            items={filtered}
            itemHeight={64}
            renderRow={VirtualRow}
            riskBadgeClass={riskBadgeClass}
          />
        </div>
      </div>
    </Container>
  );
});
StudentTable.displayName = "StudentTable";
