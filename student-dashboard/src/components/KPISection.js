import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

function KPISection({ students }) {

  const total = students.length;

  // ✅ FIXED: use dropout_risk instead of dropout_flag
  const highRisk = students.filter(
    (s) => Number(s.dropout_risk) === 1
  ).length;

  const avgAttendance = total > 0
    ? (
        students.reduce((a, s) => a + Number(s.attendance), 0) / total
      ).toFixed(2)
    : 0;

  const avgGPA = total > 0
    ? (
        students.reduce((a, s) => a + Number(s.avg_gpa), 0) / total
      ).toFixed(2)
    : 0;

  const retentionRate = total > 0
    ? (((total - highRisk) / total) * 100).toFixed(2)
    : 0;

  const cards = [
    { title: "Total Students", value: total },
    { title: "High Risk Students", value: highRisk },
    { title: "Avg Attendance", value: avgAttendance + "%" },
    { title: "Avg GPA", value: avgGPA },
    { title: "Retention Rate", value: retentionRate + "%" },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} md={2.4} key={index}>
          <Card elevation={4}>
            <CardContent>
              <Typography variant="subtitle2">
                {card.title}
              </Typography>
              <Typography variant="h5">
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default KPISection;