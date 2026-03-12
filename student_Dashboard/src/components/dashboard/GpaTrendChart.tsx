import { memo, useMemo, useRef } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useStudents } from "@/context/StudentsContext";
import type { TooltipProps } from "recharts";

const SEMESTERS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"];
const SEM_KEYS = ["gpa_sem1", "gpa_sem2", "gpa_sem3", "gpa_sem4", "gpa_sem5"] as const;

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card border border-glass-border px-3 py-2 text-xs space-y-1">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: <span className="font-bold">{(p.value as number).toFixed(2)}</span>
                </p>
            ))}
        </div>
    );
};

export const GpaTrendChart = memo(() => {
    const { students } = useStudents();
    const firstMount = useRef(true);

    const { trendData, yDomain, insightText } = useMemo(() => {
        const safe = students.filter((s) => s.predicted_risk_probability <= 0.3);
        const highRisk = students.filter((s) => s.predicted_risk_probability > 0.6);

        const avg = (arr: typeof students, key: typeof SEM_KEYS[number]) =>
            arr.length === 0 ? 0 : arr.reduce((sum, s) => sum + s[key], 0) / arr.length;

        const data = SEMESTERS.map((sem, i) => ({
            semester: sem,
            Safe: parseFloat(avg(safe, SEM_KEYS[i]).toFixed(2)),
            "High Risk": parseFloat(avg(highRisk, SEM_KEYS[i]).toFixed(2)),
        }));

        // Dynamic Y-axis: find min/max across both groups + padding
        const allVals = data.flatMap((d) => [d.Safe, d["High Risk"]]).filter((v) => v > 0);
        const minVal = Math.max(0, Math.min(...allVals) - 0.2);
        const maxVal = Math.min(10, Math.max(...allVals) + 0.2);

        // Executive insight: average GPA gap
        const gaps = data.map((d) => d.Safe - d["High Risk"]);
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const insight =
            avgGap > 0
                ? `High-risk students underperform safe students by an avg of ${avgGap.toFixed(2)} GPA points across all semesters.`
                : `GPA performance gap between risk groups is minimal (${Math.abs(avgGap).toFixed(2)} pts).`;

        return {
            trendData: data,
            yDomain: [parseFloat(minVal.toFixed(1)), parseFloat(maxVal.toFixed(1))],
            insightText: insight,
        };
    }, [students]);

    const animate = firstMount.current;
    if (firstMount.current) firstMount.current = false;

    return (
        <div className="glass-card p-5">
            <h2 className="text-lg font-semibold font-display text-foreground mb-1">
                GPA Trend Analysis
            </h2>
            <p className="text-[11px] text-muted-foreground/80 mb-1.5">
                Average GPA per semester — Safe vs High-Risk students
            </p>
            <p className="text-[11px] text-muted-foreground/55 italic mb-4 leading-relaxed border-l-2 border-primary/30 pl-2">
                {insightText}
            </p>
            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(228, 20%, 14%)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="semester"
                            tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={yDomain}
                            tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={35}
                            tickCount={5}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215, 20%, 50%)" }} />
                        <Line
                            type="monotone"
                            dataKey="Safe"
                            stroke="hsl(160, 84%, 39%)"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: "hsl(160, 84%, 39%)", strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={animate}
                            animationDuration={250}
                        />
                        <Line
                            type="monotone"
                            dataKey="High Risk"
                            stroke="hsl(0, 84%, 60%)"
                            strokeWidth={2.5}
                            strokeDasharray="5 3"
                            dot={{ r: 4, fill: "hsl(0, 84%, 60%)", strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={animate}
                            animationDuration={250}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
GpaTrendChart.displayName = "GpaTrendChart";
