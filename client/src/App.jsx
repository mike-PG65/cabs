import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthForm from './pages/Auth'
import Navbar from './components/Navbar'
import Categories from './pages/Categories'
import CarDetails from './components/CarDetails'
const App = () => {
  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/" element={<AuthForm/>}/>
      <Route path='/categories' element={<Categories/>}/>
      <Route path="/cardetails/:id" element={<CarDetails/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App