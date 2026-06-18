// src/components/Orders/Orders.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { toast } from 'react-toastify';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_id: '', product_id: '', quantity: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async () => {
    try {
      const [resOrders, resProducts, resCustomers] = await Promise.all([
        api.get('/orders/'), 
        api.get('/products/'), 
        api.get('/customers/')
      ]);
      setOrders(resOrders.data); 
      setProducts(resProducts.data); 
      setCustomers(resCustomers.data);
    } catch (err) { 
      toast.error('Failed to sync order data.'); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getCustomerName = (id) => customers.find(c => c.id === id)?.name || `Unknown (ID: ${id})`;
  const getProductName = (id) => products.find(p => p.id === id)?.name || `Unknown (ID: ${id})`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer_id: parseInt(form.customer_id, 10),
        product_id: parseInt(form.product_id, 10),
        quantity: parseInt(form.quantity, 10)
      };

      await api.post('/orders/', payload);
      toast.success('Order processed successfully!');
      setForm({ customer_id: '', product_id: '', quantity: '' });
      fetchData(); 
    } catch (err) { 
      toast.error(err.response?.data?.detail || 'Failed to create order.'); 
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Cancel this order and refund inventory?')) {
      try {
        await api.delete(`/orders/${id}`);
        toast.info('Order cancelled and stock refunded.');
        fetchData();
        setSelectedOrder(null); // Close modal if open
      } catch(err) {
        toast.error('Failed to cancel order.');
      }
    }
  };

  return (
    <div className="orders-container">
      <div className="panel">
        <h3>Create New Order</h3>
        <form onSubmit={handleSubmit} className="form-group">
          
          <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})}>
            <option value="">-- Select Customer --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select required value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})}>
            <option value="">-- Select Product --</option>
            {products.map(p => (
              <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                {p.name} (Stock: {p.quantity}) {p.quantity <= 0 ? ' - OUT OF STOCK' : ''}
              </option>
            ))}
          </select>

          <input required type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
          
          <button type="submit" className="btn-primary" style={{ backgroundColor: '#9333ea' }}>Submit Order</button>
        </form>
      </div>

      <div className="panel">
        <h3>Order Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Product</th><th>Total</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No orders placed yet.</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id}>
                  <td><code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>ORD-{o.id}</code></td>
                  <td>{getCustomerName(o.customer_id)}</td>
                  <td>{getProductName(o.product_id)}</td>
                  <td className="total-cell">${o.total_amount.toFixed(2)}</td>
                  <td>
                    <button onClick={() => setSelectedOrder(o)} className="btn-primary" style={{ backgroundColor: '#3b82f6', marginRight: '10px' }}>View</button>
                    <button onClick={() => handleDelete(o.id)} className="btn-danger">Cancel</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ FAANG UI: Professional Modal Popup */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          {/* stopPropagation prevents clicks inside the white box from closing the modal */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Invoice Details</h4>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p><strong>Order Reference:</strong> ORD-{selectedOrder.id}</p>
              <p><strong>Customer Name:</strong> {getCustomerName(selectedOrder.customer_id)}</p>
              <p><strong>Product Item:</strong> {getProductName(selectedOrder.product_id)}</p>
              <p><strong>Units Ordered:</strong> {selectedOrder.quantity}</p>
              
              <p style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)', fontSize: '1.1rem' }}>
                <strong>Grand Total:</strong> 
                <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>${selectedOrder.total_amount.toFixed(2)}</span>
              </p>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <button onClick={() => setSelectedOrder(null)} className="btn-primary" style={{ backgroundColor: 'var(--text-secondary)' }}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}