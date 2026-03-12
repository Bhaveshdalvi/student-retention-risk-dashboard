import { memo, useMemo, useRef } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    LabelList,
    ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchFeatureImportance, type FeatureImportanceItem } from "@/services/api";
import { Info } from "lucide-react";

// ── Tooltip ──────────────────────────────────────────────────────────────────
const CustomTooltip = ({
    active,
    payload,
}: {
    active?: boolean;
    payload?: any[];
}) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as FeatureImportanceItem;
    return (
        <div className="glass-card border border-glass-border px-3 py-2 text-xs space-y-1">
            <p className="font-semibold text-foreground">{d.feature}</p>
            <p className="text-muted-foreground">
                Importance:{" "}
                <span className="text-primary font-bold">{d.importance.toFixed(2)}%</span>
            </p>
        </div>
    );
};

// ── Bar teal gradient colours (darkest = highest importance) ─────────────────
const BAR_COLORS = [
    "hsl(174, 80%, 36%)",
    "hsl(174, 74%, 40%)",
    "hsl(174, 68%, 44%)",
    "hsl(174, 62%, 48%)",
    "hsl(174, 56%, 50%)",
    "hsl(174, 50%, 52%)",
    "hsl(174, 44%, 54%)",
    "hsl(174, 38%, 56%)",
    "hsl(174, 32%, 58%)",
];

// ── Interpretability text ────────────────────────────────────────────────────
function buildInterpretabilityText(data: FeatureImportanceItem[]): string {
    if (!data.length) return "";
    const top = data[0];
    const second = data[1];
    const third = data[2];
    const academicFeatures = ["Attendance", "Avg GPA", "Backlog Count", "Has Backlog", "Event Score"];
    const demographicFeatures = ["Gender", "Age", "Year", "Course"];
    const demoPct = data
        .filter((d) => demographicFeatures.includes(d.feature))
        .reduce((sum, d) => sum + d.importance, 0);

    const secondThird =
        second && third
            ? `${second.feature} (${second.importance.toFixed(1)}%) and ${third.feature} (${third.importance.toFixed(1)}%) follow as secondary predictors.`
            : second
                ? `${second.feature} (${second.importance.toFixed(1)}%) follows as a secondary predictor.`
                : "";

    const demoNote =
        demoPct < 20
            ? ` Demographic features (Gender, Age, Course, Year) contribute only ${demoPct.toFixed(1)}% combined, indicating academic behaviour is the dominant driver.`
            : "";

    return `${top.feature} is the strongest predictor of dropout risk, contributing approximately ${top.importance.toFixed(1)}% to model decisions. ${secondThird}${demoNote}`;
}

// ── Main Component ───────────────────────────────────────────────────────────
export const FeatureImportanceChart = memo(() => {
    const firstMount = useRef(true);

    const { data: rawData, isLoading, isError } = useQuery({
        queryKey: ["feature-importance"],
        queryFn: fetchFeatureImportance,
        staleTime: Infinity,   // fetched once per session — never re-fetches
        retry: 1,
    });

    const { chartData, interpretText } = useMemo(() => {
        if (!rawData?.length) return { chartData: [], interpretText: "" };
        return {
            chartData: rawData,
            interpretText: buildInterpretabilityText(rawData),
        };
    }, [rawData]);

    const animate = firstMount.current;
    if (firstMount.current) firstMount.current = false;

    return (
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
                <div>
                    <h2 className="text-lg font-semibold font-display text-foreground">
                        Model Feature Importance
                    </h2>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        Relative contribution of input variables to dropout risk prediction
                    </p>
                </div>
                {/* Info badge */}
                <div className="group relative flex items-center gap-1 cursor-default">
                    <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                    <div className="absolute right-0 top-5 z-50 hidden group-hover:block w-64 glass-card border border-glass-border p-3 text-[11px] text-muted-foreground leading-relaxed shadow-xl">
                        Feature importance represents the relative contribution of each variable
                        to the model's predictions, as computed by the RandomForest algorithm.
                    </div>
                </div>
            </div>

            {/* Loading / Error states */}
            {isLoading && (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                    Loading feature data…
                </div>
            )}
            {isError && (
                <div className="h-64 flex items-center justify-center text-sm text-destructive/70">
                    Could not load feature importance — backend may be offline.
                </div>
            )}

            {/* Chart */}
            {!isLoading && !isError && chartData.length > 0 && (
                <>
                    <div className="h-[280px] mt-3 flex gap-0">
                        {/* Y-axis label */}
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
                                width: 16,
                                userSelect: "none",
                            }}
                        >
                            Feature
                        </div>
                        <div className="flex-1 min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    layout="vertical"
                                    margin={{ top: 4, right: 56, left: 4, bottom: 4 }}
                                    barCategoryGap="20%"
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(228, 20%, 14%)"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        domain={[0, "dataMax + 5"]}
                                        unit="%"
                                        tick={{ fill: "hsl(215, 20%, 50%)", fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="feature"
                                        width={90}
                                        tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsla(215,20%,20%,0.4)" }} />
                                    <Bar
                                        dataKey="importance"
                                        radius={[0, 4, 4, 0]}
                                        isAnimationActive={animate}
                                        animationDuration={250}
                                        animationEasing="ease-out"
                                    >
                                        {chartData.map((_, i) => (
                                            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                        ))}
                                        <LabelList
                                            dataKey="importance"
                                            position="right"
                                            formatter={(v: number) => `${v.toFixed(1)}%`}
                                            style={{ fill: "hsl(215, 20%, 60%)", fontSize: 10 }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Interpretability text */}
                    {interpretText && (
                        <div className="mt-4 pt-4 border-t border-border/30">
                            <p className="text-[11px] text-muted-foreground/70 leading-relaxed italic border-l-2 border-primary/30 pl-2">
                                {interpretText}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
});
FeatureImportanceChart.displayName = "FeatureImportanceChart";
