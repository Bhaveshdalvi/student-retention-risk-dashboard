import { memo, useMemo } from "react";
import { TrendingDown, BookOpen, AlertTriangle } from "lucide-react";
import { useStudents } from "@/context/StudentsContext";

interface StatCard {
    icon: React.ReactNode;
    label: string;
    value: string;
    subvalue?: string;
    subtext: string;
    accent: string;
}

const ObservationCard = memo(({ icon, label, value, subvalue, subtext, accent }: StatCard) => (
    <div className="glass-card p-6 flex flex-col gap-4 border border-border/40 hover:border-border/70 transition-colors">
        <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: `${accent}22` }}>
                <span style={{ color: accent }}>{icon}</span>
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                {label}
            </p>
        </div>
        <div className="space-y-0.5">
            <p className="text-3xl font-bold" style={{ color: accent }}>
                {value}
            </p>
            {subvalue && (
                <p className="text-sm font-medium text-muted-foreground">{subvalue}</p>
            )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
            {subtext}
        </p>
    </div>
));
ObservationCard.displayName = "ObservationCard";

export const ModelObservations = memo(() => {
    const { students } = useStudents();

    const observations = useMemo<StatCard[]>(() => {
        const safe = students.filter((s) => s.predicted_risk_probability <= 0.3);
        const highRisk = students.filter((s) => s.predicted_risk_probability > 0.6);
        const n = students.length || 1;

        // 1. Avg GPA gap
        const safeAvgGpa = safe.length
            ? safe.reduce((a, s) => a + s.avg_gpa, 0) / safe.length
            : 0;
        const highAvgGpa = highRisk.length
            ? highRisk.reduce((a, s) => a + s.avg_gpa, 0) / highRisk.length
            : 0;
        const gpaGap = safeAvgGpa - highAvgGpa;

        // 2. Pearson correlation: attendance vs predicted_risk_probability
        const meanAtt = students.reduce((a, s) => a + s.attendance, 0) / n;
        const meanRisk = students.reduce((a, s) => a + s.predicted_risk_probability, 0) / n;

        let covSum = 0, varAtt = 0, varRisk = 0;
        students.forEach((s) => {
            const da = s.attendance - meanAtt;
            const dr = s.predicted_risk_probability - meanRisk;
            covSum += da * dr;
            varAtt += da * da;
            varRisk += dr * dr;
        });
        const pearsonR =
            varAtt > 0 && varRisk > 0
                ? covSum / Math.sqrt(varAtt * varRisk)
                : 0;
        const absR = Math.abs(pearsonR);
        const rStrength =
            absR < 0.2
                ? "Very Weak"
                : absR < 0.4
                    ? "Weak"
                    : absR < 0.6
                        ? "Moderate"
                        : "Strong";
        const rDirection = pearsonR < 0 ? "Negative" : "Positive";

        // 3. Backlog risk lift: 2+ vs 0 backlogs
        const noBacklog = students.filter((s) => s.backlog_count === 0);
        const twoPlus = students.filter((s) => s.backlog_count >= 2);
        const avgRiskNoBacklog = noBacklog.length
            ? noBacklog.reduce((a, s) => a + s.predicted_risk_probability, 0) / noBacklog.length
            : 0;
        const avgRiskTwoPlus = twoPlus.length
            ? twoPlus.reduce((a, s) => a + s.predicted_risk_probability, 0) / twoPlus.length
            : 0;
        const riskLift =
            avgRiskNoBacklog > 0
                ? (((avgRiskTwoPlus - avgRiskNoBacklog) / avgRiskNoBacklog) * 100).toFixed(0)
                : "N/A";

        return [
            {
                icon: <TrendingDown className="w-4 h-4" />,
                label: "GPA Performance Gap",
                value: `${gpaGap.toFixed(2)} pts`,
                subtext: `Safe students outperform high-risk students by ${gpaGap.toFixed(2)} GPA points on average across all semesters.`,
                accent: "hsl(160, 84%, 39%)",
            },
            {
                icon: <BookOpen className="w-4 h-4" />,
                label: "Attendance–Risk Correlation",
                value: `r = ${pearsonR.toFixed(2)}`,
                subvalue: `${rStrength} ${rDirection} Correlation`,
                subtext:
                    rDirection === "Negative"
                        ? "Higher attendance is associated with lower predicted dropout risk — confirmed by linear correlation analysis."
                        : "Positive attendance–risk correlation detected — possible confounding variables in this cohort.",
                accent: "hsl(217, 91%, 60%)",
            },
            {
                icon: <AlertTriangle className="w-4 h-4" />,
                label: "Backlog Risk Lift (2+ vs 0)",
                value: riskLift === "N/A" ? "N/A" : `+${riskLift}%`,
                subtext: `Students with 2 or more backlogs have a ${riskLift}% higher predicted dropout risk compared to students with no backlogs.`,
                accent: "hsl(0, 84%, 60%)",
            },
        ];
    }, [students]);

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-lg font-semibold font-display text-foreground">
                    Key Model Observations
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Auto-computed statistical insights from the dataset
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {observations.map((obs) => (
                    <ObservationCard key={obs.label} {...obs} />
                ))}
            </div>
        </div>
    );
});
ModelObservations.displayName = "ModelObservations";
