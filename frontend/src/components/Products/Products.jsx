import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { toast } from 'react-toastify';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState(null); // ✅ Tracks if we are editing

  const fetchProducts = () => {
    api.get('/products/').then(res => setProducts(res.data)).catch(() => toast.error('Failed to load products.'));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleEdit = (product) => {
    setForm({ name: product.name, sku: product.sku, price: product.price, quantity: product.quantity });
    setEditingId(product.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity, 10) };
      
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products/', payload);
        toast.success('Product added successfully!');
      }
      
      setForm({ name: '', sku: '', price: '', quantity: '' });
      setEditingId(null);
      fetchProducts();
    } catch (err) { 
      toast.error(err.response?.data?.detail || 'Operation failed.'); 
    }
  };

 const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.info('Product deleted.');
        fetchProducts();
      } catch (err) {
        // ✅ FAANG Standard: Dynamically read backend validation details if they exist
        const errorMessage = err.response?.data?.detail || 'Failed to delete product.';
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="products-container">
      <div className="panel">
        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} className="form-group">
          <input required placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input required placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
          <input required type="number" step="0.01" placeholder="Price ($)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <input required type="number" placeholder="Stock" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
          <button type="submit" className="btn-primary">{editingId ? 'Update Product' : 'Save Product'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', sku: '', price: '', quantity: '' }); }} style={{marginTop: '10px'}} className="btn-danger">Cancel Edit</button>}
        </form>
      </div>

      <div className="panel">
        <h3>Inventory List</h3>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td><td>{product.name}</td><td><code>{product.sku}</code></td><td>${product.price.toFixed(2)}</td>
                  <td>{product.quantity}</td>
                  <td>
                    <button onClick={() => handleEdit(product)} className="btn-primary" style={{marginRight: '10px', backgroundColor: '#3b82f6'}}>Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}