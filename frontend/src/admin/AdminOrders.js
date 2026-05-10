import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const STATUS_COLORS = {
  pending: '#ff9800', confirmed: '#2196f3',
  shipped: '#9c27b0', delivered: '#4caf50', cancelled: '#f44336'
};

export default function AdminOrders({ token, onStatsChange }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const sseRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    connectSSE();
    return () => sseRef.current?.close();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  };

  const connectSSE = () => {
    // SSE requires the token in the URL as query param since EventSource doesn't support headers
    const es = new EventSource(`${API_URL}/api/admin/events?token=${token}`);
    sseRef.current = es;

    es.addEventListener('new_order', (e) => {
      const order = JSON.parse(e.data);
      setOrders(prev => [order, ...prev]);
      setNotification(`New order ${order.id} from ${order.customerName}`);
      onStatsChange();
      setTimeout(() => setNotification(''), 5000);
    });

    es.addEventListener('order_updated', (e) => {
      const { id, status } = JSON.parse(e.data);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    });
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      onStatsChange();
    } catch {
      alert('Failed to update order status.');
    }
  };

  if (loading) return <div className="admin-loading">Loading orders...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Orders</h2>
        <span className="admin-live-badge">Live</span>
      </div>

      {notification && (
        <div className="admin-notification">{notification}</div>
      )}

      {orders.length === 0 ? (
        <div className="admin-empty">No orders yet. Place an order from the customer app to see it here in real time.</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <React.Fragment key={order.id}>
                  <tr
                    className={expandedOrder === order.id ? 'expanded-row' : ''}
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <td><code>{order.id}</code></td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <br /><small>{order.customerEmail}</small>
                    </td>
                    <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                    <td><strong>${order.total.toFixed(2)}</strong></td>
                    <td>{new Date(order.placedAt).toLocaleDateString()}</td>
                    <td>
                      <span className="status-badge" style={{ background: STATUS_COLORS[order.status] }}>
                        {order.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr className="order-detail-row">
                      <td colSpan={7}>
                        <div className="order-detail">
                          <div>
                            <strong>Items:</strong>
                            <ul>
                              {order.items.map(item => (
                                <li key={item.id}>{item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Shipping to:</strong>
                            <p>{order.shippingAddress?.address}, {order.shippingAddress?.city} {order.shippingAddress?.zipCode}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

