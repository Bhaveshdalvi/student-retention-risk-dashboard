import React, { useEffect, useState } from "react";
import axios from "axios";
import SimulationPanel from "./SimulationPanel";
import StudentTable from "./StudentTable";
import KPISection from "./KPISection";

function Dashboard() {

  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/students")
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>🎓 Academic Risk Prediction Dashboard</h2>

      <KPISection students={students} />

      <br />

      <SimulationPanel students={students} />

      <br />

      <StudentTable students={students} />
    </div>
  );
}

export default Dashboard;