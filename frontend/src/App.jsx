// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

import Navbar from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products';
import Customers from './components/Customers/Customers';
import Orders from './components/Orders/Orders';

export default function App() {
  return (
    <Router>
      {/* ✅ FAANG SaaS Upgrade: Pure Fluid Layout spanning across 100% viewport */}
      <div style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box', padding: '24px 40px', fontFamily: 'var(--font-sans)' }}>
        <Navbar />
        <main style={{ width: '100%' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
        
        <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          theme="colored" 
        />
      </div>
    </Router>
  );
}