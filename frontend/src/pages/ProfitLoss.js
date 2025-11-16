import React, { useState } from 'react';
import { Table, Alert, Form, Button, Row, Col, Card, Spinner, Modal } from 'react-bootstrap';
import { profitLossAPI } from '../services/api';
import styled, { keyframes } from 'styled-components';
import { FaUpload, FaDownload, FaChartLine, FaCheck, FaTimes, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

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

const GraphCard = styled(Card)`
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
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const LoadingSpinner = styled(Spinner)`
  color: #667eea;
  width: 3rem;
  height: 3rem;
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
`;

const ProfitBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  color: ${props => props.profit >= 0 ? '#fff' : '#fff'};
  background: ${props => props.profit >= 0 ? '#48bb78' : '#e53e3e'};
`;

const ProfitLoss = () => {
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [profitData, setProfitData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const fetchProfitLoss = async () => {
    // Validation
    if (!filter.startDate || !filter.endDate) {
      setError('Please select both Start Date and End Date');
      return;
    }

    if (new Date(filter.startDate) > new Date(filter.endDate)) {
      setError('Start Date must be before End Date');
      return;
    }

    setLoading(true);
    try {
      const response = await profitLossAPI.getProfitLoss(filter.startDate, filter.endDate);
      setProfitData(response.data.profitData || []);
      setMonthlyData(response.data.monthlyChartData || []);
      setSummary(response.data.summary || null);
      setError('');
    } catch (error) {
      setError('Failed to fetch profit/loss data: ' + error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['.xlsx', '.xls', '.csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (!allowedTypes.includes(file.type) && !allowedTypes.includes(`.${fileExtension}`)) {
      setError('Invalid file format. Please upload an Excel file (.xlsx, .xls) or CSV file.');
      e.target.value = ''; // Clear input
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size too large. Maximum allowed size is 5MB.');
      e.target.value = ''; // Clear input
      return;
    }

    setLoading(true);
    try {
      const response = await profitLossAPI.uploadExcel(file);
      setUploadResults(response.data.results || []);
      setSummary(response.data.summary || null);
      setShowModal(true);
      setError('');
      e.target.value = ''; // Clear input after successful upload
    } catch (error) {
      setError('Failed to upload file: ' + (error.response?.data?.message || error.message));
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilter({
      startDate: '',
      endDate: ''
    });
    setProfitData([]);
    setMonthlyData([]);
    setSummary(null);
  };

  const downloadExcelTemplate = () => {
    try {
      // Create template data
      const templateData = [
        {
          'PaymentDate': '2024-01-15',
          'ComboID': 'COMBO-001',
          'SoldPrice': 150,
          'Quantity': 2,
          'Status': 'Delivered'
        },
        {
          'PaymentDate': '2024-01-20',
          'ComboID': 'COMBO-002',
          'SoldPrice': 200,
          'Quantity': 1,
          'Status': 'RPU'
        },
        {
          'PaymentDate': '2024-01-25',
          'ComboID': 'COMBO-003',
          'SoldPrice': 180,
          'Quantity': 3,
          'Status': 'Delivered'
        }
      ];

      // Create instructions sheet
      const instructionsData = [
        { 'Field': 'PaymentDate', 'Format': 'YYYY-MM-DD', 'Example': '2024-01-15', 'Required': 'Yes' },
        { 'Field': 'ComboID', 'Format': 'Text (exact combo ID from system)', 'Example': 'COMBO-001', 'Required': 'Yes' },
        { 'Field': 'SoldPrice', 'Format': 'Number (must be positive)', 'Example': '150', 'Required': 'Yes' },
        { 'Field': 'Quantity', 'Format': 'Number (must be positive)', 'Example': '2', 'Required': 'Yes' },
        { 'Field': 'Status', 'Format': 'Delivered or RPU', 'Example': 'Delivered', 'Required': 'Yes' }
      ];

      // Create workbook with multiple sheets
      const worksheet1 = XLSX.utils.json_to_sheet(templateData);
      const worksheet2 = XLSX.utils.json_to_sheet(instructionsData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet1, 'Data Template');
      XLSX.utils.book_append_sheet(workbook, worksheet2, 'Instructions');

      // Auto-adjust column widths
      const colWidths = [
        { wch: 15 }, // PaymentDate
        { wch: 15 }, // ComboID
        { wch: 12 }, // SoldPrice
        { wch: 10 }, // Quantity
        { wch: 12 }  // Status
      ];
      worksheet1['!cols'] = colWidths;

      XLSX.writeFile(workbook, 'profit_loss_template.xlsx');
      setError('');
    } catch (error) {
      setError('Failed to download template: ' + error.message);
    }
  };

  const exportToExcel = (data, filename = 'profit_loss_report.xlsx') => {
    if (!data || data.length === 0) {
      setError('No data to export');
      return;
    }

    try {
      // Transform data for export
      const exportData = data.map(item => ({
        'Combo ID': item.comboId || '',
        'Products': item.productNames || item.comboName || '',
        'Original Cost Price': item.costPrice?.toFixed(2) || '',
        'Sold Price': item.soldPrice?.toFixed(2) || '',
        'Quantity': item.quantity || '',
        'Profit/Loss': item.profitTotal?.toFixed(2) || '',
        'Status': item.status?.toUpperCase() || 'ERROR',
        'Date': item.date ? new Date(item.date).toLocaleDateString() : '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Profit Loss');

      // Add summary sheet if available
      if (summary) {
        const summaryData = [
          { Metric: 'Total Profit/Loss', Amount: summary.totalProfit?.toFixed(2) || 0 },
          { Metric: 'Delivered Profit', Amount: summary.deliveredProfit?.toFixed(2) || 0 },
          { Metric: 'RPU Loss', Amount: summary.rpuProfit?.toFixed(2) || 0 },
          { Metric: 'Total Records', Amount: summary.totalRecords || 0 },
        ];
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      }

      XLSX.writeFile(workbook, filename);
      setError('');
    } catch (error) {
      setError('Failed to export to Excel: ' + error.message);
    }
  };

  const exportToPDF = (data, filename = 'profit_loss_report.pdf') => {
    if (!data || data.length === 0) {
      setError('No data to export');
      return;
    }

    try {
      // Create a table HTML
      let html = `
        <html>
          <head>
            <title>Profit & Loss Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #667eea; color: white; padding: 10px; text-align: left; }
              td { padding: 8px; border-bottom: 1px solid #ddd; }
              tr:hover { background-color: #f5f5f5; }
              .summary { margin-top: 30px; }
              .profit { color: #48bb78; font-weight: bold; }
              .loss { color: #e53e3e; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Profit & Loss Analysis Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
      `;

      // Add summary
      if (summary) {
        html += `
          <div class="summary">
            <h2>Summary</h2>
            <table>
              <tr>
                <th>Metric</th>
                <th>Amount</th>
              </tr>
              <tr>
                <td>Total Profit/Loss</td>
                <td class="${summary.totalProfit >= 0 ? 'profit' : 'loss'}">$${summary.totalProfit?.toFixed(2) || 0}</td>
              </tr>
              <tr>
                <td>Delivered Profit</td>
                <td class="profit">$${summary.deliveredProfit?.toFixed(2) || 0}</td>
              </tr>
              <tr>
                <td>RPU Loss</td>
                <td class="loss">$${summary.rpuProfit?.toFixed(2) || 0}</td>
              </tr>
              <tr>
                <td>Total Records</td>
                <td>${summary.totalRecords || 0}</td>
              </tr>
            </table>
          </div>
        `;
      }

      // Add data table
      html += `
        <h2>Detailed Records</h2>
        <table>
          <tr>
            <th>Combo ID</th>
            <th>Products</th>
            <th>Original Cost Price</th>
            <th>Sold Price</th>
            <th>Quantity</th>
            <th>Profit/Loss</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
      `;

      data.forEach(item => {
        const profitClass = item.profitTotal >= 0 ? 'profit' : 'loss';
        html += `
          <tr>
            <td>${item.comboId || ''}</td>
            <td>${item.productNames || item.comboName || ''}</td>
            <td>$${item.costPrice?.toFixed(2) || ''}</td>
            <td>$${item.soldPrice?.toFixed(2) || ''}</td>
            <td>${item.quantity || ''}</td>
            <td class="${profitClass}">$${item.profitTotal?.toFixed(2) || ''}</td>
            <td>${item.status?.toUpperCase() || 'ERROR'}</td>
            <td>${item.date ? new Date(item.date).toLocaleDateString() : ''}</td>
          </tr>
        `;
      });

      html += `
          </table>
          </body>
        </html>
      `;

      // Create a blob and download
      const element = document.createElement('a');
      const file = new Blob([html], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = filename.replace('.pdf', '.html');
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setError('PDF exported as HTML file. To save as PDF, use your browser\'s Print to PDF feature.');
    } catch (error) {
      setError('Failed to export to PDF: ' + error.message);
    }
  };

  return (
    <Container>
      <AnimatedContainer>
        <HeaderSection>
          <Row>
            <Col>
              <h4 className="mb-0 d-flex align-items-center">
                <IconWrapper style={{ fontSize: "1.3rem", marginRight: "0.6rem" }}>💹</IconWrapper>
                Profit & Loss Analysis
              </h4>
            </Col>
          </Row>
        </HeaderSection>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics */}
        {summary && (
          <StatsGrid>
            <StatCard>
              <Card.Title>💰 Total Profit/Loss</Card.Title>
              <Card.Text style={{ color: summary.totalProfit >= 0 ? '#48bb78' : '#e53e3e' }}>
                ${summary.totalProfit.toFixed(2)}
              </Card.Text>
            </StatCard>
            <StatCard>
              <Card.Title>✅ Delivered Profit</Card.Title>
              <Card.Text style={{ color: '#48bb78' }}>
                ${summary.deliveredProfit.toFixed(2)}
              </Card.Text>
            </StatCard>
            <StatCard>
              <Card.Title>🔄 RPU Loss</Card.Title>
              <Card.Text style={{ color: '#e53e3e' }}>
                ${summary.rpuProfit.toFixed(2)}
              </Card.Text>
            </StatCard>
            <StatCard>
              <Card.Title>📊 Total Records</Card.Title>
              <Card.Text>{summary.totalRecords}</Card.Text>
            </StatCard>
          </StatsGrid>
        )}

        {/* Filter Section */}
        <FilterCard>
          <Card.Header>
            <IconWrapper>🔍</IconWrapper>
            Date Range Filter
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
                  <PrimaryButton onClick={fetchProfitLoss} className="w-100">
                    <FaChartLine /> Fetch Data
                  </PrimaryButton>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <SecondaryButton onClick={clearFilters} className="w-100">
                    🗑️ Clear
                  </SecondaryButton>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </FilterCard>

        {/* Excel Upload Section */}
        <FilterCard>
          <Card.Header>
            <IconWrapper>📁</IconWrapper>
            Upload Excel File
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Form.Label>Choose Excel File</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Columns: PaymentDate, ComboID, SoldPrice, Quantity, Status
                  </Form.Text>
                </FormGroup>
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <SecondaryButton onClick={downloadExcelTemplate} className="w-100">
                  <FaDownload /> Download Template
                </SecondaryButton>
              </Col>
            </Row>
          </Card.Body>
        </FilterCard>

        {/* Monthly Profit Chart */}
        {monthlyData.length > 0 && (
          <GraphCard>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                <IconWrapper>📈</IconWrapper>
                Monthly Profit Trend
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button 
                  size="sm" 
                  variant="outline-primary"
                  onClick={() => exportToExcel(monthlyData, 'monthly_profit_report.xlsx')}
                  title="Export to Excel"
                >
                  <FaFileExcel /> Excel
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-danger"
                  onClick={() => exportToPDF(monthlyData, 'monthly_profit_report.pdf')}
                  title="Export to PDF"
                >
                  <FaFilePdf /> PDF
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <LoadingSpinner animation="border" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `$${value.toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: '#f5f7fa',
                        border: '2px solid #667eea',
                        borderRadius: '10px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="totalProfit" stroke="#667eea" name="Total Profit" strokeWidth={2} />
                    <Line type="monotone" dataKey="deliveredProfit" stroke="#48bb78" name="Delivered Profit" strokeWidth={2} />
                    <Line type="monotone" dataKey="rpuProfit" stroke="#e53e3e" name="RPU Loss" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </GraphCard>
        )}

        {/* Profit/Loss Data Table */}
        {profitData.length > 0 && (
          <GraphCard>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                <IconWrapper>📊</IconWrapper>
                Profit/Loss Breakdown
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button 
                  size="sm" 
                  variant="outline-primary"
                  onClick={() => exportToExcel(profitData, 'profit_loss_database_report.xlsx')}
                  title="Export to Excel"
                >
                  <FaFileExcel /> Excel
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-danger"
                  onClick={() => exportToPDF(profitData, 'profit_loss_database_report.pdf')}
                  title="Export to PDF"
                >
                  <FaFilePdf /> PDF
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <StyledTable responsive>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product/Combo</th>
                      <th>Cost Price</th>
                      <th>Sold Price</th>
                      <th>Quantity</th>
                      <th>Profit/Loss</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitData.slice(0, 20).map((item, index) => (
                      <tr key={index}>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td>{item.product}</td>
                        <td>${item.costPrice.toFixed(2)}</td>
                        <td>${item.soldPrice.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>
                          <ProfitBadge profit={item.profitTotal}>
                            ${item.profitTotal.toFixed(2)}
                          </ProfitBadge>
                        </td>
                        <td>
                          {item.status === 'rpu' ? (
                            <span style={{ color: '#e53e3e' }}>🔄 RPU</span>
                          ) : (
                            <span style={{ color: '#48bb78' }}>✅ Delivered</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center', color: '#666' }}>
                Showing {profitData.slice(0, 20).length} of {profitData.length} records
              </div>
            </Card.Body>
          </GraphCard>
        )}

        {/* Upload Results Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>📊 Upload Results & Export</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {summary && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                <Row>
                  <Col md={3}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total Profit/Loss</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: summary.totalProfit >= 0 ? '#48bb78' : '#e53e3e' }}>
                      ${summary.totalProfit?.toFixed(2) || 0}
                    </p>
                  </Col>
                  <Col md={3}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Delivered Profit</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#48bb78' }}>
                      ${summary.deliveredProfit?.toFixed(2) || 0}
                    </p>
                  </Col>
                  <Col md={3}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>RPU Loss</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#e53e3e' }}>
                      ${summary.rpuProfit?.toFixed(2) || 0}
                    </p>
                  </Col>
                  <Col md={3}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total Records</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                      {summary.totalRecords || 0}
                    </p>
                  </Col>
                </Row>
              </div>
            )}
            
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <StyledTable responsive striped>
                <thead>
                  <tr>
                    <th>Combo ID</th>
                    <th>Product(s)</th>
                    <th>Original Cost</th>
                    <th>Sold Price</th>
                    <th>Qty</th>
                    <th>Profit/Loss</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResults.map((result, index) => (
                    <tr key={index} style={{ opacity: result.status === 'Error' ? 0.6 : 1 }}>
                      <td>
                        <strong>{result.comboId}</strong>
                        {result.rowNumber && (
                          <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                            Row {result.rowNumber}
                          </div>
                        )}
                      </td>
                      <td>
                        {result.status === 'Error' ? (
                          <div>
                            <div style={{ color: '#e53e3e', fontWeight: '500' }}>{result.message || 'N/A'}</div>
                            {result.rowNumber && (
                              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                                Check row {result.rowNumber} in your file
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: '500' }}>{result.comboName}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                              {result.productNames || result.products?.map(p => p.productName).join(', ') || 'N/A'}
                            </div>
                          </div>
                        )}
                      </td>
                      <td>{result.costPrice ? `$${result.costPrice.toFixed(2)}` : '-'}</td>
                      <td>{result.soldPrice ? `$${result.soldPrice.toFixed(2)}` : '-'}</td>
                      <td>{result.quantity || '-'}</td>
                      <td>
                        {result.profitTotal !== undefined ? (
                          <ProfitBadge profit={result.profitTotal}>
                            ${result.profitTotal.toFixed(2)}
                          </ProfitBadge>
                        ) : (
                          <span style={{ color: '#e53e3e' }}>Error</span>
                        )}
                      </td>
                      <td>
                        {result.status === 'Error' ? (
                          <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>❌ Error</span>
                        ) : result.status === 'rpu' ? (
                          <span style={{ color: '#e53e3e' }}>🔄 RPU</span>
                        ) : (
                          <span style={{ color: '#48bb78' }}>✅ Delivered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="outline-primary" 
              onClick={() => exportToExcel(uploadResults, 'profit_loss_upload_report.xlsx')}
            >
              <FaFileExcel /> Export to Excel
            </Button>
            <Button 
              variant="outline-danger" 
              onClick={() => exportToPDF(uploadResults, 'profit_loss_upload_report.pdf')}
            >
              <FaFilePdf /> Export to PDF
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Loading State */}
        {loading && profitData.length === 0 && uploadResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <LoadingSpinner animation="border" />
            <p>Processing...</p>
          </div>
        )}
      </AnimatedContainer>
    </Container>
  );
};

export default ProfitLoss;