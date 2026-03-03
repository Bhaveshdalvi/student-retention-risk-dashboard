import type { Student } from "@/data/mockStudents";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE_URL}/students`);
  if (!res.ok) throw new Error("Failed to fetch students");
  const data: Student[] = await res.json();
  return data;
}

export async function predictRisk(name: string): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Prediction failed");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.risk_probability;
}
