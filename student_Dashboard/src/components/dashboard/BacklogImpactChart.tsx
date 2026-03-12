import { memo, useMemo, useRef } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useStudents } from "@/context/StudentsContext";
import type { TooltipProps } from "recharts";

const BACKLOG_LABELS = ["0", "1", "2", "3+"];

interface BacklogBucket {
    backlog: string;
    Low: number;
    Medium: number;
    High: number;
    total: number;
    lowPct: string;
    medPct: string;
    highPct: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const bucket = payload[0]?.payload as BacklogBucket;
    return (
        <div className="glass-card border border-glass-border px-3 py-2 text-xs space-y-1 min-w-[180px]">
            <p className="font-semibold text-foreground border-b border-border/40 pb-1 mb-1">
                {label === "0" ? "No Backlogs" : `${label} Backlog${label === "1" ? "" : "s"}`}
            </p>
            <div className="flex justify-between">
                <span className="text-risk-low">Low Risk</span>
                <span className="font-bold text-foreground">{bucket.Low} <span className="opacity-50 font-normal">({bucket.lowPct}%)</span></span>
            </div>
            <div className="flex justify-between">
                <span className="text-risk-medium">Medium Risk</span>
                <span className="font-bold text-foreground">{bucket.Medium} <span className="opacity-50 font-normal">({bucket.medPct}%)</span></span>
            </div>
            <div className="flex justify-between">
                <span className="text-risk-high">High Risk</span>
                <span className="font-bold text-foreground">{bucket.High} <span className="opacity-50 font-normal">({bucket.highPct}%)</span></span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-1 mt-1">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-foreground">{bucket.total}</span>
            </div>
        </div>
    );
};

export const BacklogImpactChart = memo(() => {
    const { students } = useStudents();
    const firstMount = useRef(true);

    const chartData = useMemo<BacklogBucket[]>(() => {
        const buckets: Record<string, { Low: number; Medium: number; High: number; total: number }> = {
            "0": { Low: 0, Medium: 0, High: 0, total: 0 },
            "1": { Low: 0, Medium: 0, High: 0, total: 0 },
            "2": { Low: 0, Medium: 0, High: 0, total: 0 },
            "3+": { Low: 0, Medium: 0, High: 0, total: 0 },
        };

        students.forEach((s) => {
            const key = s.backlog_count >= 3 ? "3+" : String(s.backlog_count);
            const risk = s.predicted_risk_probability;
            const level = risk <= 0.3 ? "Low" : risk <= 0.6 ? "Medium" : "High";
            buckets[key][level]++;
            buckets[key].total++;
        });

        return BACKLOG_LABELS.map((l) => {
            const b = buckets[l];
            const t = b.total || 1;
            return {
                backlog: l,
                Low: b.Low,
                Medium: b.Medium,
                High: b.High,
                total: b.total,
                lowPct: ((b.Low / t) * 100).toFixed(1),
                medPct: ((b.Medium / t) * 100).toFixed(1),
                highPct: ((b.High / t) * 100).toFixed(1),
            };
        });
    }, [students]);

    const animate = firstMount.current;
    if (firstMount.current) firstMount.current = false;

    return (
        <div className="glass-card p-5">
            <h2 className="text-lg font-semibold font-display text-foreground mb-1">
                Backlog Impact Analysis
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
                Student risk levels by backlog count
            </p>
            <div className="h-[260px] flex gap-0">
                <div
                    style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        fontSize: 10,
                        color: "hsl(215, 20%, 40%)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        userSelect: "none",
                        width: 16,
                    }}
                >
                    Students
                </div>
                <div className="flex-1 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={38} margin={{ top: 5, right: 20, left: 0, bottom: 18 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 20%, 14%)" vertical={false} />
                            <XAxis
                                dataKey="backlog"
                                tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                label={{
                                    value: "Backlog Count",
                                    position: "insideBottom",
                                    offset: -10,
                                    fill: "hsl(215, 20%, 40%)",
                                    fontSize: 10,
                                }}
                            />
                            <YAxis
                                tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={35}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215, 20%, 50%)", paddingTop: 8 }} />
                            <Bar dataKey="Low" stackId="a" fill="hsl(160, 80%, 36%)" isAnimationActive={animate} animationDuration={220} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Medium" stackId="a" fill="hsl(38,  95%, 48%)" isAnimationActive={animate} animationDuration={220} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="High" stackId="a" fill="hsl(0,   90%, 58%)" isAnimationActive={animate} animationDuration={220} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
});
BacklogImpactChart.displayName = "BacklogImpactChart";
