import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        setError(err.response?.data || 'Failed to delete product');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Product Management</h1>
        <div className="header-actions">
          <span className="welcome-text">Welcome, {user?.username}</span>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="actions-bar">
        <Link to="/products/new" className="btn btn-primary">
          Add New Product
        </Link>
      </div>

      <div className="product-grid">
        {products.length === 0 ? (
          <p className="no-products">No products found.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="description">{product.description}</p>
              <div className="product-details">
                <span className="price">${product.price.toFixed(2)}</span>
                <span className="quantity">Qty: {product.quantity}</span>
              </div>
              <div className="product-actions">
                <Link to={`/products/${product.id}`} className="btn btn-info">
                  View
                </Link>
                <Link to={`/products/edit/${product.id}`} className="btn btn-warning">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
