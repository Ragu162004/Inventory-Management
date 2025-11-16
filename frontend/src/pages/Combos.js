import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Card,
  Badge,
  Spinner,
  Toast,
  ToastContainer,
  Tabs,
  Tab
} from 'react-bootstrap';
import { combosAPI, productsAPI, productMastersAPI, barcodesAPI, categoriesAPI } from '../services/api';
import styled, { keyframes } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Styled Components
const StyledContainer = styled(Container)`
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const AnimatedContainer = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderSection = styled.div`
  background: white;
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    th {
      color: white;
      border: none;
      padding: 1.2rem;
      font-weight: 600;
    }
  }
  
  tbody tr {
    transition: all 0.3s ease;
    
    &:hover {
      background-color: #f8f9fa;
      transform: translateX(5px);
    }
    
    td {
      padding: 1rem;
      border-color: #e9ecef;
      vertical-align: middle;
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
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
  }
`;

const DangerButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  }
`;

const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  
  .modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px 20px 0 0;
    border: none;
    
    .btn-close {
      filter: invert(1);
    }
  }
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1rem;
  
  .form-label {
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
  
  .form-control, .form-select {
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    padding: 0.75rem;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
  }
`;

const ProductCard = styled(Card)`
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const LoadingSpinner = styled(Spinner)`
  color: #667eea;
`;

const Combos = () => {
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Unmapped combos (combos without product mapping)
  const [unmappedCombos, setUnmappedCombos] = useState([]);
  const [unmappedLoading, setUnmappedLoading] = useState(false);
  const [mappingStats, setMappingStats] = useState({
    totalCombos: 0,
    mappedCombos: 0,
    unmappedCombos: 0
  });

  // Excel upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Product mapping modal
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedComboForMapping, setSelectedComboForMapping] = useState(null);
  const [mappingProducts, setMappingProducts] = useState([]);

  // Checkbox selection for barcode download
  const [selectedCombos, setSelectedCombos] = useState([]);
  const [isDownloadingBarcodes, setIsDownloadingBarcodes] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    category: '',
    products: [],
    image: null
  });

  // Product selection for combo
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCombos(),
        fetchProducts(),
        fetchCategories(),
        fetchUnmappedCombos()
      ]);
    } catch (error) {
      showError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCombos = async () => {
    try {
      const response = await combosAPI.getAll();
      setCombos(response.data || []);
    } catch (error) {
      console.error('Failed to fetch combos:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchUnmappedCombos = async () => {
    try {
      setUnmappedLoading(true);
      const response = await combosAPI.getUnmapped();
      setUnmappedCombos(response.data?.unmappedCombos || []);
      setMappingStats({
        totalCombos: response.data?.totalCombos || 0,
        mappedCombos: response.data?.mappedCount || 0,
        unmappedCombos: response.data?.unmappedCount || 0
      });
    } catch (error) {
      console.error('Failed to fetch unmapped combos:', error);
    } finally {
      setUnmappedLoading(false);
    }
  };

  // Toast helper functions
  const showToast = (message, variant = 'success') => {
    const id = Date.now();
    const toast = {
      id,
      message,
      variant,
      show: true
    };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message) => showToast(message, 'success');
  const showError = (message) => showToast(message, 'danger');

  const handleShowModal = () => {
    setShowModal(true);
    setEditMode(false);
    setFormData({
      name: '',
      description: '',
      barcode: '',
      category: '',
      products: [],
      image: null
    });
    setSelectedProduct('');
    setProductQuantity(1);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleAddProduct = () => {
    if (!selectedProduct || productQuantity < 1) {
      showError('Please select a product and enter a valid quantity');
      return;
    }

    const product = products.find(p => p._id === selectedProduct);
    if (!product) {
      showError('Selected product not found');
      return;
    }

    // Check if product is already added
    const existingProductIndex = formData.products.findIndex(
      p => p.product._id === selectedProduct
    );

    setFormData(prev => {
      let updatedProducts = [...prev.products];

      if (existingProductIndex !== -1) {
        // Update quantity if product already exists
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: updatedProducts[existingProductIndex].quantity + productQuantity
        };
      } else {
        // Add new product
        updatedProducts.push({
          product: product,
          quantity: productQuantity
        });
      }

      return {
        ...prev,
        products: updatedProducts
      };
    });

    // Reset selection
    setSelectedProduct('');
    setProductQuantity(1);
    showSuccess(`${product.name} added to combo`);
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
    showSuccess('Product removed from combo');
  };

  const handleUpdateProductQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;

    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        quantity: newQuantity
      };
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.barcode) {
      showError('Name and barcode are required');
      return;
    }

    if (formData.products.length === 0) {
      showError('Please add at least one product to the combo');
      return;
    }

    try {
      setLoading(true);
      
      const calculatedPrice = calculateComboValue();
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('barcode', formData.barcode);
      formDataToSend.append('price', calculatedPrice.toString());
      
      if (formData.category) {
        formDataToSend.append('category', formData.category);
      }
      
      // Add products data
      formDataToSend.append('products', JSON.stringify(
        formData.products.map(p => ({
          product: p.product._id,
          quantity: p.quantity
        }))
      ));

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Debug: Log what we're sending
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ':', value);
      }

      if (editMode && selectedCombo) {
        await combosAPI.update(selectedCombo._id, formDataToSend);
        showSuccess('Combo updated successfully');
      } else {
        await combosAPI.create(formDataToSend);
        showSuccess('Combo created successfully');
      }

      handleCloseModal();
      fetchCombos();
    } catch (error) {
      console.error('Submit error:', error);
      showError(error.response?.data?.message || 'Failed to save combo');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (combo) => {
    setSelectedCombo(combo);
    setEditMode(true);
    setFormData({
      name: combo.name,
      description: combo.description || '',
      barcode: combo.barcode,
      category: combo.category?._id || combo.category || '',
      products: combo.products || [],
      image: null
    });
    setShowModal(true);
  };

  const handleView = (combo) => {
    setSelectedCombo(combo);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this combo?')) {
      try {
        setLoading(true);
        await combosAPI.delete(id);
        showSuccess('Combo deleted successfully');
        fetchCombos();
      } catch (error) {
        showError('Failed to delete combo');
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateComboValue = () => {
    return formData.products.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  // Excel Upload Handlers
  const handleShowUploadModal = () => {
    setShowUploadModal(true);
    setUploadFile(null);
    setUploadResult(null);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadResult(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        setUploadFile(file);
      } else {
        showError('Please select a valid Excel file (.xlsx or .xls)');
        e.target.value = null;
      }
    }
  };

  const handleUploadExcel = async () => {
    if (!uploadFile) {
      showError('Please select a file to upload');
      return;
    }

    try {
      setUploadLoading(true);
      const response = await productMastersAPI.uploadExcel(uploadFile);
      setUploadResult(response.data);
      showSuccess(
        `✅ Processed ${response.data.successCount} records! ` +
        `Categories: ${response.data.categoriesCreated}, ` +
        `New Combos: ${response.data.combosCreated}, ` +
        `Updated: ${response.data.combosUpdated}`
      );
      
      // Refresh data after upload
      await fetchCombos();
      await fetchUnmappedCombos();
    } catch (error) {
      console.error('Upload error:', error);
      showError(error.response?.data?.message || 'Failed to upload Excel file');
    } finally {
      setUploadLoading(false);
    }
  };

  // Product Mapping Handlers
  const handleShowMappingModal = (combo) => {
    setSelectedComboForMapping(combo);
    setMappingProducts(combo.products || []);
    setShowMappingModal(true);
  };

  const handleCloseMappingModal = () => {
    setShowMappingModal(false);
    setSelectedComboForMapping(null);
    setMappingProducts([]);
    setSelectedProduct('');
    setProductQuantity(1);
  };

  const handleAddProductToMapping = () => {
    if (!selectedProduct || productQuantity < 1) {
      showError('Please select a product and enter a valid quantity');
      return;
    }

    const product = products.find(p => p._id === selectedProduct);
    if (!product) {
      showError('Selected product not found');
      return;
    }

    // Check if product is already added
    const existingIndex = mappingProducts.findIndex(p => p.product._id === selectedProduct);

    if (existingIndex !== -1) {
      // Update quantity
      const updated = [...mappingProducts];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + productQuantity
      };
      setMappingProducts(updated);
    } else {
      // Add new product
      setMappingProducts([...mappingProducts, {
        product: product,
        quantity: productQuantity
      }]);
    }

    setSelectedProduct('');
    setProductQuantity(1);
    showSuccess(`${product.name} added`);
  };

  const handleRemoveProductFromMapping = (index) => {
    setMappingProducts(mappingProducts.filter((_, i) => i !== index));
    showSuccess('Product removed');
  };

  const handleUpdateMappingQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updated = [...mappingProducts];
    updated[index] = { ...updated[index], quantity: newQuantity };
    setMappingProducts(updated);
  };

  const handleSaveProductMapping = async () => {
    if (mappingProducts.length === 0) {
      showError('Please add at least one product');
      return;
    }

    try {
      setLoading(true);
      const productsToMap = mappingProducts.map(p => ({
        product: p.product._id,
        quantity: p.quantity
      }));

      await productMastersAPI.mapProductsToCombo(
        selectedComboForMapping._id,
        productsToMap
      );

      showSuccess('Products mapped to combo successfully!');
      handleCloseMappingModal();
      
      // Refresh data
      await fetchCombos();
      await fetchUnmappedCombos();
    } catch (error) {
      console.error('Mapping error:', error);
      showError(error.response?.data?.message || 'Failed to map products');
    } finally {
      setLoading(false);
    }
  };

  // Checkbox handlers for barcode download
  const handleSelectCombo = (comboId) => {
    setSelectedCombos(prev => 
      prev.includes(comboId) 
        ? prev.filter(id => id !== comboId)
        : [...prev, comboId]
    );
  };

  const handleSelectAllCombos = (checked) => {
    if (checked) {
      setSelectedCombos(combos.map(combo => combo._id));
    } else {
      setSelectedCombos([]);
    }
  };

  const handleDownloadBarcodes = async () => {
    if (selectedCombos.length === 0) {
      showError('Please select at least one combo');
      return;
    }

    try {
      setIsDownloadingBarcodes(true);
      const response = await barcodesAPI.downloadComboBarcodes(selectedCombos);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      if (selectedCombos.length === 1) {
        const combo = combos.find(c => c._id === selectedCombos[0]);
        link.setAttribute('download', `barcode-${combo?.barcode || 'combo'}.png`);
      } else {
        link.setAttribute('download', `combo-barcodes-${Date.now()}.zip`);
      }
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccess(`Downloaded ${selectedCombos.length} barcode(s) successfully!`);
      setSelectedCombos([]);
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to download barcodes');
    } finally {
      setIsDownloadingBarcodes(false);
    }
  };

  return (
    <StyledContainer>
      <AnimatedContainer>
        <HeaderSection>
          <Row className="align-items-center">
            <Col>
              <h2 className="mb-0 d-flex align-items-center">
                <span style={{ fontSize: '2rem', marginRight: '1rem' }}>📦</span>
                Combo Management
              </h2>
              <p className="text-muted mb-0 mt-2">Manage product combinations and bundles</p>
            </Col>
            <Col xs="auto" className="d-flex gap-2">
              {selectedCombos.length > 0 && (
                <SecondaryButton 
                  onClick={handleDownloadBarcodes}
                  disabled={isDownloadingBarcodes}
                >
                  {isDownloadingBarcodes ? (
                    <>
                      <LoadingSpinner size="sm" className="me-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      📥 Download Barcodes ({selectedCombos.length})
                    </>
                  )}
                </SecondaryButton>
              )}
              <SecondaryButton onClick={handleShowUploadModal}>
                📤 Upload Excel
              </SecondaryButton>
              <PrimaryButton onClick={handleShowModal}>
                ✨ Add New Combo
              </PrimaryButton>
            </Col>
          </Row>
        </HeaderSection>

        {/* Toast Notifications */}
        <ToastContainer position="top-end" className="p-3">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              show={toast.show}
              onClose={() => removeToast(toast.id)}
              bg={toast.variant}
              text={toast.variant === 'danger' ? 'white' : 'dark'}
            >
              <Toast.Header>
                <strong className="me-auto">
                  {toast.variant === 'success' ? '✅ Success' : '❌ Error'}
                </strong>
              </Toast.Header>
              <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
          ))}
        </ToastContainer>

        <Tabs defaultActiveKey="all" className="mb-4">
          <Tab eventKey="all" title={`📦 All Combos (${combos.length})`}>
            {loading && combos.length === 0 ? (
              <div className="d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
                <LoadingSpinner animation="border" size="lg" />
              </div>
            ) : (
              <StyledTable responsive hover>
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectedCombos.length === combos.length && combos.length > 0}
                        onChange={(e) => handleSelectAllCombos(e.target.checked)}
                      />
                    </th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Barcode</th>
                    <th>Category</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {combos.map((combo) => (
                    <tr key={combo._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedCombos.includes(combo._id)}
                          onChange={() => handleSelectCombo(combo._id)}
                        />
                      </td>
                      <td>
                        {combo.imageUrl ? (
                          <img
                            src={combo.imageUrl}
                            alt={combo.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            📦
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong>{combo.name}</strong>
                          {combo.description && (
                            <div>
                              <small className="text-muted">{combo.description}</small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg="info" className="px-3 py-2">
                          {combo.barcode}
                        </Badge>
                      </td>
                      <td>
                        {combo.category ? (
                          <Badge bg="secondary" className="px-2 py-1">
                            {combo.category.name || combo.category}
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <Badge bg="secondary">
                          {combo.products?.length || 0} items
                        </Badge>
                      </td>
                      <td>
                        {combo.isMapped ? (
                          <Badge bg="success" className="px-2 py-1">
                            ✅ Mapped
                          </Badge>
                        ) : (
                          <Badge bg="warning" className="px-2 py-1">
                            ⏳ Unmapped
                          </Badge>
                        )}
                      </td>
                      <td>
                        <strong className="text-success">₹{combo.price?.toFixed(2) || '0.00'}</strong>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <SecondaryButton
                            size="sm"
                            onClick={() => handleView(combo)}
                          >
                            👁️ View
                          </SecondaryButton>
                          <SecondaryButton
                            size="sm"
                            onClick={() => handleEdit(combo)}
                          >
                            ✏️ Edit
                          </SecondaryButton>
                          <DangerButton
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(combo._id)}
                          >
                            🗑️ Delete
                          </DangerButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            )}
          </Tab>

          <Tab eventKey="unmapped" title={
            <span>
              🔗 Unmapped Combos 
              {unmappedCombos.length > 0 && (
                <Badge bg="warning" className="ms-2">{unmappedCombos.length}</Badge>
              )}
            </span>
          }>
            {unmappedLoading ? (
              <div className="d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
                <LoadingSpinner animation="border" size="lg" />
              </div>
            ) : unmappedCombos.length === 0 ? (
              <Alert variant="success">
                <Alert.Heading>✅ All Combos Have Product Mappings!</Alert.Heading>
                <p>
                  All combos have been manually mapped to products. 
                  <br />
                  <strong>Stats:</strong> {mappingStats.totalCombos} total combos, {mappingStats.mappedCombos} mapped.
                </p>
              </Alert>
            ) : (
              <>
                <Alert variant="info" className="mb-3">
                  <Alert.Heading>🔗 Product Mapping Required</Alert.Heading>
                  <p className="mb-2">
                    These combos were imported from Excel but <strong>products are not mapped yet</strong>.
                    Click "Map Products" to manually assign products to each combo.
                  </p>
                  <div className="d-flex gap-3 mt-2">
                    <Badge bg="primary" className="px-3 py-2">
                      Total: {mappingStats.totalCombos}
                    </Badge>
                    <Badge bg="success" className="px-3 py-2">
                      ✅ Mapped: {mappingStats.mappedCombos}
                    </Badge>
                    <Badge bg="warning" className="px-3 py-2">
                      ⏳ Unmapped: {mappingStats.unmappedCombos}
                    </Badge>
                  </div>
                </Alert>
                <StyledTable responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Combo Name</th>
                      <th>Barcode/Code</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unmappedCombos.map((combo, index) => (
                      <tr key={combo._id}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{combo.name}</strong>
                        </td>
                        <td>
                          <Badge bg="info" className="px-3 py-2">
                            {combo.barcode}
                          </Badge>
                        </td>
                        <td>
                          {combo.category ? (
                            <Badge bg="secondary" className="px-2 py-1">
                              {combo.category.name}
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <strong className="text-success">₹{combo.price?.toFixed(2)}</strong>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <PrimaryButton
                              size="sm"
                              onClick={() => handleShowMappingModal(combo)}
                            >
                              🔗 Map Products
                            </PrimaryButton>
                            <SecondaryButton
                              size="sm"
                              onClick={() => handleView(combo)}
                            >
                              👁️ View
                            </SecondaryButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </>
            )}
          </Tab>
        </Tabs>

        {/* Add/Edit Combo Modal */}
        <StyledModal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {editMode ? '✏️ Edit Combo' : '✨ Add New Combo'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Form.Label>Combo Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter combo name"
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Form.Label>Barcode *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      placeholder="Enter barcode (e.g., EW00L002)"
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select a category...</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </FormGroup>

              <FormGroup>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter combo description"
                />
              </FormGroup>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Form.Label>Auto-Calculated Price *</Form.Label>
                    <Form.Control
                      type="text"
                      value={`₹${calculateComboValue().toFixed(2)}`}
                      disabled
                      style={{
                        backgroundColor: '#e9ecef',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        color: '#28a745'
                      }}
                    />
                    <Form.Text className="text-muted">
                      Price is automatically calculated based on selected products
                    </Form.Text>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Form.Label>Combo Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <hr />

              <h5 className="mb-3">📋 Products in Combo</h5>

              {/* Add Product Section */}
              <ProductCard>
                <Card.Body>
                  <h6 className="mb-3">➕ Add Product to Combo</h6>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Form.Label>Select Product</Form.Label>
                        <Form.Select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                          <option value="">Choose a product...</option>
                          {products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} - ₹{product.price} (Stock: {product.quantity})
                            </option>
                          ))}
                        </Form.Select>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <PrimaryButton
                        type="button"
                        onClick={handleAddProduct}
                        style={{ borderRadius: '10px' }}
                      >
                        ➕ Add
                      </PrimaryButton>
                    </Col>
                  </Row>
                </Card.Body>
              </ProductCard>

              {/* Selected Products List */}
              {formData.products.length > 0 && (
                <div className="mt-3">
                  <h6 className="mb-3">📦 Selected Products ({formData.products.length})</h6>
                  
                  <Table bordered responsive className="mb-3">
                    <thead className="bg-light">
                      <tr>
                        <th>Product</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.products.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <strong>{item.product.name}</strong>
                              <div>
                                <small className="text-muted">
                                  Barcode: {item.product.barcode}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>₹{item.product.price?.toFixed(2)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleUpdateProductQuantity(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                              <span className="mx-2 fw-bold">{item.quantity}</span>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleUpdateProductQuantity(index, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          <td>₹{(item.product.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveProduct(index)}
                            >
                              🗑️ Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-info">
                        <td colSpan="3"><strong>Total Product Value:</strong></td>
                        <td><strong>₹{calculateComboValue().toFixed(2)}</strong></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>

                  {calculateComboValue() > 0 && (
                    <div className="alert alert-success">
                      <strong>💰 Combo Total Value:</strong>
                      <br />
                      <span className="fs-5 fw-bold text-success">
                        ₹{calculateComboValue().toFixed(2)}
                      </span>
                      <br />
                      <small className="text-muted">
                        This is the total price customers will pay for this combo package.
                      </small>
                    </div>
                  )}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <SecondaryButton type="button" onClick={handleCloseModal}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" className="me-2" /> : null}
                {editMode ? 'Update Combo' : 'Create Combo'}
              </PrimaryButton>
            </Modal.Footer>
          </Form>
        </StyledModal>

        {/* View Combo Modal */}
        <StyledModal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>📦 Combo Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCombo && (
              <div>
                <Row className="mb-4">
                  <Col md={4} className="text-center">
                    {selectedCombo.imageUrl ? (
                      <img
                        src={selectedCombo.imageUrl}
                        alt={selectedCombo.name}
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px' }}
                      />
                    ) : (
                      <div
                        className="bg-light rounded d-flex align-items-center justify-content-center"
                        style={{ height: '200px' }}
                      >
                        <span style={{ fontSize: '4rem' }}>📦</span>
                      </div>
                    )}
                  </Col>
                  <Col md={8}>
                    <h3>{selectedCombo.name}</h3>
                    <p className="text-muted">{selectedCombo.description}</p>
                    <div className="mb-2">
                      <Badge bg="info" className="me-2 px-3 py-2">
                        Barcode: {selectedCombo.barcode}
                      </Badge>
                      <Badge bg="success" className="px-3 py-2">
                        Price: ₹{selectedCombo.price?.toFixed(2)}
                      </Badge>
                    </div>
                  </Col>
                </Row>

                <h5 className="mb-3">📋 Products in this Combo</h5>
                {selectedCombo.products && selectedCombo.products.length > 0 ? (
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Barcode</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCombo.products.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product?.name || 'N/A'}</td>
                          <td>{item.product?.barcode || 'N/A'}</td>
                          <td>₹{item.product?.price?.toFixed(2) || '0.00'}</td>
                          <td>{item.quantity}</td>
                          <td>₹{((item.product?.price || 0) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">No products found in this combo.</Alert>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <SecondaryButton onClick={() => setShowViewModal(false)}>
              Close
            </SecondaryButton>
          </Modal.Footer>
        </StyledModal>

        {/* Excel Upload Modal */}
        <StyledModal show={showUploadModal} onHide={handleCloseUploadModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>📤 Upload Product Master Excel File</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              <strong>📋 Excel File Processing:</strong>
              <ul className="mb-0 mt-2">
                <li><strong>Product Category</strong> → Stored in <Badge bg="secondary">Category DB</Badge></li>
                <li><strong>Selling Product Code, Product Name, Price</strong> → Stored in <Badge bg="primary">Combo DB</Badge></li>
                <li>✅ Category & Combo are <strong>automatically mapped</strong></li>
                <li>⏳ Products remain <strong>unmapped</strong> (manual mapping required)</li>
              </ul>
              <hr />
              <strong>Required Columns:</strong> <code>S.No.</code>, <code>Product Category</code>, 
              <code>Selling Product Code</code>, <code>Product Name</code>, <code>Price/product</code>
            </Alert>

            <FormGroup>
              <Form.Label>Select Excel File (.xlsx or .xls)</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploadLoading}
              />
              {uploadFile && (
                <Form.Text className="text-success">
                  ✅ Selected: {uploadFile.name}
                </Form.Text>
              )}
            </FormGroup>

            {uploadResult && (
              <div className="mt-3">
                <Alert variant={uploadResult.errorCount > 0 ? 'warning' : 'success'}>
                  <h6>📊 Upload Results</h6>
                  <Row>
                    <Col md={6}>
                      <ul className="mb-0">
                        <li><strong>Total Rows:</strong> {uploadResult.totalRows}</li>
                        <li><strong>Success:</strong> {uploadResult.successCount}</li>
                        <li><strong>Errors:</strong> {uploadResult.errorCount}</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <ul className="mb-0">
                        <li><strong>Categories Created:</strong> {uploadResult.categoriesCreated}</li>
                        <li><strong>Combos Created:</strong> {uploadResult.combosCreated}</li>
                        <li><strong>Combos Updated:</strong> {uploadResult.combosUpdated}</li>
                      </ul>
                    </Col>
                  </Row>
                </Alert>

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <Card className="mt-3">
                    <Card.Header className="bg-danger text-white">
                      ❌ Errors ({uploadResult.errors.length})
                    </Card.Header>
                    <Card.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {uploadResult.errors.map((err, idx) => (
                        <div key={idx} className="mb-2">
                          <strong>Row {err.row}:</strong> {err.error}
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                )}

                {uploadResult.processedData && uploadResult.processedData.length > 0 && (
                  <Card className="mt-3">
                    <Card.Header className="bg-success text-white">
                      ✅ Successfully Processed ({uploadResult.processedData.length})
                    </Card.Header>
                    <Card.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <Table size="sm" striped>
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Combo Code</th>
                            <th>Combo Name</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResult.processedData.slice(0, 10).map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.category}</td>
                              <td><Badge bg="info">{item.comboCode}</Badge></td>
                              <td>{item.comboName}</td>
                              <td>₹{item.price?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      {uploadResult.processedData.length > 10 && (
                        <small className="text-muted">
                          ... and {uploadResult.processedData.length - 10} more
                        </small>
                      )}
                    </Card.Body>
                  </Card>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <SecondaryButton onClick={handleCloseUploadModal} disabled={uploadLoading}>
              Close
            </SecondaryButton>
            <PrimaryButton onClick={handleUploadExcel} disabled={!uploadFile || uploadLoading}>
              {uploadLoading ? (
                <>
                  <LoadingSpinner size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                '📤 Upload & Process'
              )}
            </PrimaryButton>
          </Modal.Footer>
        </StyledModal>

        {/* Product Mapping Modal */}
        <StyledModal show={showMappingModal} onHide={handleCloseMappingModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              🔗 Map Products to Combo
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedComboForMapping && (
              <>
                <Card className="mb-3">
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <h5>{selectedComboForMapping.name}</h5>
                        <div>
                          <Badge bg="info" className="me-2">{selectedComboForMapping.barcode}</Badge>
                          {selectedComboForMapping.category && (
                            <Badge bg="secondary">{selectedComboForMapping.category.name}</Badge>
                          )}
                        </div>
                      </Col>
                      <Col md={4} className="text-end">
                        <h6>Price</h6>
                        <h4 className="text-success">₹{selectedComboForMapping.price?.toFixed(2)}</h4>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Alert variant="info" className="mb-3">
                  <strong>💡 How to Map:</strong> Select products from your inventory and assign quantities to create this combo package.
                </Alert>

                {/* Add Product Section */}
                <ProductCard>
                  <Card.Body>
                    <h6 className="mb-3">➕ Add Product to Combo</h6>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Form.Label>Select Product</Form.Label>
                          <Form.Select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                          >
                            <option value="">Choose a product...</option>
                            {products.map(product => (
                              <option key={product._id} value={product._id}>
                                {product.name} - ₹{product.price} (Stock: {product.quantity})
                              </option>
                            ))}
                          </Form.Select>
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Form.Label>Quantity</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            value={productQuantity}
                            onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={2} className="d-flex align-items-end">
                        <Button
                          variant="primary"
                          onClick={handleAddProductToMapping}
                          style={{ borderRadius: '10px', width: '100%' }}
                        >
                          ➕
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </ProductCard>

                {/* Mapped Products List */}
                {mappingProducts.length > 0 && (
                  <div className="mt-3">
                    <h6 className="mb-3">📦 Products in this Combo ({mappingProducts.length})</h6>
                    <Table bordered responsive>
                      <thead className="bg-light">
                        <tr>
                          <th>Product</th>
                          <th>Unit Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappingProducts.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div>
                                <strong>{item.product.name}</strong>
                                <div>
                                  <small className="text-muted">
                                    Barcode: {item.product.barcode}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>₹{item.product.price?.toFixed(2)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleUpdateMappingQuantity(index, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </Button>
                                <span className="mx-2 fw-bold">{item.quantity}</span>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleUpdateMappingQuantity(index, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </td>
                            <td>₹{(item.product.price * item.quantity).toFixed(2)}</td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveProductFromMapping(index)}
                              >
                                🗑️
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                {mappingProducts.length === 0 && (
                  <Alert variant="warning" className="mt-3">
                    <strong>⚠️ No products added yet.</strong> Please add at least one product to map.
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <SecondaryButton onClick={handleCloseMappingModal}>
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              onClick={handleSaveProductMapping} 
              disabled={mappingProducts.length === 0 || loading}
            >
              {loading ? <LoadingSpinner size="sm" className="me-2" /> : null}
              💾 Save Mapping
            </PrimaryButton>
          </Modal.Footer>
        </StyledModal>
      </AnimatedContainer>
    </StyledContainer>
  );
};

export default Combos;
