import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

function KPISection({ students }) {

  const total = students.length;

  const avgRisk = total > 0
    ? (students.reduce((a, s) =>
        a + Number(s.predicted_risk_probability), 0
      ) / total * 100).toFixed(2)
    : 0;

  const highRisk = students.filter(
    s => Number(s.predicted_risk_probability) > 0.6
  ).length;

  const cards = [
    { title: "Total Students", value: total },
    { title: "High Risk Students", value: highRisk },
    { title: "Average Risk %", value: avgRisk + "%" }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} md={4} key={index}>
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