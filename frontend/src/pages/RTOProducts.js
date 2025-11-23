import React, { useState, useEffect } from 'react';
import { Table, Alert, Form, Button, Row, Col, Card, Spinner, Modal, Badge } from 'react-bootstrap';
import { returnsAPI } from '../services/api';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSync } from 'react-icons/fa';

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

const FilterCard = styled(Card)`
  border: none;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  margin-bottom: 0.5rem;
  
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
  margin-bottom: 0.5rem;
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
    comments: ''
  });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  // Apply filters
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.returnId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.items?.some(item => 
          item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await returnsAPI.getByCategory(activeTab);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch RTO/RPU returns: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this return record?')) {
      try {
        await returnsAPI.delete(id);
        setSuccess('Return record deleted successfully');
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete: ' + err.message);
      }
    }
  };

  const handleUpdate = async (id) => {
    try {
      await returnsAPI.update(id, formData);
      setSuccess('Return record updated successfully');
      setShowModal(false);
      setEditingId(null);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update: ' + err.message);
    }
  };

  const openEditModal = (returnRecord) => {
    setEditingId(returnRecord._id);
    setFormData({
      status: returnRecord.status,
      comments: returnRecord.comments || ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processed':
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
    totalValue: filteredProducts.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
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
      <Row className="mb-1">
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
        <Card.Body style={{ padding: '0.5rem' }}>
          <Row className="g-2">
            <Col md={6}>
              <Form.Group className="mb-1">
                <Form.Label className="mb-1">Search (Product Name, Barcode, ID)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-3"
                  size="sm"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-1">
                <Form.Label className="mb-1">Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-3"
                  size="sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-1">
                <Form.Label className="mb-1">Date Range</Form.Label>
                <div className="d-flex gap-1">
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-3"
                    size="sm"
                  />
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-3"
                    size="sm"
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
              <th>Return ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Return Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(returnRecord => (
              <React.Fragment key={returnRecord._id}>
                <tr>
                  <td>
                    <strong>{returnRecord.returnId}</strong>
                  </td>
                  <td>
                    <div>
                      <strong>{returnRecord.customerName}</strong>
                      {returnRecord.customerPhone && (
                        <div><small>{returnRecord.customerPhone}</small></div>
                      )}
                    </div>
                  </td>
                  <td>{returnRecord.items?.length || 0} items</td>
                  <td>${(returnRecord.totalAmount || 0).toFixed(2)}</td>
                  <td>
                    <Badge bg="secondary">{returnRecord.reason}</Badge>
                  </td>
                  <td>
                    <StatusBadgeStyled bg={getStatusColor(returnRecord.status)}>
                      {returnRecord.status}
                    </StatusBadgeStyled>
                  </td>
                  <td>{new Date(returnRecord.returnDate).toLocaleDateString()}</td>
                  <td>
                    <ActionButtonGroup>
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => openEditModal(returnRecord)}
                        title="Edit"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(returnRecord._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </ActionButtonGroup>
                  </td>
                </tr>
                <tr>
                  <td colSpan="8" style={{ padding: 0, backgroundColor: '#f8f9fa' }}>
                    <div style={{ padding: '0.25rem', margin: '0.1rem' }}>
                      <strong>Items Details:</strong>
                      <Table size="sm" className="mt-2" style={{ marginBottom: 0 }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th>Product ID</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {returnRecord.items?.map((item, idx) => (
                            <tr key={idx}>
                              <td>{typeof item.product === 'object' ? item.product._id : item.product}</td>
                              <td>{item.productName}</td>
                              <td>{item.quantity}</td>
                              <td>${(item.unitPrice || 0).toFixed(2)}</td>
                              <td>${(item.total || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
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
              <option value="processed">Processed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              className="rounded-3"
              placeholder="Add any additional comments..."
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