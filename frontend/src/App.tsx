import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import Layout from './layout/StudentLayout'
import {BrowserRouter as Router} from 'react-router-dom'
import filesubmit from './pages/student/AssignSubmit/FileSubmit'


function App() {
  return (
    <Router>
      <Layout/>
    </Router>
  )
}

export default App

