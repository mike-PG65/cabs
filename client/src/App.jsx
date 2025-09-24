import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthForm from './pages/Auth'
import Navbar from './components/Navbar'
import Categories from './pages/Categories'
import CarDetails from './components/CarDetails'
import CartPage from './pages/Cart'
import HirePage from './pages/HirePage'
import HireReceipt from './pages/HireReceipt'
const App = () => {
  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/login" element={<AuthForm mode="login"/>}/>
      <Route path="/register" element={<AuthForm mode = "register"/>}/>
      <Route path='/categories' element={<Categories/>}/>
      <Route path="/cardetails/:id" element={<CarDetails/>}/>
      <Route path='/cart' element={<CartPage/>}/>
      <Route path="/hire" element={<HirePage/>}/>
       <Route path="/hire/:hireId/receipt" element={<HireReceipt />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App