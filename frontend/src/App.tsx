import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router } from "react-router-dom";
import './App.css'
import StudentLayout from './layout/StudentLayout'
import TeacherLayout from './layout/TeacherLayout'
import ConfigRoutes from "./routes";

function App() {


  return (
    <>
      <Router>
        {/* <StudentLayout /> */}
        {/* <TeacherLayout />/ */}
        <ConfigRoutes />
      </Router>
    </>
  )
}

export default App
