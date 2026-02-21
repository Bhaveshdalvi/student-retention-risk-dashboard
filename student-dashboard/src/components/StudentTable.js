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

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Complete Student Dataset
        </Typography>

        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            overflowX: "auto",
            border: "1px solid #ddd"
          }}
        >
          <Table sx={{ minWidth: 1400 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Attendance</TableCell>
                <TableCell>GPA Sem1</TableCell>
                <TableCell>GPA Sem2</TableCell>
                <TableCell>GPA Sem3</TableCell>
                <TableCell>GPA Sem4</TableCell>
                <TableCell>GPA Sem5</TableCell>
                <TableCell>Avg GPA</TableCell>
                <TableCell>Backlog Count</TableCell>
                <TableCell>Event Score</TableCell>
                <TableCell>Risk</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {students.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell>{student.attendance}</TableCell>
                  <TableCell>{student.gpa_sem1}</TableCell>
                  <TableCell>{student.gpa_sem2}</TableCell>
                  <TableCell>{student.gpa_sem3}</TableCell>
                  <TableCell>{student.gpa_sem4}</TableCell>
                  <TableCell>{student.gpa_sem5}</TableCell>
                  <TableCell>{student.avg_gpa}</TableCell>
                  <TableCell>{student.backlog_count}</TableCell>
                  <TableCell>{student.event_score}</TableCell>

                  {/* ✅ FIXED HERE */}
                  <TableCell>
                    {Number(student.dropout_risk) === 1 ? (
                      <Chip label="High" color="error" />
                    ) : (
                      <Chip label="Low" color="success" />
                    )}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </CardContent>
    </Card>
  );
}

export default StudentTable;