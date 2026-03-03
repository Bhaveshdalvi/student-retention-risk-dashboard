import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { GraduationCap, Activity } from "lucide-react";

import { AnimatedBackground } from "@/components/dashboard/AnimatedBackground";
import { KPICards } from "@/components/dashboard/KPICards";
import { SimulationPanel } from "@/components/dashboard/SimulationPanel";
import { RiskCharts } from "@/components/dashboard/RiskCharts";
import { TopAtRiskStudents } from "@/components/dashboard/TopAtRiskStudents";
import { StudentTable } from "@/components/dashboard/StudentTable";

interface Student {
  name: string;
  course: string;
  year: string;
  attendance: number;
  avg_gpa: number;
  backlog_count: number;
  predicted_risk_probability: number;
}

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [riskProbability, setRiskProbability] = useState<number | null>(null);

  // Fetch students from backend
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/students")
      .then((res) => {
        setStudents(res.data);
      })
      .catch((err) => console.error("API Error:", err));
  }, []);

  // Predict selected student
  const handlePredict = async (name: string) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        { name }
      );

      setRiskProbability(response.data.risk_probability);
    } catch (error) {
      console.error("Prediction error:", error);
    }
  };

  // Prevent blank screen crash
  if (!students || students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading students...
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

          {/* KPIs */}
          <KPICards students={students} />

          {/* Simulation */}
          <SimulationPanel
            students={students}
            onPredict={handlePredict}
            riskProbability={riskProbability}
          />

          {/* Charts + Top Risk */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <RiskCharts students={students} />
            </div>
            <div>
              <TopAtRiskStudents students={students} />
            </div>
          </div>

          {/* Table */}
          <StudentTable students={students} />

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