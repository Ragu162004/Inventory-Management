import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Row,
  Col,
  ListGroup,
  Spinner,
  Card,
  Badge
} from "react-bootstrap";
import { salesAPI, buyersAPI } from "../services/api";
import Quagga from "quagga";
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

const scannerFlash = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
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

const ScannerButton = styled(Button)`
  border-radius: 20px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  
  ${props => props.$active ? css`
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
      transform: translateY(-2px);
    }
  ` : css`
        background: linear-gradient(to right, #3498db);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    
    &:hover {
        background: linear-gradient(to right, #3498db);
      transform: translateY(-2px);
    }
  `}
`;

const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  
  .modal-header {
        background: linear-gradient(to right, #3498db);
    color: white;
    border-radius: 20px 20px 0 0;
    border: none;
    
    .btn-close {
      filter: invert(1);
    }
  }
`;

const ScannerContainer = styled.div`
  width: 100%;
  height: 300px;
  background: #000;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid #00ff00;
    border-radius: 10px;
    animation: ${scannerFlash} 2s ease-in-out infinite;
    pointer-events: none;
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
  margin-top: 1.5rem;
  animation: ${pulse} 2s infinite;
`;

const LoadingSpinner = styled(Spinner)`
  color: #667eea;
  width: 3rem;
  height: 3rem;
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
`;

const BarcodeBadge = styled(Badge)`
        background: linear-gradient(to right, #3498db);
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
`;

const ScannerStatus = styled.div`
  padding: 1rem;
  border-radius: 10px;
  background: ${props => props.$active ? '#48bb78' : '#e53e3e'};
  color: white;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
`;

// Fixed TableRow component without inline animation
const TableRow = styled.tr`
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
`;

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [formData, setFormData] = useState({
    buyer: "",
    saleDate: new Date().toISOString().split("T")[0],
    items: [],
  });

  const [scannerActive, setScannerActive] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    fetchData();
    return () => {
      stopScanner();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSales(), fetchBuyers()]);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await salesAPI.getAll();
      setSales(response.data);
    } catch (error) {
      setError("Failed to fetch sales");
    }
  };

  const fetchBuyers = async () => {
    try {
      const response = await buyersAPI.getAll();
      setBuyers(response.data);
    } catch (error) {
      console.error("Failed to fetch buyers");
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
    setFormData({
      buyer: "",
      saleDate: new Date().toISOString().split("T")[0],
      items: [],
    });
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    stopScanner();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Start Quagga Scanner
  const startScanner = () => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              facingMode: "environment",
            },
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "upc_reader",
              "code_39_reader",
            ],
          },
        },
        (err) => {
          if (err) {
            setError("Unable to start scanner: " + err);
            return;
          }
          Quagga.start();
          setScannerActive(true);
        }
      );

      Quagga.onDetected((data) => {
        if (data && data.codeResult && data.codeResult.code) {
          setScannedCode(data.codeResult.code);
        }
      });
    }
  };

  // Stop Scanner
  const stopScanner = () => {
    try {
      Quagga.stop();
      setScannerActive(false);
    } catch { }
  };


  // Add Item (auto on scan)
  useEffect(() => {
    const addScannedItem = async () => {
      if (!scannedCode) return;
      try {
        const response = await salesAPI.scanBarcode({ barcode: scannedCode });
        const scannedItem = response.data;
        setFormData((prev) => ({
          ...prev,
          items: [
            ...prev.items,
            {
              product: scannedItem.product,
              productItem: scannedItem.productItem,
              quantity: 1,
              unitPrice: scannedItem.price,
              barcode: scannedCode,
            },
          ],
        }));
        setScannedCode("");
        // Stop and restart scanner to prevent duplicate scans
        stopScanner();
        setTimeout(() => {
          startScanner();
        }, 500); // short delay to allow camera to reset
      } catch (error) {
        setError("Invalid or sold barcode");
      }
    };
    addScannedItem();
    // Only run when scannedCode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedCode]);

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.unitPrice * (item.quantity || 1),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.buyer || formData.items.length === 0) {
      setError("Buyer and at least one item are required");
      return;
    }

    try {
      setLoading(true);
      await salesAPI.create(formData);
      setSuccess("Sale created successfully");
      fetchSales();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (sale) => {
    try {
      const response = await salesAPI.getById(sale._id);
      setSelectedSale(response.data);
      setShowViewModal(true);
    } catch (error) {
      setError("Failed to fetch sale details");
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const response = await salesAPI.getInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sale-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError("Failed to download invoice");
    }
  };

  if (loading && sales.length === 0) {
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
                Sales Management
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
                + New Sale
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
              <th>Buyer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <TableRow key={sale._id}>
                <td><strong>{sale.saleId}</strong></td>
                <td>{sale.buyer?.name}</td>
                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                <td>${sale.totalAmount.toFixed(2)}</td>
                <td>
                  <SecondaryButton size="sm" className="me-2" onClick={() => handleView(sale)}>
                    👁️ View
                  </SecondaryButton>
                  <SuccessButton size="sm" onClick={() => handleDownloadInvoice(sale._id)}>
                    📄 Invoice
                  </SuccessButton>
                </td>
              </TableRow>
            ))}
          </tbody>
        </StyledTable>

        {/* New Sale Modal */}
        <StyledModal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Sale</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Form.Label>Buyer</Form.Label>
                    <Form.Select
                      name="buyer"
                      value={formData.buyer}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Buyer</option>
                      {buyers.map((buyer) => (
                        <option key={buyer._id} value={buyer._id}>
                          {buyer.name}
                        </option>
                      ))}
                    </Form.Select>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Form.Label>Sale Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="saleDate"
                      value={formData.saleDate}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <h5 className="mt-4">Scan Items</h5>

              <ScannerStatus $active={scannerActive}>
                {scannerActive ? '🟢 Scanner Active' : '🔴 Scanner Inactive'}
              </ScannerStatus>

              <ScannerContainer ref={scannerRef} />

              <div className="d-flex gap-2 mb-3">
                <ScannerButton
                  $active={scannerActive}
                  onClick={scannerActive ? stopScanner : startScanner}
                >
                  {scannerActive ? '⏹️' : '📷'}
                  {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
                </ScannerButton>
              </div>

              {/* Barcode Input */}
              <FormGroup>
                <Form.Label>Scanned Barcode</Form.Label>
                <Form.Control
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder="Scan or enter barcode"
                  className="mb-3"
                />
              </FormGroup>

              {/* Add Item button removed: item is now added automatically on scan */}

              <h6>Scanned Items ({formData.items.length})</h6>
              <ItemList>
                {formData.items.map((item, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{item.product?.name}</strong>
                      <br />
                      <BarcodeBadge>{item.barcode}</BarcodeBadge>
                      <span className="ms-2">@ ${item.unitPrice.toFixed(2)}</span>
                    </div>
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
                {loading ? <LoadingSpinner size="sm" /> : 'Create Sale'}
              </PrimaryButton>
            </Modal.Footer>
          </Form>
        </StyledModal>

        {/* View Sale Modal */}
        <StyledModal
          show={showViewModal}
          onHide={() => setShowViewModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Sale Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedSale && (
              <>
                <Row>
                  <Col md={6}>
                    <h6>Sale Information</h6>
                    <p><strong>ID:</strong> {selectedSale.saleId}</p>
                    <p><strong>Date:</strong> {new Date(selectedSale.saleDate).toLocaleString()}</p>
                  </Col>
                  <Col md={6}>
                    <h6>Buyer Details</h6>
                    <p><strong>Name:</strong> {selectedSale.buyer.name}</p>
                    <p><strong>Email:</strong> {selectedSale.buyer.email}</p>
                    <p><strong>Phone:</strong> {selectedSale.buyer.phone}</p>
                  </Col>
                </Row>

                <h6 className="mt-4">Items</h6>
                <Table striped bordered responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Barcode</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSale.items || []).map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td>{item.product?.name || '-'}</td>
                        <td><BarcodeBadge>{item.product?.barcode || '-'}</BarcodeBadge></td>
                        <td>${item.unitPrice?.toFixed(2) ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <TotalDisplay>Total: ${selectedSale.totalAmount.toFixed(2)}</TotalDisplay>
              </>
            )}
          </Modal.Body>
        </StyledModal>
      </AnimatedContainer>
    </Container>
  );
};

export default Sales;