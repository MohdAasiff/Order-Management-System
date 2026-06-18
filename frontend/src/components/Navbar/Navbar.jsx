// src/components/Navbar/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="navbar-brand">Order Management System</h2>
      
      <div className="navbar-links">
        {/* The 'end' prop ensures Dashboard is only active on exactly '/' */}
        <NavLink to="/" className="nav-link" end>
          Dashboard
        </NavLink>
        
        <NavLink to="/products" className="nav-link">
          Products
        </NavLink>
        
        <NavLink to="/customers" className="nav-link">
          Customers
        </NavLink>
        
        <NavLink to="/orders" className="nav-link">
          Orders
        </NavLink>
      </div>
    </nav>
  );
}