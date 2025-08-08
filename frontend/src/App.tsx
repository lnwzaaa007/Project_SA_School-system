import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import Layout from './componunt/layoutStudent'
import {BrowserRouter as Router} from 'react-router-dom'
import filesubmit from './page/Student/FileSubmit'


function App() {
  return (
    <Router>
      <Layout/>
    </Router>
  )
}

export default App

