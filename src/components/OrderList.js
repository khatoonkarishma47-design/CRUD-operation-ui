import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancel(id);
        fetchOrders();
      } catch (err) {
        setError(err.response?.data || 'Failed to cancel order');
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Processing':
        return 'status-processing';
      case 'Shipped':
        return 'status-shipped';
      case 'Delivered':
        return 'status-delivered';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1>My Orders</h1>
        <div className="header-actions">
          <span className="welcome-text">Welcome, {user?.username}</span>
          <Link to="/products" className="btn btn-info">
            Products
          </Link>
          <Link to="/cart" className="btn btn-warning">
            Cart
          </Link>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-list">
        {orders.length === 0 ? (
          <p className="no-orders">No orders found. Start shopping!</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.id}</h3>
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(order.orderDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Shipping:</strong> {order.shippingAddress}
                </p>
              </div>
              <div className="order-items">
                <strong>Items:</strong>
                <ul>
                  {order.orderItems.map((item) => (
                    <li key={item.id}>
                      {item.product?.name || 'Product'} x {item.quantity} @ $
                      {item.unitPrice.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-actions">
                {(order.status === 'Pending' || order.status === 'Processing') && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderList;
