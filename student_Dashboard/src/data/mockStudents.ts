export interface Student {
  name: string;
  attendance: number;
  gpa_sem1: number;
  gpa_sem2: number;
  gpa_sem3: number;
  gpa_sem4: number;
  gpa_sem5: number;
  avg_gpa: number;
  has_backlog: number;
  backlog_count: number;
  event_score: number;
  gender: string;
  course: string;
  year: string;
  age: number;
  predicted_risk_probability: number;
  dropout_thought: number;
}

export const students: Student[] = [
  { name: "Karan Sharma", attendance: 58, gpa_sem1: 7.38, gpa_sem2: 7.33, gpa_sem3: 8.21, gpa_sem4: 6.3, gpa_sem5: 6.37, avg_gpa: 7.1, has_backlog: 0, backlog_count: 0, event_score: 2, gender: "Male", course: "BSc IT", year: "1st Year", age: 21, predicted_risk_probability: 0.36, dropout_thought: 0 },
  { name: "Rohan Mishra", attendance: 46, gpa_sem1: 7.03, gpa_sem2: 6.49, gpa_sem3: 6.36, gpa_sem4: 6.86, gpa_sem5: 7.27, avg_gpa: 6.8, has_backlog: 1, backlog_count: 2, event_score: 3, gender: "Male", course: "BA", year: "2nd Year", age: 21, predicted_risk_probability: 0.56, dropout_thought: 0 },
  { name: "Vivaan Gupta", attendance: 73, gpa_sem1: 7.45, gpa_sem2: 6.28, gpa_sem3: 7.0, gpa_sem4: 6.28, gpa_sem5: 9.22, avg_gpa: 7.2, has_backlog: 0, backlog_count: 0, event_score: 3, gender: "Male", course: "BSc IT", year: "3rd Year", age: 22, predicted_risk_probability: 0.23, dropout_thought: 0 },
  { name: "Aisha Saxena", attendance: 75, gpa_sem1: 7.99, gpa_sem2: 5.53, gpa_sem3: 7.25, gpa_sem4: 4.65, gpa_sem5: 5.41, avg_gpa: 6.2, has_backlog: 1, backlog_count: 5, event_score: 1, gender: "Female", course: "BSc IT", year: "2nd Year", age: 18, predicted_risk_probability: 0.80, dropout_thought: 1 },
  { name: "Pooja Nair", attendance: 87, gpa_sem1: 8.63, gpa_sem2: 6.91, gpa_sem3: 8.2, gpa_sem4: 7.43, gpa_sem5: 6.23, avg_gpa: 7.5, has_backlog: 1, backlog_count: 2, event_score: 0, gender: "Female", course: "BSc CS", year: "3rd Year", age: 22, predicted_risk_probability: 0.46, dropout_thought: 1 },
  { name: "Karan Iyer", attendance: 73, gpa_sem1: 7.1, gpa_sem2: 6.64, gpa_sem3: 7.11, gpa_sem4: 4.61, gpa_sem5: 6.74, avg_gpa: 6.4, has_backlog: 1, backlog_count: 1, event_score: 1, gender: "Male", course: "BA", year: "2nd Year", age: 19, predicted_risk_probability: 0.52, dropout_thought: 0 },
  { name: "Yash Gupta", attendance: 72, gpa_sem1: 7.12, gpa_sem2: 8.16, gpa_sem3: 7.0, gpa_sem4: 6.61, gpa_sem5: 6.53, avg_gpa: 7.1, has_backlog: 1, backlog_count: 2, event_score: 1, gender: "Male", course: "BSc CS", year: "2nd Year", age: 21, predicted_risk_probability: 0.53, dropout_thought: 0 },
  { name: "Anjali Khan", attendance: 54, gpa_sem1: 6.5, gpa_sem2: 6.59, gpa_sem3: 6.04, gpa_sem4: 6.81, gpa_sem5: 7.48, avg_gpa: 6.7, has_backlog: 1, backlog_count: 1, event_score: 1, gender: "Female", course: "BSc IT", year: "2nd Year", age: 20, predicted_risk_probability: 0.59, dropout_thought: 0 },
  { name: "Meera Mishra", attendance: 74, gpa_sem1: 7.98, gpa_sem2: 5.73, gpa_sem3: 6.09, gpa_sem4: 7.55, gpa_sem5: 6.92, avg_gpa: 6.9, has_backlog: 0, backlog_count: 0, event_score: 2, gender: "Female", course: "BSc CS", year: "3rd Year", age: 21, predicted_risk_probability: 0.33, dropout_thought: 0 },
  { name: "Kavya Singh", attendance: 96, gpa_sem1: 8.28, gpa_sem2: 4.0, gpa_sem3: 8.78, gpa_sem4: 9.59, gpa_sem5: 7.01, avg_gpa: 7.5, has_backlog: 0, backlog_count: 0, event_score: 2, gender: "Female", course: "BBA", year: "2nd Year", age: 18, predicted_risk_probability: 0.15, dropout_thought: 0 },
  { name: "Tanvi Verma", attendance: 65, gpa_sem1: 8.69, gpa_sem2: 8.67, gpa_sem3: 5.94, gpa_sem4: 7.09, gpa_sem5: 6.41, avg_gpa: 7.4, has_backlog: 0, backlog_count: 0, event_score: 0, gender: "Female", course: "BSc CS", year: "2nd Year", age: 22, predicted_risk_probability: 0.43, dropout_thought: 1 },
  { name: "Siddharth Gupta", attendance: 69, gpa_sem1: 8.03, gpa_sem2: 7.86, gpa_sem3: 5.86, gpa_sem4: 6.36, gpa_sem5: 8.32, avg_gpa: 7.3, has_backlog: 0, backlog_count: 0, event_score: 1, gender: "Male", course: "BA", year: "3rd Year", age: 22, predicted_risk_probability: 0.37, dropout_thought: 0 },
  { name: "Neha Pandey", attendance: 82, gpa_sem1: 7.3, gpa_sem2: 7.42, gpa_sem3: 6.18, gpa_sem4: 7.28, gpa_sem5: 7.35, avg_gpa: 7.1, has_backlog: 0, backlog_count: 0, event_score: 2, gender: "Female", course: "BCom", year: "1st Year", age: 21, predicted_risk_probability: 0.26, dropout_thought: 0 },
  { name: "Neha Tiwari", attendance: 73, gpa_sem1: 8.09, gpa_sem2: 6.96, gpa_sem3: 4.68, gpa_sem4: 5.98, gpa_sem5: 8.64, avg_gpa: 6.9, has_backlog: 1, backlog_count: 1, event_score: 0, gender: "Female", course: "BBA", year: "2nd Year", age: 22, predicted_risk_probability: 0.53, dropout_thought: 0 },
  { name: "Rahul Agarwal", attendance: 97, gpa_sem1: 7.48, gpa_sem2: 4.86, gpa_sem3: 6.71, gpa_sem4: 7.39, gpa_sem5: 7.61, avg_gpa: 6.8, has_backlog: 1, backlog_count: 1, event_score: 1, gender: "Male", course: "BSc CS", year: "3rd Year", age: 20, predicted_risk_probability: 0.38, dropout_thought: 0 },
  { name: "Nisha Patel", attendance: 98, gpa_sem1: 6.46, gpa_sem2: 7.93, gpa_sem3: 8.25, gpa_sem4: 6.59, gpa_sem5: 7.01, avg_gpa: 7.2, has_backlog: 1, backlog_count: 1, event_score: 0, gender: "Female", course: "BBA", year: "1st Year", age: 21, predicted_risk_probability: 0.37, dropout_thought: 0 },
  { name: "Aarav Jain", attendance: 73, gpa_sem1: 5.63, gpa_sem2: 7.43, gpa_sem3: 7.67, gpa_sem4: 8.3, gpa_sem5: 7.01, avg_gpa: 7.2, has_backlog: 0, backlog_count: 0, event_score: 3, gender: "Male", course: "BA", year: "1st Year", age: 19, predicted_risk_probability: 0.23, dropout_thought: 0 },
  { name: "Shreya Bansal", attendance: 60, gpa_sem1: 9.54, gpa_sem2: 6.4, gpa_sem3: 6.61, gpa_sem4: 7.63, gpa_sem5: 10.0, avg_gpa: 8.0, has_backlog: 1, backlog_count: 4, event_score: 2, gender: "Female", course: "BSc CS", year: "1st Year", age: 18, predicted_risk_probability: 0.57, dropout_thought: 1 },
  { name: "Riya Sharma", attendance: 62, gpa_sem1: 7.34, gpa_sem2: 6.25, gpa_sem3: 6.75, gpa_sem4: 6.41, gpa_sem5: 6.29, avg_gpa: 6.6, has_backlog: 0, backlog_count: 0, event_score: 3, gender: "Female", course: "BSc CS", year: "1st Year", age: 21, predicted_risk_probability: 0.37, dropout_thought: 0 },
  { name: "Ishaan Jain", attendance: 95, gpa_sem1: 7.99, gpa_sem2: 7.02, gpa_sem3: 7.53, gpa_sem4: 8.26, gpa_sem5: 6.25, avg_gpa: 7.4, has_backlog: 0, backlog_count: 0, event_score: 2, gender: "Male", course: "BSc CS", year: "3rd Year", age: 20, predicted_risk_probability: 0.17, dropout_thought: 0 },
];

export type RiskLevel = "low" | "medium" | "high";

export function getRiskLevel(prob: number): { level: RiskLevel; label: string } {
  if (prob <= 0.3) return { level: "low", label: "Low Risk" };
  if (prob <= 0.6) return { level: "medium", label: "Medium Risk" };
  return { level: "high", label: "High Risk" };
}
