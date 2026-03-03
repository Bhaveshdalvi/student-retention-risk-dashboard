import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { useStudents } from "@/context/StudentsContext";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start * 10) / 10);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return <>{typeof value === "number" && value % 1 === 0 ? Math.round(count) : count.toFixed(1)}{suffix}</>;
}

export function KPICards() {
  const { students } = useStudents();

  const total = students.length;
  const highRisk = students.filter(s => s.predicted_risk_probability > 0.6).length;
  const lowRisk = students.filter(s => s.predicted_risk_probability <= 0.3).length;
  const avgRisk = total > 0 ? students.reduce((a, s) => a + s.predicted_risk_probability, 0) / total * 100 : 0;

  const kpiData = [
    {
      title: "Total Students",
      value: total,
      suffix: "",
      icon: Users,
      gradient: "from-[hsl(173,80%,40%)] to-[hsl(200,80%,50%)]",
      iconBg: "bg-primary/10 text-primary",
      change: "+3 this sem",
      changeType: "up" as const,
    },
    {
      title: "High Risk",
      value: highRisk,
      suffix: "",
      icon: AlertTriangle,
      gradient: "from-[hsl(0,84%,60%)] to-[hsl(20,90%,55%)]",
      iconBg: "bg-risk-high/10 text-risk-high",
      change: `${total > 0 ? Math.round(highRisk / total * 100) : 0}% of total`,
      changeType: "down" as const,
    },
    {
      title: "Safe Students",
      value: lowRisk,
      suffix: "",
      icon: Shield,
      gradient: "from-[hsl(160,84%,39%)] to-[hsl(140,70%,45%)]",
      iconBg: "bg-risk-low/10 text-risk-low",
      change: `${total > 0 ? Math.round(lowRisk / total * 100) : 0}% of total`,
      changeType: "up" as const,
    },
    {
      title: "Avg Risk Score",
      value: parseFloat(avgRisk.toFixed(1)),
      suffix: "%",
      icon: TrendingUp,
      gradient: "from-[hsl(38,92%,50%)] to-[hsl(25,95%,55%)]",
      iconBg: "bg-risk-medium/10 text-risk-medium",
      change: "Moderate",
      changeType: "neutral" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, i) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
          className="gradient-border group cursor-default"
        >
          <div className="relative p-5 rounded-2xl bg-card overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
            <div className="relative flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${kpi.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
                {kpi.change}
              </span>
            </div>
            <div className="relative">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{kpi.title}</p>
              <p className="text-4xl font-bold font-display tracking-tight text-foreground">
                <AnimatedCounter value={kpi.value} suffix={kpi.suffix} />
              </p>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${kpi.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
