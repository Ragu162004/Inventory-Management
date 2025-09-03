import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { productsAPI, vendorsAPI } from '../services/api';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-8px);}
  60% {transform: translateY(-4px);}
`;

const progressBar = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

const zoomIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

// Styled Components
const PageContainer = styled.div`
  padding: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PageTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-weight: 700;
  position: relative;
  padding-bottom: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(to right, #3498db);
    border-radius: 2px;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(to right, #3498db);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
    animation: ${pulse} 1s;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AlertMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  animation: ${slideIn} 0.3s ease-out;
  
  ${props => props.variant === 'success' && css`
    background: rgba(46, 204, 113, 0.15);
    color: #27ae60;
    border-left: 4px solid #27ae60;
  `}
  
  ${props => props.variant === 'danger' && css`
    background: rgba(231, 76, 60, 0.15);
    color: #e74c3c;
    border-left: 4px solid #e74c3c;
  `}
`;

const CloseAlert = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  margin-left: auto;
  padding: 0.2rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead {
    background: linear-gradient(to right, #3498db);
    color: white;
  }
  
  th {
    padding: 1.2rem 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  tbody tr {
    border-bottom: 1px solid #f1f2f6;
    transition: all 0.3s ease;
    
    &:hover {
      background: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  td {
    padding: 1rem;
    color: #2c3e50;
  }
  
  /* Make S.No column narrower */
  th:first-child, td:first-child {
    width: 60px;
    text-align: center;
  }
  
  @media (max-width: 1200px) {
    th:nth-child(5),
    td:nth-child(5) {
      display: none;
    }
  }
  
  @media (max-width: 992px) {
    th:nth-child(4),
    td:nth-child(4) {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    th:nth-child(7),
    td:nth-child(7) {
      display: none;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch(props.variant) {
      case 'critical': return css`
        background: rgba(231, 76, 60, 0.15);
        color: #e74c3c;
        animation: ${pulse} 2s infinite;
      `;
      case 'low': return css`
        background: rgba(241, 196, 15, 0.15);
        color: #f39c12;
      `;
      case 'good': return css`
        background: rgba(46, 204, 113, 0.15);
        color: #27ae60;
      `;
      default: return css`
        background: #f1f2f6;
        color: #7f8c8d;
      `;
    }
  }}
`;

const StockIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: #f1f2f6;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
  
  ${props => {
    const percentage = (props.current / props.max) * 100;
    
    if (percentage <= 20) return css`
      background: #e74c3c;
      width: ${percentage}%;
    `;
    if (percentage <= 50) return css`
      background: #f39c12;
      width: ${percentage}%;
    `;
    return css`
      background: #2ecc71;
      width: ${percentage}%;
    `;
  }}
`;

const ActionCell = styled.td`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const IconButton = styled.button`
  background: ${props => props.variant === 'edit' 
    ? 'rgba(52, 152, 219, 0.1)' 
    : 'rgba(231, 76, 60, 0.1)'};
  color: ${props => props.variant === 'edit' 
    ? '#3498db' 
    : '#e74c3c'};
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.variant === 'edit' 
      ? 'rgba(52, 152, 219, 0.2)' 
      : 'rgba(231, 76, 60, 0.2)'};
    transform: translateY(-2px);
    animation: ${bounce} 0.8s ease;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  
  i {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
    color: #bdc3c7;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f1f2f6;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
   0% { transform: rotate(0deg); }
   100% { transform: rotate(360deg); }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: ${slideIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f1f2f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0.2rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #f1f2f6;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #f1f2f6;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #f1f2f6;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #f1f2f6;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const SecondaryButton = styled.button`
  background: #f1f2f6;
  color: #7f8c8d;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e4e6eb;
    transform: translateY(-2px);
  }
`;

const PrimaryButton = styled.button`
  background: linear-gradient(to right, #3498db);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
    animation: ${pulse} 1s;
  }
`;

const ImagePreview = styled.div`
  margin-top: 0.5rem;
  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    border: 2px solid #f1f2f6;
  }
`;

const RemoveImageButton = styled.button`
  margin-top: 0.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: #c0392b;
  }
`;

const DownloadButton = styled.a`
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(46, 204, 113, 0.2);
    transform: translateY(-2px);
  }
`;

// Image Preview Modal Styles
const ImagePreviewModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ImagePreviewContainer = styled.div`
  max-width: 90vw;
  max-height: 90vh;
  animation: ${zoomIn} 0.3s ease-out;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
`;

const ClosePreviewButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    minquantity: '',
    quantity: '',
    vendor: '',
    photo: null,
    imagePreview: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchVendors();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: product.price,
        minquantity: product.minquantity,
        quantity: product.quantity,
        vendor: product.vendor?._id || '',
        photo: null,
        imagePreview: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        minquantity: '',
        quantity: '',
        vendor: '',
        photo: null,
        imagePreview: ''
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        photo: file,
        imagePreview: previewUrl
      }));
      
      setError('');
    }
  };

  const removeImage = () => {
    // Cleanup preview URL to prevent memory leaks
    if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    
    setFormData(prev => ({
      ...prev,
      imagePreview: '',
      photo: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        minquantity: parseInt(formData.minquantity),
        quantity: parseInt(formData.quantity),
        vendor: formData.vendor,
        photo: formData.photo // Include the file for upload
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productData);
        setSuccess('Product updated successfully!');
      } else {
        await productsAPI.create(productData);
        setSuccess('Product created successfully!');
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      setError('Failed to save product. Please try again.');
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        setSuccess('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        setError('Failed to delete product. Please try again.');
      }
    }
  };

  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  const getStockStatus = (quantity, minquantity) => {
    if (quantity <= minquantity) return 'critical';
    return 'good';
  };

  const getStockStatusText = (quantity, minquantity) => {
    if (quantity <= minquantity) return 'CRITICAL';
    return 'GOOD';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const openImagePreview = (imageUrl) => {
    setImagePreview(imageUrl);
  };

  const closeImagePreview = () => {
    setImagePreview(null);
  };

  const ProductImage = ({ product }) => {
    if (product.image) {
      return (
        <img 
          src={product.image} 
          alt={product.name}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            objectFit: 'cover',
            cursor: 'pointer'
          }}
          onClick={() => openImagePreview(product.image)}
        />
      );
    }

    return (
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        {product.name.charAt(0)}
      </div>
    );
  };

  // Function to handle barcode download (fetch as blob for cross-browser support)
  const downloadBarcode = async (barcode, productName) => {
    if (!barcode) return;
    try {
      const response = await fetch(`http://localhost:5000/api/barcode/${barcode}/barcode-image`);
      if (!response.ok) throw new Error('Failed to fetch barcode image');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `barcode-${barcode}-${productName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download barcode image.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Products Management</PageTitle>
        <ActionButton onClick={() => handleShowModal()}>
          <i className="bi bi-plus-circle"></i>
          Add New Product
        </ActionButton>
      </PageHeader>

      {error && (
        <AlertMessage variant="danger">
          <i className="bi bi-exclamation-circle"></i>
          {error}
          <CloseAlert onClick={clearAlerts}>
            <i className="bi bi-x"></i>
          </CloseAlert>
        </AlertMessage>
      )}

      {success && (
        <AlertMessage variant="success">
          <i className="bi bi-check-circle"></i>
          {success}
          <CloseAlert onClick={clearAlerts}>
            <i className="bi bi-x"></i>
          </CloseAlert>
        </AlertMessage>
      )}

      <TableContainer>
        {products.length > 0 ? (
          <StyledTable>
            <thead>
              <tr>
                <th>S.No</th> {/* Added Serial Number column */}
                <th>Product</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Price</th>
                <th>Min Quantity</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td> {/* Serial Number */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ProductImage product={product} />
                      {product.name}
                    </div>
                  </td>
                  <td>{product.barcode || '-'}</td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.minquantity}</td>
                  <td>
                    <StockIndicator>
                      <span>{product.quantity}</span>
                      <ProgressBar>
                        <ProgressFill 
                          current={product.quantity} 
                          max={Math.max(product.quantity * 2, 100)} 
                        />
                      </ProgressBar>
                    </StockIndicator>
                  </td>
                  <td>
                    <StatusBadge variant={getStockStatus(product.quantity, product.minquantity)}>
                      {getStockStatusText(product.quantity, product.minquantity)}
                    </StatusBadge>
                  </td>
                  <ActionCell>
                    <IconButton 
                      variant="edit" 
                      onClick={() => handleShowModal(product)}
                      title="Edit Product"
                    >
                      <i className="bi bi-pencil"></i>
                    </IconButton>
                    <IconButton 
                      variant="danger" 
                      onClick={() => handleDelete(product._id)}
                      title="Delete Product"
                    >
                      <i className="bi bi-trash"></i>
                    </IconButton>
                    {product.barcode ? (
                      <DownloadButton
                        href="#"
                        onClick={async (e) => {
                          e.preventDefault();
                          await downloadBarcode(product.barcode, product.name);
                        }}
                      >
                        <i className="bi bi-download"></i>
                      </DownloadButton>
                    ) : '-'}
                  </ActionCell>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        ) : (
          <EmptyState>
            <i className="bi bi-box"></i>
            <h3>No Products Found</h3>
            <p>Get started by adding your first product.</p>
          </EmptyState>
        )}
      </TableContainer>

      {showModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <i className="bi bi-x"></i>
              </CloseButton>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
              <ModalBody>
                <FormGrid>
                  <FormGroup>
                    <Label>Name </Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter product name"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Category </Label>
                    <Input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter category"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Price </Label>
                    <Input
                      type="number"
                      step="1"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Min Quantity </Label>
                    <Input
                      type="number"
                      step="1"
                      name="minquantity"
                      value={formData.minquantity}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Quantity </Label>
                    <Input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Vendor </Label>
                    <Select
                      name="vendor"
                      value={formData.vendor}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.name}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Product Image</Label>
                    <Input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {formData.imagePreview && (
                      <ImagePreview>
                        <img src={formData.imagePreview} alt="Preview" />
                        <RemoveImageButton type="button" onClick={removeImage}>
                          Remove Image
                        </RemoveImageButton>
                      </ImagePreview>
                    )}
                  </FormGroup>
                </FormGrid>

                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                  />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <SecondaryButton type="button" onClick={handleCloseModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton 
                  type="submit"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </PrimaryButton>
              </ModalFooter>
            </form>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <ImagePreviewModal onClick={closeImagePreview}>
          <ClosePreviewButton onClick={closeImagePreview}>
            <i className="bi bi-x"></i>
          </ClosePreviewButton>
          <ImagePreviewContainer onClick={(e) => e.stopPropagation()}>
            <PreviewImage src={imagePreview} alt="Product preview" />
          </ImagePreviewContainer>
        </ImagePreviewModal>
      )}
    </PageContainer>
  );
};

export default Products;