import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthForm from './pages/Auth'
import Available from './components/Available'
const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<AuthForm/>}/>
      <Route path="/availble" element={<Available/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App