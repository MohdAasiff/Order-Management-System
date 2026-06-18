// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ products: 0, customers: 0, orders: 0, lowStock: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/products/'), 
      api.get('/customers/'), 
      api.get('/orders/')
    ])
      .then(([resProducts, resCustomers, resOrders]) => {
        // ✅ FAANG Fix: Ensure we are counting the arrays inside .data
        const productsList = resProducts.data || [];
        
        setMetrics({
          products: productsList.length,
          customers: (resCustomers.data || []).length,
          orders: (resOrders.data || []).length,
          lowStock: productsList.filter(p => p.quantity < 5).length
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>System Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <Card title="Total Products" value={metrics.products} color="#2563eb" />
        <Card title="Total Customers" value={metrics.customers} color="#16a34a" />
        <Card title="Total Orders" value={metrics.orders} color="#9333ea" />
        <Card title="Low Stock Items" value={metrics.lowStock} color="#dc2626" />
      </div>
    </div>
  );
}

const Card = ({ title, value, color }) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderLeft: `5px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#6b7280', textTransform: 'uppercase', fontSize: '12px' }}>{title}</h4>
    <p style={{ fontSize: '36px', margin: 0, fontWeight: 'bold', color }}>{value}</p>
  </div>
);