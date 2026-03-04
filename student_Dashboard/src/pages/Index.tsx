import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Activity, RefreshCw } from "lucide-react";
import { useStudents } from "@/context/StudentsContext";
import { FullPageSpinner } from "@/components/Spinner";

import { AnimatedBackground } from "@/components/dashboard/AnimatedBackground";
import { KPICards } from "@/components/dashboard/KPICards";
import { SimulationPanel } from "@/components/dashboard/SimulationPanel";
import { RiskCharts } from "@/components/dashboard/RiskCharts";
import { TopAtRiskStudents } from "@/components/dashboard/TopAtRiskStudents";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { KeyRiskInsights } from "@/components/dashboard/KeyRiskInsights";
import { GpaTrendChart } from "@/components/dashboard/GpaTrendChart";
import { AttendanceScatterChart } from "@/components/dashboard/AttendanceScatterChart";
import { BacklogImpactChart } from "@/components/dashboard/BacklogImpactChart";
import { ModelObservations } from "@/components/dashboard/ModelObservations";
import { FeatureImportanceChart } from "@/components/dashboard/FeatureImportanceChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { students, isLoading, isError } = useStudents();

  // Loading state — happens on first load and after Render cold start
  if (isLoading || !students || students.length === 0) {
    return <FullPageSpinner label="Loading student data…" />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-lg font-semibold text-foreground">Unable to load student data</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The backend may be waking up from inactivity. Please wait a few
            seconds and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Academic Risk Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  ML-powered student retention risk scoring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-500">
                System Active
              </span>
            </div>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-8">
            <div className="flex justify-center sm:justify-start">
              <TabsList className="bg-secondary/50 border border-border/50 p-1">
                <TabsTrigger value="overview" className="px-6 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md transition-all">Overview</TabsTrigger>
                <TabsTrigger value="insights" className="px-6 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md transition-all">Model Insights</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
              {/* KPIs */}
              <KPICards />

              {/* Insights Panel */}
              <KeyRiskInsights />

              {/* Simulation */}
              <SimulationPanel />

              {/* Charts + Top Risk */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  <RiskCharts />
                </div>
                <div>
                  <TopAtRiskStudents />
                </div>
              </div>

              {/* Table */}
              <StudentTable />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 animate-in fade-in-50 duration-500">
              {/* Row 1: GPA Trend — full width */}
              <GpaTrendChart />

              {/* Row 2: Scatter (left) + Backlog (right) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AttendanceScatterChart />
                <BacklogImpactChart />
              </div>

              {/* Row 3: Executive Insight Cards */}
              <ModelObservations />

              {/* Row 4: Feature Importance */}
              <FeatureImportanceChart />
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="text-center py-4 text-xs text-muted-foreground">
            Student Retention Risk Scoring Model · Powered by Machine Learning
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;