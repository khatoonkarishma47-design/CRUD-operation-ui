import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getById(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        navigate('/products');
      } catch (err) {
        setError(err.response?.data || 'Failed to delete product');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <Link to="/products" className="btn btn-secondary">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <p>Product not found</p>
        <Link to="/products" className="btn btn-secondary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-detail">
        <h2>{product.name}</h2>
        <div className="detail-section">
          <label>Description:</label>
          <p>{product.description}</p>
        </div>
        <div className="detail-row">
          <div className="detail-section">
            <label>Price:</label>
            <p className="price">${product.price.toFixed(2)}</p>
          </div>
          <div className="detail-section">
            <label>Quantity:</label>
            <p>{product.quantity}</p>
          </div>
        </div>
        <div className="detail-section">
          <label>Created:</label>
          <p>{new Date(product.createdAt).toLocaleString()}</p>
        </div>
        <div className="detail-section">
          <label>Last Updated:</label>
          <p>{new Date(product.updatedAt).toLocaleString()}</p>
        </div>
        <div className="detail-actions">
          <Link to={`/products/edit/${product.id}`} className="btn btn-warning">
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
          <Link to="/products" className="btn btn-secondary">
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
