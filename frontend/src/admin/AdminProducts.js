import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const EMPTY_FORM = {
  name: '', category: 'supplements', price: '', stock: '',
  description: '', ingredients: '', tags: ''
};

export default function AdminProducts({ token, onStatsChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients,
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0
      };
      if (editingProduct) {
        const res = await axios.put(`${API_URL}/api/admin/products/${editingProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? res.data : p));
      } else {
        const res = await axios.post(`${API_URL}/api/admin/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(prev => [...prev, res.data]);
      }
      setShowForm(false);
      onStatsChange();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_URL}/api/admin/products/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(prev => prev.filter(p => p.id !== product.id));
      onStatsChange();
    } catch {
      alert('Failed to delete product.');
    }
  };

  if (loading) return <div className="admin-loading">Loading products...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Products</h2>
        <button className="admin-btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSave} className="admin-product-form">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="vitamins">Vitamins</option>
                  <option value="supplements">Supplements</option>
                  <option value="minerals">Minerals</option>
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Price ($) *</label>
                <input type="number" step="0.01" min="0" required
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Initial Stock</label>
                <input type="number" min="0"
                  value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label>Ingredients (comma-separated)</label>
              <input value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label>Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div className="admin-form-actions">
              <button type="button" className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="admin-btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <strong>{product.name}</strong>
                  <br /><small>{product.description}</small>
                </td>
                <td><span className="category-badge">{product.category}</span></td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <span className={`stock-pill ${product.stock === 0 ? 'out' : product.stock <= 10 ? 'low' : 'ok'}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <button className="admin-btn-sm" onClick={() => openEdit(product)}>Edit</button>
                  <button className="admin-btn-sm danger" onClick={() => handleDelete(product)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

