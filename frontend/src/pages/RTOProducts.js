import React, { useState, useEffect } from 'react';
import { Table, Alert, Spinner } from 'react-bootstrap';
import { rtoProductsAPI } from '../services/api';
import styled from 'styled-components';

const Container = styled.div`
  padding: 0.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const HeaderSection = styled.div`
  background: white;
  padding: 0.75rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-bottom: 0.5rem;
`;

const StyledTable = styled(Table)`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  
  thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    th {
      border: none;
      padding: 0.75rem;
      font-weight: 600;
    }
  }
  
  tbody tr {
    transition: all 0.3s ease;
    
    &:hover {
      background: #f8f9fa;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    td {
      padding: 0.5rem;
      vertical-align: middle;
      border: none;
    }
  }
`;

const RTOProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('RTO');

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching products for category:', activeTab);
      // Test: Fetch all RTO products first
      const allResponse = await fetch('http://localhost:5000/api/rto-products');
      const allData = await allResponse.json();
      console.log('All RTO products:', allData);
      
      // Then filter by category
      const response = await fetch(`http://localhost:5000/api/rto-products?category=${activeTab}`);
      const data = await response.json();
      console.log('Filtered API response for', activeTab, ':', data);
      setProducts(data || []);
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to fetch products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <HeaderSection>
        <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>RTO/RPU Products</h2>
        <p style={{ color: '#666', marginBottom: 0 }}>Return To Origin and Returned Product Under Process inventory</p>
      </HeaderSection>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '2px solid #e0e0e0' }}>
        <button 
          style={{
            padding: '0.8rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: '600',
            color: activeTab === 'RTO' ? '#667eea' : '#666',
            borderBottom: activeTab === 'RTO' ? '2px solid #667eea' : 'none'
          }}
          onClick={() => setActiveTab('RTO')}
        >
          📦 RTO Products
        </button>
        <button 
          style={{
            padding: '0.8rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: '600',
            color: activeTab === 'RPU' ? '#667eea' : '#666',
            borderBottom: activeTab === 'RPU' ? '2px solid #667eea' : 'none'
          }}
          onClick={() => setActiveTab('RPU')}
        >
          🔄 RPU Products
        </button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <Alert variant="info">No RTO products found</Alert>
      ) : (
        <StyledTable responsive>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Count</th>
              <th>Unit Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.barcode || product.rtoId || product._id}</td>
                <td>{product.productName}</td>
                <td>{product.quantity}</td>
                <td>₹{product.price?.toFixed(2) || '0.00'}</td>
                <td>₹{(product.quantity * product.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      )}
    </Container>
  );
};

export default RTOProducts;