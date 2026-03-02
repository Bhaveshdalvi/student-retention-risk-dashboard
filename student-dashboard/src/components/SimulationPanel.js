import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Button, Select, MenuItem, Chip } from "@mui/material";
import GaugeChart from "react-gauge-chart";

function SimulationPanel({ students }) {

  const [selectedStudent, setSelectedStudent] = useState("");
  const [result, setResult] = useState(null);

  const getRiskLevel = (prob) => {
    if (prob <= 0.30) return { label: "Low", color: "success" };
    if (prob <= 0.60) return { label: "Medium", color: "warning" };
    return { label: "High", color: "error" };
  };

  const handlePredict = async () => {
    if (!selectedStudent) return;

    const response = await axios.post(
      "http://127.0.0.1:5000/predict",
      { name: selectedStudent.name }
    );

    setResult(response.data);
  };

  return (
    <div style={{ display: "flex", gap: "40px", marginTop: "20px" }}>

      <Card style={{ width: "300px", padding: "20px" }}>
        <CardContent>
          <Typography variant="h6">Select Student</Typography>

          <Select
            fullWidth
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{ marginTop: "15px" }}
          >
            {students.map((student) => (
              <MenuItem key={student.name} value={student}>
                {student.name}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            fullWidth
            style={{ marginTop: "20px" }}
            onClick={handlePredict}
          >
            Predict Risk
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card style={{ width: "350px", padding: "20px" }}>
          <CardContent>
            <Typography variant="h6">Risk Probability</Typography>

            <GaugeChart
              id="risk-gauge"
              percent={result.risk_probability}
              colors={["#4CAF50", "#FFC107", "#F44336"]}
              arcWidth={0.3}
              formatTextValue={() =>
                `${(result.risk_probability * 100).toFixed(2)}%`
              }
            />

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <Chip
                label={getRiskLevel(result.risk_probability).label}
                color={getRiskLevel(result.risk_probability).color}
                size="medium"
              />
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SimulationPanel;
