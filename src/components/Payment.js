import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { orderId, totalAmount } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // UPI State
  const [upiId, setUpiId] = useState('');

  // Debit Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  if (!orderId) {
    return (
      <div className="container">
        <div className="payment-container">
          <h2>No Order Selected</h2>
          <p>Please place an order first.</p>
          <Link to="/cart" className="btn btn-primary">
            Go to Cart
          </Link>
        </div>
      </div>
    );
  }

  const handleUpiPayment = async () => {
    if (!upiId.trim()) {
      setError('Please enter your UPI ID');
      return;
    }

    if (!upiId.includes('@')) {
      setError('Invalid UPI ID format. Example: username@upi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await paymentService.processUpi(orderId, upiId);
      if (result.status === 'Completed') {
        setSuccess(result.message);
        setTimeout(() => navigate('/orders'), 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDebitCardPayment = async () => {
    if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear || !cvv) {
      setError('Please fill in all card details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await paymentService.processDebitCard(orderId, {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolderName,
        expiryMonth,
        expiryYear,
        cvv,
      });

      if (result.status === 'Completed') {
        setSuccess(result.message);
        setTimeout(() => navigate('/orders'), 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Payment</h1>
        <div className="header-actions">
          <span className="welcome-text">Welcome, {user?.username}</span>
          <Link to="/products" className="btn btn-info">
            Products
          </Link>
          <Link to="/orders" className="btn btn-warning">
            My Orders
          </Link>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="payment-container">
        <h2>Complete Your Payment</h2>
        <div className="order-summary">
          <p>
            <strong>Order ID:</strong> #{orderId}
          </p>
          <p className="payment-amount">
            <strong>Amount:</strong> ${totalAmount?.toFixed(2)}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="payment-methods">
          <div className="payment-method-tabs">
            <button
              className={`tab-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('UPI')}
            >
              UPI
            </button>
            <button
              className={`tab-btn ${paymentMethod === 'DebitCard' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('DebitCard')}
            >
              Debit Card
            </button>
          </div>

          {paymentMethod === 'UPI' && (
            <div className="payment-form">
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@upi"
                />
              </div>
              <div className="upi-apps">
                <p>Popular UPI Apps:</p>
                <div className="upi-icons">
                  <span className="upi-icon">GPay</span>
                  <span className="upi-icon">PhonePe</span>
                  <span className="upi-icon">Paytm</span>
                  <span className="upi-icon">BHIM</span>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleUpiPayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay $${totalAmount?.toFixed(2)}`}
              </button>
            </div>
          )}

          {paymentMethod === 'DebitCard' && (
            <div className="payment-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Month</label>
                  <select
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                  >
                    <option value="">MM</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry Year</label>
                  <select
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                  >
                    <option value="">YY</option>
                    {[...Array(10)].map((_, i) => {
                      const year = new Date().getFullYear() % 100 + i;
                      return (
                        <option key={year} value={String(year)}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    maxLength="4"
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleDebitCardPayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay $${totalAmount?.toFixed(2)}`}
              </button>
            </div>
          )}
        </div>

        <div className="payment-security">
          <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
