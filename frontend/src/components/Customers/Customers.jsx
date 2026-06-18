// src/components/Customers/Customers.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { toast } from 'react-toastify';
import './Customers.css';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const fetchCustomers = () => {
    api.get('/customers/')
      .then(response => setCustomers(response.data))
      .catch(() => toast.error('Failed to load customers.'));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers/', form);
      toast.success('Customer added successfully!');
      setForm({ name: '', email: '', phone: '' });
      fetchCustomers();
    } catch (err) { 
      toast.error(err.response?.data?.detail || 'Failed to add customer.'); 
    }
  };

 const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        toast.info('Customer removed.');
        fetchCustomers();
      } catch (err) {
        // ✅ FAANG Standard: Dynamically read backend validation details if they exist
        const errorMessage = err.response?.data?.detail || 'Failed to delete customer.';
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="customers-container">
      {/* REGISTER FORM PANEL */}
      <div className="panel">
        <h3>Register Customer</h3>
        <form onSubmit={handleSubmit} className="form-group">
          <input required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input required type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input required placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--success-color)' }}>Save Customer</button>
        </form>
      </div>
      
      {/* DATA DIRECTORY PANEL */}
      <div className="panel">
        <h3>Customer Directory</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No customers registered yet.</td></tr>
            ) : (
              customers.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td style={{ fontWeight: '500' }}>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td><button onClick={() => handleDelete(c.id)} className="btn-danger">Delete</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}