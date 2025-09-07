import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthForm from './pages/Auth'
const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<AuthForm/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App