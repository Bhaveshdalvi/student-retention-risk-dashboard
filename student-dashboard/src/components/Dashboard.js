import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, Box } from "@mui/material";
import axios from "axios";

import KPISection from "./KPISection";
import ChartsSection from "./ChartsSection";
import SimulationPanel from "./SimulationPanel";
import StudentTable from "./StudentTable";

function Dashboard() {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/students")
      .then((res) => {
        setStudents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 5 }}>
        <Typography variant="h5">Loading Dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 5 }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Student Retention Risk Dashboard
        </Typography>
      </Box>

      {/* KPI CARDS */}
      <KPISection students={students} />

      {/* MAIN SECTION */}
      <Grid container spacing={4} sx={{ mt: 2 }}>

        {/* LEFT – BIG PIE */}
        <Grid item xs={12} md={6}>
          <ChartsSection students={students} />
        </Grid>

        {/* RIGHT – PREDICTION */}
        <Grid item xs={12} md={6}>
          <SimulationPanel students={students} />
        </Grid>

      </Grid>

      {/* TABLE */}
      <Box sx={{ mt: 4 }}>
        <StudentTable students={students} />
      </Box>

    </Container>
  );
}

export default Dashboard;