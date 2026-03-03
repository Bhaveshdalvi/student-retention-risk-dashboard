import type { Student } from "@/data/mockStudents";

// Production: VITE_API_URL is unset → "" → relative /api/* calls hit Vercel serverless
// Local dev:  VITE_API_URL=http://127.0.0.1:5000 in .env.development.local → hits Flask
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/api/students`);
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function predictRisk(name: string): Promise<number> {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Prediction failed");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.probability;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export async function fetchFeatureImportance(): Promise<FeatureImportanceItem[]> {
  const res = await fetch(`${API_BASE}/api/feature-importance`);
  if (!res.ok) throw new Error("Failed to fetch feature importance");
  return res.json();
}
