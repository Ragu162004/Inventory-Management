import React, { useState, useEffect } from 'react';
import { Table, Alert, Form, Button, Row, Col, Card, Spinner, Modal, Badge } from 'react-bootstrap';
import { rtoProductsAPI } from '../services/api';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSync } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const HeaderSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const FilterCard = styled(Card)`
  border: none;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  
  .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px 15px 0 0;
    border: none;
    font-weight: 600;
  }
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
      padding: 1.2rem;
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
      padding: 1rem;
      vertical-align: middle;
      border: none;
    }
  }
`;

const StatCard = styled(Card)`
  border: none;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  background: white;
  
  .card-body {
    padding: 1.5rem;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #667eea;
  }
  
  .stat-label {
    color: #666;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  
  .tab-btn {
    padding: 0.8rem 1.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 600;
    color: #666;
    position: relative;
    transition: all 0.3s ease;
    
    &.active {
      color: #667eea;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #667eea;
      }
    }
    
    &:hover {
      color: #667eea;
    }
  }
`;

const StatusBadgeStyled = styled(Badge)`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  
  button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  }
`;

const RTOProducts = () => {
  const [activeTab, setActiveTab] = useState('RTO');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    status: 'pending',
    quantity: '',
    notes: ''
  });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  // Apply filters
  useEffect(() => {
    let filtered = products.filter(p => p.category === activeTab);

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.rtoId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter, activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await rtoProductsAPI.getAll({
        category: activeTab,
        startDate,
        endDate
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch RTO/RPU products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await rtoProductsAPI.delete(id);
        setSuccess('Record deleted successfully');
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete: ' + err.message);
      }
    }
  };

  const handleUpdate = async (id) => {
    try {
      await rtoProductsAPI.update(id, formData);
      setSuccess('Record updated successfully');
      setShowModal(false);
      setEditingId(null);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update: ' + err.message);
    }
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      status: product.status,
      quantity: product.quantity,
      notes: product.notes || ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const stats = {
    total: filteredProducts.length,
    completed: filteredProducts.filter(p => p.status === 'completed').length,
    totalValue: filteredProducts.reduce((sum, p) => sum + p.totalValue, 0)
  };

  return (
    <Container>
      <HeaderSection>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>RTO/RPU Product Tracking</h2>
            <p style={{ color: '#666', marginBottom: 0 }}>Manage Return To Origin and Returned Product Under Process items</p>
          </div>
          <Button 
            variant="primary" 
            onClick={fetchProducts}
            className="d-flex align-items-center gap-2"
          >
            <FaSync /> Refresh
          </Button>
        </div>
      </HeaderSection>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Tab Navigation */}
      <TabContainer>
        <button 
          className={`tab-btn ${activeTab === 'RTO' ? 'active' : ''}`}
          onClick={() => setActiveTab('RTO')}
        >
          📦 Return To Origin (RTO)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'RPU' ? 'active' : ''}`}
          onClick={() => setActiveTab('RPU')}
        >
          🔄 Returned Product Under Process (RPU)
        </button>
      </TabContainer>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <StatCard>
            <Card.Body>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Items</div>
            </Card.Body>
          </StatCard>
        </Col>
        <Col md={4}>
          <StatCard>
            <Card.Body>
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </Card.Body>
          </StatCard>
        </Col>
        <Col md={4}>
          <StatCard>
            <Card.Body>
              <div className="stat-value">${stats.totalValue.toFixed(2)}</div>
              <div className="stat-label">Total Value</div>
            </Card.Body>
          </StatCard>
        </Col>
      </Row>

      {/* Filter Card */}
      <FilterCard>
        <Card.Header>🔍 Search & Filter</Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search (Product Name, Barcode, ID)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-3"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date Range</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-3"
                  />
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-3"
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </FilterCard>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Alert variant="info">No products found matching your filters</Alert>
      ) : (
        <StyledTable responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Barcode</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id}>
                <td>
                  <strong>{product.rtoId}</strong>
                </td>
                <td>{product.productName}</td>
                <td>{product.barcode || '-'}</td>
                <td>{product.quantity}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>${product.totalValue.toFixed(2)}</td>
                <td>
                  <StatusBadgeStyled bg={getStatusColor(product.status)}>
                    {product.status}
                  </StatusBadgeStyled>
                </td>
                <td>{new Date(product.dateAdded).toLocaleDateString()}</td>
                <td>
                  <ActionButtonGroup>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => openEditModal(product)}
                      title="Edit"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(product._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </Button>
                  </ActionButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      )}

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="rounded-3"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="rounded-3"
              min="1"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-3"
              placeholder="Add any additional notes..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleUpdate(editingId)}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RTOProducts;