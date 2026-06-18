// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import './Dashboard.css';

// Premium color palette for data visualization
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [stockData, setStockData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/products/'), 
      api.get('/customers/'), 
      api.get('/orders/')
    ])
      .then(([resProducts, resCustomers, resOrders]) => {
        const productsList = resProducts.data || [];
        const customersList = resCustomers.data || [];
        const ordersList = resOrders.data || [];

        // 1. KPI Aggregations
        const totalRevenue = ordersList.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        
        setMetrics({
          products: productsList.length,
          customers: customersList.length,
          orders: ordersList.length,
          revenue: totalRevenue
        });

        // 2. Bar Chart Data (Top 5 Products by Stock)
        const sortedStock = [...productsList].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        setStockData(sortedStock.map(p => ({ name: p.name, stock: p.quantity })));

        // 3. Pie Chart Data (Revenue Distribution by Product)
        const productMap = {};
        productsList.forEach(p => productMap[p.id] = p.name);

        const revenueByProduct = {};
        ordersList.forEach(o => {
          const pName = productMap[o.product_id] || `ID: ${o.product_id}`;
          revenueByProduct[pName] = (revenueByProduct[pName] || 0) + o.total_amount;
        });
        
        const pieChartData = Object.keys(revenueByProduct).map(key => ({
          name: key, value: revenueByProduct[key]
        }));
        setSalesData(pieChartData);

        // 4. Area Chart Data (Order Size Trends)
        const trends = ordersList.map((o, index) => ({
          order: `ORD-${o.id}`,
          amount: o.total_amount
        }));
        setTrendData(trends);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="dashboard-container">
      <h2 style={{ marginBottom: '8px' }}>Analytics Overview</h2>
      
      {/* KPI WIDGETS */}
      <div className="kpi-grid">
        <KpiCard title="Gross Revenue" value={`$${metrics.revenue.toFixed(2)}`} color="#10b981" />
        <KpiCard title="Total Orders" value={metrics.orders} color="#4f46e5" />
        <KpiCard title="Active Customers" value={metrics.customers} color="#f59e0b" />
        <KpiCard title="Inventory Items" value={metrics.products} color="#ec4899" />
      </div>

      {/* CHARTS GRID LAYER 1 */}
      <div className="charts-grid">
        {/* Financial Area Chart */}
        <div className="chart-panel">
          <h3>Transaction Volume Trend</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="order" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" fill="#e0e7ff" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Pie Chart */}
        <div className="chart-panel">
          <h3>Revenue by Product</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={salesData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS GRID LAYER 2 */}
      <div className="chart-panel">
        <h3>Current Stock Levels (Top 5 Items)</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={stockData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: 500}} />
              <RechartsTooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="stock" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Reusable KPI Component
const KpiCard = ({ title, value, color }) => (
  <div className="kpi-card" style={{ borderLeftColor: color }}>
    <h4 className="kpi-title">{title}</h4>
    <p className="kpi-value" style={{ color: color }}>{value}</p>
  </div>
);