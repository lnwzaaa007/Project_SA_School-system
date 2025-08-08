
// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
// import StudentLayout from "./layout/StudentLayout";
// import TeacherLayout from "./layout/TeacherLayout";
// import AdminLayout from "./layout/AdminLayout";
import ConfigRoutes from "./routes";
// import filesubmit from './pages/student/AssignSubmit/FileSubmit'

function App() {
  return (
    <>
      <Router>
        {/* <StudentLayout /> */}
        {/* <TeacherLayout />/ */}
        {/* <AdminLayout /> */}
        <ConfigRoutes />
      </Router>
    </>
  );
}

export default App;

