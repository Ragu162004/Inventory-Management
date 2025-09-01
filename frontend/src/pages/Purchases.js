import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Alert, Row, Col, ListGroup, Card, Spinner } from 'react-bootstrap';
import { purchasesAPI, vendorsAPI, productsAPI } from '../services/api';
import { jsPDF } from "jspdf";
import styled, { keyframes, css } from 'styled-components';

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

const StyledTable = styled(Table)`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  
  thead {
    background: linear-gradient(to right, #3498db);
    color: white;
    
    th {
        background: linear-gradient(to right, #3498db);
      border: none;
      padding: 1.2rem;
      font-weight: 500;
    }
  }
  
  tbody tr {
    transition: all 0.3s ease;
    
    &:hover {
    background: linear-gradient(to right, #3498db);
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
    background: linear-gradient(to right, #3498db);
  border: none;
  border-radius: 25px;
  padding: 0.8rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    background: linear-gradient(to right, #3498db, #2ecc71);
  }
  
  &:active {
    transform: translateY(0);
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

const SuccessButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  transition: all 0.3s ease;
  border: 2px solid #48bb78;
  color: #48bb78;
  background: transparent;
  
  &:hover {
    background: #48bb78;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
  }
`;

const DangerButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    animation: ${pulse} 0.6s ease;
  }
`;

const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  
  .modal-header {
    background: linear-gradient(to right, #3498db, #2ecc71);
    color: white;
    border-radius: 20px 20px 0 0;
    border: none;
    
    .btn-close {
      filter: invert(1);
    }
  }
`;

const BarcodeCard = styled(Card)`
  border: none;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  }
  
  .card-body {
    padding: 1.5rem;
  }
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1.5rem;
  
  .form-label {
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
  
  .form-control, .form-select {
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

const ItemList = styled(ListGroup)`
  .list-group-item {
    border-radius: 10px;
    margin-bottom: 0.5rem;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    
    &:hover {
      background: #f7fafc;
      transform: translateX(5px);
    }
  }
`;

const TotalDisplay = styled.h5`
    background: linear-gradient(to right, #3498db);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 15px;
  text-align: center;

`;

const LoadingSpinner = styled(Spinner)`
  color: #667eea;
  width: 3rem;
  height: 3rem;
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
  font-weight: bold;
`;

// Fixed animation application for table rows
const TableRow = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(to right, #3498db, #2ecc71);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  td {
    padding: 1.2rem;
    border-color: #e9ecef;
  }
`;

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBarcodesModal, setShowBarcodesModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    items: []
  });
  const [currentItem, setCurrentItem] = useState({
    product: '',
    quantity: 1,
    unitCost: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPurchases(), fetchVendors(), fetchProducts()]);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const downloadAllBarcodesPDF = () => {
    if (!barcodes.length) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = 100;
    const imgHeight = 50;
    const marginY = 40;

    let y = 40;

    barcodes.forEach((barcode, index) => {
      const x = (pageWidth - imgWidth) / 2;

      pdf.addImage(
        `data:image/png;base64,${barcode.barcodeData}`,
        "PNG",
        x,
        y,
        imgWidth,
        imgHeight
      );

      pdf.setFontSize(12);
      pdf.text(`Code: ${barcode.barcode}`, pageWidth / 2, y + imgHeight + 10, { align: "center" });
      pdf.text(`Product: ${barcode.productName}`, pageWidth / 2, y + imgHeight + 18, { align: "center" });

      y += imgHeight + marginY;

      if (y + imgHeight + 30 > pageHeight) {
        pdf.addPage();
        y = 40;
      }
    });

    pdf.save("barcodes.pdf");
  };

  const fetchPurchases = async () => {
    try {
      const response = await purchasesAPI.getAll();
      setPurchases(response.data);
    } catch (error) {
      setError('Failed to fetch purchases');
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      console.error('Failed to fetch vendors');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
    setFormData({
      vendor: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      items: []
    });
    setCurrentItem({
      product: '',
      quantity: 1,
      unitCost: 0
    });
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === "quantity" || name === "unitCost" ? parseFloat(value) || 0 : value
    }));
  };

  const addItem = () => {
    if (!currentItem.product || currentItem.quantity <= 0 || currentItem.unitCost < 0) {
      setError('Invalid item data');
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...currentItem }]
    }));

    setCurrentItem({
      product: '',
      quantity: 1,
      unitCost: 0
    });
    setError('');
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (Number(item.quantity) * Number(item.unitCost)),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor || formData.items.length === 0) {
      setError('Vendor and at least one item are required');
      return;
    }

    try {
      setLoading(true);
      await purchasesAPI.create(formData);
      setSuccess('Purchase created successfully');
      fetchPurchases();
      handleCloseModal();
    } catch (error) {
      setError('Failed to create purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (purchase) => {
    try {
      const response = await purchasesAPI.getById(purchase._id);
      setSelectedPurchase(response.data);
      setShowViewModal(true);
    } catch (error) {
      setError('Failed to fetch purchase details');
    }
  };

  const handleGenerateBarcodes = async (id) => {
    try {
      const response = await purchasesAPI.getBarcodes(id);
      setBarcodes(response.data);
      setShowBarcodesModal(true);
    } catch (error) {
      setError('Failed to generate barcodes');
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const response = await purchasesAPI.getInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `purchase-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Failed to download invoice');
    }
  };

  if (loading && purchases.length === 0) {
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
                Purchases Management
              </h4>
            </Col>
            <Col xs="auto">
              <PrimaryButton
                onClick={handleShowModal}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.9rem",
                  borderRadius: "6px"
                }}
              >
                + New Purchase
              </PrimaryButton>
            </Col>
          </Row>
        </HeaderSection>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <StyledTable responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase, index) => (
              <TableRow key={purchase._id}>
                <td><strong>{purchase.purchaseId}</strong></td>
                <td>{purchase.vendor?.name}</td>
                <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                <td>${Number(purchase.totalAmount).toFixed(2)}</td>
                <td>
                  <SecondaryButton size="sm" className="me-2" onClick={() => handleView(purchase)}>
                    👁️ View
                  </SecondaryButton>
                  <SecondaryButton size="sm" className="me-2" onClick={() => handleGenerateBarcodes(purchase._id)}>
                    📊 Barcodes
                  </SecondaryButton>
                  <SuccessButton size="sm" onClick={() => handleDownloadInvoice(purchase._id)}>
                    📄 Invoice
                  </SuccessButton>
                </td>
              </TableRow>
            ))}
          </tbody>
        </StyledTable>

        {/* New Purchase Modal */}
        <StyledModal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Purchase</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Form.Label>Vendor</Form.Label>
                    <Form.Select name="vendor" value={formData.vendor} onChange={handleInputChange} required>
                      <option value="">Select Vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                      ))}
                    </Form.Select>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Form.Label>Purchase Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <h5 className="mt-4">Add Items</h5>
              <Row className="align-items-center">
                <Col md={5}>
                  <FormGroup>
                    <Form.Label>Product</Form.Label>
                    <Form.Select name="product" value={currentItem.product} onChange={handleItemChange}>
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>{product.name}</option>
                      ))}
                    </Form.Select>
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={currentItem.quantity}
                      onChange={handleItemChange}
                      min="1"
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Form.Label>Unit Cost ($)</Form.Label>
                    <Form.Control
                      type="number"
                      name="unitCost"
                      value={currentItem.unitCost}
                      onChange={handleItemChange}
                      min="0"
                      step="0.01"
                    />
                  </FormGroup>
                </Col>
                <Col md={1}>
                  <PrimaryButton type="button" onClick={addItem} className="w-100">
                    +
                  </PrimaryButton>
                </Col>
              </Row>

              <ItemList className="mt-3">
                {formData.items.map((item, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <span>
                      <strong>{products.find(p => p._id === item.product)?.name}</strong>
                      × {item.quantity} @ ${Number(item.unitCost).toFixed(2)}
                      = <strong>${(Number(item.quantity) * Number(item.unitCost)).toFixed(2)}</strong>
                    </span>
                    <DangerButton variant="outline-danger" size="sm" onClick={() => removeItem(index)}>
                      🗑️
                    </DangerButton>
                  </ListGroup.Item>
                ))}
              </ItemList>

              <TotalDisplay>Total: ${calculateTotal().toFixed(2)}</TotalDisplay>
            </Modal.Body>
            <Modal.Footer>
              <SecondaryButton onClick={handleCloseModal}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : 'Create Purchase'}
              </PrimaryButton>
            </Modal.Footer>
          </Form>
        </StyledModal>

        {/* View Purchase Modal */}
        <StyledModal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Purchase Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPurchase && (
              <>
                <Row>
                  <Col md={6}>
                    <h6>Purchase Information</h6>
                    <p><strong>ID:</strong> {selectedPurchase.purchaseId}</p>
                    <p><strong>Date:</strong> {new Date(selectedPurchase.purchaseDate).toLocaleString()}</p>
                  </Col>
                  <Col md={6}>
                    <h6>Vendor Details</h6>
                    <p><strong>Name:</strong> {selectedPurchase.vendor.name}</p>
                    <p><strong>Contact:</strong> {selectedPurchase.vendor.contactPerson}</p>
                    <p><strong>Email:</strong> {selectedPurchase.vendor.email}</p>
                    <p><strong>Phone:</strong> {selectedPurchase.vendor.phone}</p>
                  </Col>
                </Row>

                <h6 className="mt-4">Items</h6>
                <Table striped bordered responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit Cost</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items.map((item, index) => (
                      <tr key={item._id}>
                        <td>{item.product.name}</td>
                        <td>{item.product.description}</td>
                        <td>{item.quantity}</td>
                        <td>${Number(item.unitCost).toFixed(2)}</td>
                        <td><strong>${Number(item.total).toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <TotalDisplay>Grand Total: ${Number(selectedPurchase.totalAmount).toFixed(2)}</TotalDisplay>
              </>
            )}
          </Modal.Body>
        </StyledModal>

        {/* Barcodes Modal */}
        <StyledModal show={showBarcodesModal} onHide={() => setShowBarcodesModal(false)} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>Generated Barcodes</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              {barcodes.map((barcode, index) => (
                <Col md={4} className="mb-4" key={index}>
                  <BarcodeCard>
                    <Card.Body className="text-center">
                      <img
                        src={`data:image/png;base64,${barcode.barcodeData}`}
                        alt="barcode"
                        className="img-fluid mb-3"
                        style={{ height: '80px' }}
                      />
                      <p className="mb-1"><strong>Code:</strong> {barcode.barcode}</p>
                      <p className="mb-3 text-muted">{barcode.productName}</p>
                      <SecondaryButton
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = `data:image/png;base64,${barcode.barcodeData}`;
                          link.download = `${barcode.productName || "barcode"}-${barcode.barcode}.png`;
                          link.click();
                        }}
                      >
                        📥 Download
                      </SecondaryButton>
                    </Card.Body>
                  </BarcodeCard>
                </Col>
              ))}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <SuccessButton onClick={downloadAllBarcodesPDF}>
              📥 Download All as PDF
            </SuccessButton>
            <SecondaryButton onClick={() => setShowBarcodesModal(false)}>
              Close
            </SecondaryButton>
          </Modal.Footer>
        </StyledModal>
      </AnimatedContainer>
    </Container>
  );
};

export default Purchases;