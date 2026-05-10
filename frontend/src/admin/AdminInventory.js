import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function AdminInventory({ token, onStatsChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState({});
  const [saving, setSaving] = useState({});
  const sseRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    connectSSE();
    return () => sseRef.current?.close();
  }, []);

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

  const connectSSE = () => {
    const es = new EventSource(`${API_URL}/api/admin/events?token=${token}`);
    sseRef.current = es;

    es.addEventListener('stock_updated', (e) => {
      const { id, stock } = JSON.parse(e.data);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p));
    });

    es.addEventListener('new_order', () => {
      // Refresh stock after a new order deducts inventory
      fetchProducts();
    });
  };

  const handleAdjust = (id, delta) => {
    const product = products.find(p => p.id === id);
    const current = parseInt(adjustments[id] ?? product.stock);
    setAdjustments(prev => ({ ...prev, [id]: Math.max(0, current + delta) }));
  };

  const handleSetStock = (id, value) => {
    setAdjustments(prev => ({ ...prev, [id]: Math.max(0, parseInt(value) || 0) }));
  };

  const handleSaveStock = async (id) => {
    const newStock = adjustments[id];
    if (newStock === undefined) return;
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      await axios.put(
        `${API_URL}/api/admin/products/${id}/stock`,
        { stock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
      setAdjustments(prev => { const n = { ...prev }; delete n[id]; return n; });
      onStatsChange();
    } catch {
      alert('Failed to update stock.');
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', cls: 'out' };
    if (stock <= 10) return { label: 'Low Stock', cls: 'low' };
    return { label: 'In Stock', cls: 'ok' };
  };

  if (loading) return <div className="admin-loading">Loading inventory...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Inventory</h2>
        <span className="admin-live-badge">Live</span>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Adjust</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const displayStock = adjustments[product.id] ?? product.stock;
              const isDirty = adjustments[product.id] !== undefined;
              const status = getStockStatus(product.stock);

              return (
                <tr key={product.id} className={status.cls === 'out' ? 'row-danger' : status.cls === 'low' ? 'row-warning' : ''}>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.category}</td>
                  <td>
                    <input
                      type="number" min="0" className="stock-input"
                      value={displayStock}
                      onChange={e => handleSetStock(product.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <span className={`stock-pill ${status.cls}`}>{status.label}</span>
                  </td>
                  <td>
                    <div className="stock-adj-btns">
                      <button onClick={() => handleAdjust(product.id, -10)}>-10</button>
                      <button onClick={() => handleAdjust(product.id, -1)}>-1</button>
                      <button onClick={() => handleAdjust(product.id, +1)}>+1</button>
                      <button onClick={() => handleAdjust(product.id, +10)}>+10</button>
                    </div>
                  </td>
                  <td>
                    {isDirty && (
                      <button
                        className="admin-btn-primary admin-btn-sm"
                        disabled={saving[product.id]}
                        onClick={() => handleSaveStock(product.id)}
                      >
                        {saving[product.id] ? '...' : 'Save'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

