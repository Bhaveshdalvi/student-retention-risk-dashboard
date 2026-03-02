import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip
} from "@mui/material";

function StudentTable({ students }) {

  const getRiskLevel = (prob) => {
    if (prob <= 0.30) return { label: "Low", color: "success" };
    if (prob <= 0.60) return { label: "Medium", color: "warning" };
    return { label: "High", color: "error" };
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>

        <Typography variant="h6" gutterBottom>
          Student Academic Risk Overview
        </Typography>

        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Attendance</TableCell>
                <TableCell>Avg GPA</TableCell>
                <TableCell>Backlogs</TableCell>
                <TableCell>Risk %</TableCell>
                <TableCell>Risk Level</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {students.map((student, index) => {

                const prob = Number(student.predicted_risk_probability);
                const risk = getRiskLevel(prob);

                return (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor:
                        prob > 0.6 ? "#ffe6e6" : "inherit"
                    }}
                  >
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.attendance}</TableCell>
                    <TableCell>{student.avg_gpa}</TableCell>
                    <TableCell>{student.backlog_count}</TableCell>
                    <TableCell>
                      {(prob * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Chip label={risk.label} color={risk.color} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

      </CardContent>
    </Card>
  );
}

export default StudentTable;