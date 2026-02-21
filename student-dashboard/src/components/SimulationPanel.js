import React, { useState } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Divider,
  Card,
  CardContent
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";

import GaugeChart from "react-gauge-chart";

function SimulationPanel({ students }) {

  const [selectedStudent, setSelectedStudent] = useState("");
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    if (!selectedStudent) return;

    const response = await axios.post(
      "http://127.0.0.1:5000/predict",
      { name: selectedStudent.name }
    );

    setResult(response.data);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
      <Grid container spacing={4}>

        {/* LEFT PANEL */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Student Risk Prediction
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  {students.map((student) => (
                    <MenuItem key={student.name} value={student}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                onClick={handlePredict}
              >
                PREDICT RISK
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT VISUAL AREA */}
        <Grid item xs={12} md={8}>
          {result && selectedStudent && (
            <Grid container spacing={3}>

              {/* GAUGE */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6">
                      Risk Meter
                    </Typography>

                    <GaugeChart
                      id="risk-gauge"
                      nrOfLevels={20}
                      percent={result.probability}
                      colors={["#4CAF50", "#FFC107", "#F44336"]}
                      arcWidth={0.3}
                      textColor="#000000"
                      formatTextValue={() =>
                        `${(result.probability * 100).toFixed(2)}%`
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* SUMMARY CARD */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h4">
                      {(result.probability * 100).toFixed(2)}%
                    </Typography>

                    <Chip
                      label={
                        result.probability > 0.5
                          ? "High Risk"
                          : "Low Risk"
                      }
                      color={
                        result.probability > 0.5
                          ? "error"
                          : "success"
                      }
                      sx={{ mt: 1 }}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Typography>Course: {selectedStudent.course}</Typography>
                    <Typography>Year: {selectedStudent.year}</Typography>
                    <Typography>
                      Attendance: {selectedStudent.attendance}%
                    </Typography>
                    <Typography>
                      Avg GPA: {selectedStudent.avg_gpa}
                    </Typography>
                    <Typography>
                      Backlogs: {selectedStudent.backlog_count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* RISK COMPARISON */}
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6">
                      Risk Comparison
                    </Typography>

                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          {
                            name: "Low Risk",
                            value: (1 - result.probability) * 100
                          },
                          {
                            name: "High Risk",
                            value: result.probability * 100
                          }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) =>
                          `${value.toFixed(2)}%`
                        } />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          <Cell fill="#4CAF50" />
                          <Cell fill="#F44336" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* GPA TREND */}
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6">
                      GPA Trend (Semester-wise)
                    </Typography>

                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={[
                          { sem: "Sem 1", gpa: selectedStudent.gpa_sem1 },
                          { sem: "Sem 2", gpa: selectedStudent.gpa_sem2 },
                          { sem: "Sem 3", gpa: selectedStudent.gpa_sem3 },
                          { sem: "Sem 4", gpa: selectedStudent.gpa_sem4 },
                          { sem: "Sem 5", gpa: selectedStudent.gpa_sem5 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sem" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="gpa"
                          stroke="#1976D2"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default SimulationPanel;