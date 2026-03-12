import { memo, useMemo } from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useStudents } from "@/context/StudentsContext";
import type { TooltipProps } from "recharts";

interface ScatterPoint {
    x: number;
    y: number;
    name: string;
    avg_gpa: number;
    riskLevel: "Low" | "Medium" | "High";
}

const RISK_COLORS = {
    Low: "hsl(160, 84%, 39%)",
    Medium: "hsl(38, 92%, 50%)",
    High: "hsl(0, 84%, 60%)",
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as ScatterPoint;
    if (!d) return null;
    const color = RISK_COLORS[d.riskLevel];
    return (
        <div className="glass-card border border-glass-border px-3 py-2 text-xs space-y-1 min-w-[160px]">
            <p className="font-semibold text-foreground border-b border-border/40 pb-1 mb-1">{d.name}</p>
            <p className="text-muted-foreground">
                Attendance: <span className="text-foreground font-medium">{d.x}%</span>
            </p>
            <p className="text-muted-foreground">
                Risk: <span className="font-medium" style={{ color }}>{d.y.toFixed(1)}%</span>
            </p>
            <p className="text-muted-foreground">
                Avg GPA: <span className="text-primary font-medium">{d.avg_gpa.toFixed(2)}</span>
            </p>
            <div className="flex items-center gap-1.5 pt-0.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
                <span className="font-semibold" style={{ color }}>{d.riskLevel} Risk</span>
            </div>
        </div>
    );
};

export const AttendanceScatterChart = memo(() => {
    const { students } = useStudents();

    const { lowRisk, medRisk, highRisk } = useMemo(() => {
        const low: ScatterPoint[] = [];
        const med: ScatterPoint[] = [];
        const high: ScatterPoint[] = [];

        students.forEach((s) => {
            const point: ScatterPoint = {
                x: s.attendance,
                y: parseFloat((s.predicted_risk_probability * 100).toFixed(1)),
                name: s.name,
                avg_gpa: s.avg_gpa,
                riskLevel:
                    s.predicted_risk_probability <= 0.3
                        ? "Low"
                        : s.predicted_risk_probability <= 0.6
                            ? "Medium"
                            : "High",
            };
            if (point.riskLevel === "Low") low.push(point);
            else if (point.riskLevel === "Medium") med.push(point);
            else high.push(point);
        });

        return { lowRisk: low, medRisk: med, highRisk: high };
    }, [students]);

    return (
        <div className="glass-card p-5">
            <h2 className="text-lg font-semibold font-display text-foreground mb-1">
                Attendance vs Risk
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
                Each dot represents one student — coloured by risk tier
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
                    Risk %
                </div>
                <div className="flex-1 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 18 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 20%, 14%)" />
                            <XAxis
                                dataKey="x"
                                type="number"
                                name="Attendance"
                                unit="%"
                                domain={[0, 100]}
                                tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                label={{
                                    value: "Attendance %",
                                    position: "insideBottom",
                                    offset: -10,
                                    fill: "hsl(215, 20%, 40%)",
                                    fontSize: 10,
                                }}
                            />
                            <YAxis
                                dataKey="y"
                                type="number"
                                name="Risk"
                                unit="%"
                                domain={[0, 100]}
                                tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={35}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                            <Legend
                                wrapperStyle={{ fontSize: 11, color: "hsl(215, 20%, 50%)", paddingTop: 12 }}
                            />
                            <Scatter
                                name="Low Risk"
                                data={lowRisk}
                                fill={RISK_COLORS.Low}
                                fillOpacity={0.55}
                                isAnimationActive={false}
                                shape={(props: any) => (
                                    <circle cx={props.cx} cy={props.cy} r={3} fill={RISK_COLORS.Low} fillOpacity={0.55} />
                                )}
                            />
                            <Scatter
                                name="Medium Risk"
                                data={medRisk}
                                fill={RISK_COLORS.Medium}
                                fillOpacity={0.55}
                                isAnimationActive={false}
                                shape={(props: any) => (
                                    <circle cx={props.cx} cy={props.cy} r={3} fill={RISK_COLORS.Medium} fillOpacity={0.55} />
                                )}
                            />
                            <Scatter
                                name="High Risk"
                                data={highRisk}
                                fill={RISK_COLORS.High}
                                fillOpacity={0.6}
                                isAnimationActive={false}
                                shape={(props: any) => (
                                    <circle cx={props.cx} cy={props.cy} r={3} fill={RISK_COLORS.High} fillOpacity={0.6} />
                                )}
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
});
AttendanceScatterChart.displayName = "AttendanceScatterChart";
