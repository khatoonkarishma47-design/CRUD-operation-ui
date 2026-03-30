import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productService } from '../services/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const product = await productService.getById(id);
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            quantity: product.quantity.toString(),
          });
        } catch (err) {
          setError('Failed to fetch product');
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
    };

    try {
      if (isEdit) {
        await productService.update(id, productData);
      } else {
        await productService.create(productData);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data || `Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter product description"
              rows="4"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            <Link to="/products" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
