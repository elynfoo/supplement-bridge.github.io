import React, { useState } from 'react';
import './Checkout.css';

export default function Checkout({ cartItems, user, onSubmit, loading, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '4111111111111111',
    expiryDate: '12/25',
    cvv: '123'
  });

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="checkout-form">
          <h2>Checkout</h2>
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Shipping Information</legend>
              <div className="form-row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Street Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <div className="form-row">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>Payment Method (Demo)</legend>
              <div className="payment-method-tabs">
                <button
                  type="button"
                  className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  className={`payment-tab ${paymentMethod === 'paynow' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('paynow')}
                >
                  PayNow
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="payment-card-fields">
                  <p className="demo-notice">Demo mode — card pre-filled with test credentials</p>
                  <input type="text" name="cardNumber" placeholder="Card Number" value={formData.cardNumber} disabled />
                  <div className="form-row">
                    <input type="text" name="expiryDate" placeholder="MM/YY" value={formData.expiryDate} disabled />
                    <input type="text" name="cvv" placeholder="CVV" value={formData.cvv} disabled />
                  </div>
                </div>
              )}

              {paymentMethod === 'paynow' && (
                <div className="paynow-section">
                  <p className="demo-notice">Demo mode — PayNow payment is simulated</p>
                  <div className="paynow-qr">
                    <div className="paynow-qr-mock">
                      <div className="qr-grid">
                        {Array.from({length: 49}).map((_, i) => (
                          <div key={i} className={`qr-cell ${Math.random() > 0.5 ? 'filled' : ''}`} />
                        ))}
                      </div>
                      <p className="qr-label">Scan with your banking app</p>
                    </div>
                    <div className="paynow-details">
                      <p><strong>UEN:</strong> 202512345A</p>
                      <p><strong>Name:</strong> HealthSupp Pte Ltd</p>
                      <p><strong>Amount:</strong> ${cartItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</p>
                      <p><strong>Reference:</strong> HS-{Date.now().toString().slice(-6)}</p>
                      <p className="paynow-note">Payment will be confirmed automatically in demo mode.</p>
                    </div>
                  </div>
                </div>
              )}
            </fieldset>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
                ← Back to Cart
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Processing...' : `Place Order ($${total.toFixed(2)})`}
              </button>
            </div>
          </form>
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
