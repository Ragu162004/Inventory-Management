import React, { useState, useEffect } from 'react';
import { Table, Alert, Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { purchasesAPI, salesAPI } from '../services/api';
import styled, { keyframes, css } from 'styled-components';
import { FaFilter, FaDownload, FaChartLine, FaShoppingCart, FaDollarSign } from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const AnimatedContainer = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderSection = styled.div`
  background: white;
  height: 100px;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  animation: ${slideIn} 0.5s ease-out;
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
      font-weight: 500;
    }
  }
  
  tbody tr {
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    td {
      padding: 1.2rem;
      border-color: #e9ecef;
    }
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  padding: 0.8rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  }
`;

const SecondaryButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  transition: all 0.3s ease;
  border: 2px solid #667eea;
  color: #667eea;
  background: transparent;
  
  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1rem;
  
  .form-label {
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
  
  .form-control {
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    padding: 0.8rem;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
  }
`;

const TotalCard = styled(Card)`
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin: 1.5rem 0;
  animation: ${pulse} 2s infinite;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
`;

const ReportSection = styled.div`
  margin: 2rem 0;
  animation: ${fadeIn} 0.6s ease-out;
`;

const LoadingSpinner = styled(Spinner)`
  color: #667eea;
  width: 3rem;
  height: 3rem;
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  border: none;
  border-radius: 15px;
  text-align: center;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  }
  
  .card-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #4a5568;
  }
  
  .card-text {
    font-size: 1.8rem;
    font-weight: 700;
    color: #667eea;
  }
`;

const TableRow = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  td {
    padding: 1.2rem;
    border-color: #e9ecef;
  }
`;

const Reports = () => {
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purchasesRes, salesRes] = await Promise.all([
        purchasesAPI.getAll(),
        salesAPI.getAll()
      ]);
      setPurchases(purchasesRes.data);
      setSales(salesRes.data);
    } catch (error) {
      setError('Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilter({
      startDate: '',
      endDate: ''
    });
  };

  const filteredPurchases = purchases.filter(p => {
    const date = new Date(p.purchaseDate);
    const start = filter.startDate ? new Date(filter.startDate) : null;
    const end = filter.endDate ? new Date(filter.endDate) : null;
    return (!start || date >= start) && (!end || date <= end);
  });

  const filteredSales = sales.filter(s => {
    const date = new Date(s.saleDate);
    const start = filter.startDate ? new Date(filter.startDate) : null;
    const end = filter.endDate ? new Date(filter.endDate) : null;
    return (!start || date >= start) && (!end || date <= end);
  });

  const calculateTotals = (items) => {
    return items.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const calculateProfit = () => {
    const totalSales = calculateTotals(filteredSales);
    const totalPurchases = calculateTotals(filteredPurchases);
    return totalSales - totalPurchases;
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && purchases.length === 0 && sales.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center">
        <LoadingSpinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      <AnimatedContainer>
        <HeaderSection>
                  <Row className="">
                    <Col>
                      <h4 className="mb-0 d-flex align-items-center">
                        <IconWrapper style={{ fontSize: "1.3rem", marginRight: "0.6rem" }}>🛒</IconWrapper>
                        Financial Reports
                      </h4>
                    </Col>
                  </Row>
                </HeaderSection>
        
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {/* Statistics Overview */}
        <StatsGrid>
          <StatCard>
            <Card.Title>📈 Total Sales</Card.Title>
            <Card.Text>${calculateTotals(filteredSales).toFixed(2)}</Card.Text>
          </StatCard>
          <StatCard>
            <Card.Title>🛒 Total Purchases</Card.Title>
            <Card.Text>${calculateTotals(filteredPurchases).toFixed(2)}</Card.Text>
          </StatCard>
          <StatCard>
            <Card.Title>💰 Net Profit</Card.Title>
            <Card.Text style={{ color: calculateProfit() >= 0 ? '#48bb78' : '#e53e3e' }}>
              ${calculateProfit().toFixed(2)}
            </Card.Text>
          </StatCard>
          <StatCard>
            <Card.Title>📅 Date Range</Card.Title>
            <Card.Text>
              {filter.startDate || 'Start'} - {filter.endDate || 'End'}
            </Card.Text>
          </StatCard>
        </StatsGrid>

        {/* Filter Section */}
        <FilterCard>
          <Card.Header>
            <IconWrapper>🔍</IconWrapper>
            Filter Reports
          </Card.Header>
          <Card.Body>
            <Form>
              <Row>
                <Col md={3}>
                  <FormGroup>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={filter.startDate}
                      onChange={handleFilterChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={filter.endDate}
                      onChange={handleFilterChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <SecondaryButton onClick={clearFilters} className="w-100">
                    🗑️ Clear Filters
                  </SecondaryButton>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <PrimaryButton 
                    onClick={() => exportToCSV([...filteredPurchases, ...filteredSales], 'financial_report')}
                    className="w-100"
                  >
                    📥 Export CSV
                  </PrimaryButton>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </FilterCard>

        {/* Purchases Report */}
        <ReportSection>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>
              <IconWrapper>🛒</IconWrapper>
              Purchases Report
            </h4>
            <SecondaryButton 
              size="sm" 
              onClick={() => exportToCSV(filteredPurchases, 'purchases_report')}
            >
              📥 Export
            </SecondaryButton>
          </div>
          
          <StyledTable responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase, index) => (
                <TableRow key={purchase._id}>
                  <td><strong>{purchase.purchaseId}</strong></td>
                  <td>{purchase.vendor?.name}</td>
                  <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                  <td>${purchase.totalAmount.toFixed(2)}</td>
                </TableRow>
              ))}
            </tbody>
          </StyledTable>
          
          <TotalCard>
            <h5>Total Purchases: ${calculateTotals(filteredPurchases).toFixed(2)}</h5>
          </TotalCard>
        </ReportSection>

        {/* Sales Report */}
        <ReportSection>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>
              <IconWrapper>💰</IconWrapper>
              Sales Report
            </h4>
            <SecondaryButton 
              size="sm" 
              onClick={() => exportToCSV(filteredSales, 'sales_report')}
            >
              📥 Export
            </SecondaryButton>
          </div>
          
          <StyledTable responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Buyer</th>
                <th>Date</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, index) => (
                <TableRow key={sale._id}>
                  <td><strong>{sale.saleId}</strong></td>
                  <td>{sale.buyer?.name}</td>
                  <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                  <td>${sale.totalAmount.toFixed(2)}</td>
                </TableRow>
              ))}
            </tbody>
          </StyledTable>
          
          <TotalCard>
            <h5>Total Sales: ${calculateTotals(filteredSales).toFixed(2)}</h5>
          </TotalCard>
        </ReportSection>

        {/* Summary Section */}
        <ReportSection>
          <TotalCard style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}>
            <h4>Financial Summary</h4>
            <Row>
              <Col md={4}>
                <h6>Total Purchases</h6>
                <p>${calculateTotals(filteredPurchases).toFixed(2)}</p>
              </Col>
              <Col md={4}>
                <h6>Total Sales</h6>
                <p>${calculateTotals(filteredSales).toFixed(2)}</p>
              </Col>
              <Col md={4}>
                <h6>Net Profit</h6>
                <p style={{ color: calculateProfit() >= 0 ? '#ffffff' : '#fed7d7' }}>
                  ${calculateProfit().toFixed(2)}
                </p>
              </Col>
            </Row>
          </TotalCard>
        </ReportSection>
      </AnimatedContainer>
    </Container>
  );
};

export default Reports;