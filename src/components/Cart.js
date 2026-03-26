import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Cart = ({ cartItems, updateQuantity, removeFromCart, clearCart }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        shippingAddress,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      await orderService.create(orderData);
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <header className="header">
          <h1>Shopping Cart</h1>
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
        <div className="cart-container">
          <p className="empty-cart">Your cart is empty</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Shopping Cart</h1>
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
      <div className="cart-container">

      {error && <div className="error-message">{error}</div>}

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <p className="cart-item-price">${item.price.toFixed(2)}</p>
            </div>
            <div className="cart-item-actions">
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="qty-display">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.maxQuantity}
              >
                +
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
            <div className="cart-item-subtotal">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <strong>Total: ${totalAmount.toFixed(2)}</strong>
        </div>

        <div className="form-group">
          <label>Shipping Address</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your shipping address"
            rows="3"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
      </div>
    </div>
  );
};

export default Cart;
