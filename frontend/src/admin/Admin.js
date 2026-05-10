import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminInventory from './AdminInventory';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function Admin() {
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hs_admin')); } catch { return null; }
  });
  const [tab, setTab] = useState('orders');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (adminUser) fetchStats();
  }, [adminUser]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminUser.token}` }
      });
      setStats(res.data);
    } catch {}
  };

  const handleLogin = (userData) => {
    setAdminUser(userData);
    localStorage.setItem('hs_admin', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('hs_admin');
  };

  if (!adminUser) return <AdminLogin onLogin={handleLogin} />;

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo">HealthSupp Admin</span>
        </div>
        <nav className="admin-nav">
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button>
          <button className={tab === 'inventory' ? 'active' : ''} onClick={() => setTab('inventory')}>Inventory</button>
        </nav>
        <div className="admin-header-right">
          <span className="admin-username">{adminUser.firstName}</span>
          <button className="admin-logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">${stats.totalRevenue}</div>
            <div className="stat-label">Revenue</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">{stats.lowStockProducts}</div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>
      )}

      <main className="admin-main">
        {tab === 'orders' && <AdminOrders token={adminUser.token} onStatsChange={fetchStats} />}
        {tab === 'products' && <AdminProducts token={adminUser.token} onStatsChange={fetchStats} />}
        {tab === 'inventory' && <AdminInventory token={adminUser.token} onStatsChange={fetchStats} />}
      </main>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      if (!res.data.isAdmin) {
        setError('This account does not have admin access.');
        return;
      }
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <h1>HealthSupp Admin</h1>
        <p className="admin-login-sub">Sign in to manage your store</p>
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email" placeholder="Admin email" required
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password" placeholder="Password" required
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="admin-login-hint">admin@healthsupp.com / Admin123!</p>
      </div>
    </div>
  );
}

