import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Badge,
  Card,
  Spinner,
  Alert
} from 'react-bootstrap';
import styled from 'styled-components';
import CommonTable from '../components/CommonTable';

const StyledContainer = styled(Container)`
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



const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReturns([
        {
          _id: 'RET1002',
          returnId: 'RET1002',
          customer: {
            name: 'ATHVAITHA E',
            phone: '09677511479'
          },
          items: [
            {
              productId: '6922ebfe39bb8593af49cbf5',
              productName: 'sad',
              quantity: 1,
              unitPrice: 500.00,
              total: 500.00
            }
          ],
          totalAmount: 500.00,
          reason: 'warranty_claim',
          status: 'processed',
          returnDate: '2025-11-23',
          createdAt: '2025-11-23T10:30:00Z'
        },
        {
          _id: 'RET1000',
          returnId: 'RET1000',
          customer: {
            name: 'ATHVAITHA E',
            phone: '09677511479'
          },
          items: [
            {
              productId: '6921eb00290b17479852b34',
              productName: 'EswaraMoorthy M',
              quantity: 1,
              unitPrice: 1000.00,
              total: 1000.00
            }
          ],
          totalAmount: 1000.00,
          reason: 'other',
          status: 'processed',
          returnDate: '2025-11-22',
          createdAt: '2025-11-22T15:45:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Define table columns
  const returnColumns = [
    {
      key: 'returnId',
      header: 'Return ID',
      type: 'text'
    },
    {
      key: 'customer',
      header: 'Customer',
      type: 'object',
      objectKey: 'name'
    },
    {
      key: 'items',
      header: 'Items',
      type: 'badge',
      badgeConfig: {
        default: { bg: 'primary', text: 'items' }
      }
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      type: 'currency'
    },
    {
      key: 'reason',
      header: 'Reason',
      type: 'badge',
      badgeConfig: {
        warranty_claim: { bg: 'secondary', text: 'Warranty Claim' },
        defective: { bg: 'danger', text: 'Defective' },
        wrong_item: { bg: 'warning', text: 'Wrong Item' },
        other: { bg: 'info', text: 'Other' }
      }
    },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      badgeConfig: {
        pending: { bg: 'warning', text: 'Pending' },
        processed: { bg: 'info', text: 'Processed' },
        approved: { bg: 'success', text: 'Approved' },
        rejected: { bg: 'danger', text: 'Rejected' }
      }
    },
    {
      key: 'returnDate',
      header: 'Return Date',
      type: 'date'
    },
    {
      key: 'actions',
      header: 'Actions',
      type: 'actions',
      actions: [
        {
          icon: '✏️',
          variant: 'outline-info',
          onClick: (item) => console.log('Edit', item),
          title: 'Edit Return'
        },
        {
          icon: '🗑️',
          variant: 'outline-danger',
          onClick: (item) => console.log('Delete', item),
          title: 'Delete Return'
        }
      ]
    }
  ];

  const itemColumns = [
    {
      key: 'productId',
      header: 'Product ID',
      type: 'text'
    },
    {
      key: 'productName',
      header: 'Product Name',
      type: 'text'
    },
    {
      key: 'quantity',
      header: 'Quantity',
      type: 'text'
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      type: 'currency'
    },
    {
      key: 'total',
      header: 'Total',
      type: 'currency'
    }
  ];

  // Custom render function for returns table
  const renderReturnCell = (item, column) => {
    if (column.key === 'customer') {
      return (
        <div>
          <strong>{item.customer.name}</strong>
          {item.customer.phone && (
            <div>
              <small className="text-muted">{item.customer.phone}</small>
            </div>
          )}
        </div>
      );
    }
    
    if (column.key === 'items') {
      return <Badge bg="primary">{item.items.length} items</Badge>;
    }
    
    return null; // Use default rendering
  };

  if (loading) {
    return (
      <StyledContainer>
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
          <Spinner animation="border" size="lg" />
        </div>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <HeaderSection>
        <Row className="align-items-center">
          <Col>
            <h2 className="mb-0 d-flex align-items-center">
              <span style={{ fontSize: '2rem', marginRight: '1rem' }}>↩️</span>
              Returns Management
            </h2>
            <p className="text-muted mb-0 mt-2">Manage product returns and refunds</p>
          </Col>
        </Row>
      </HeaderSection>

      {returns.length === 0 ? (
        <Alert variant="info">
          <h5>No Returns Found</h5>
          <p>There are currently no product returns to display.</p>
        </Alert>
      ) : (
        <Row>
          <Col md={6}>
            {/* Returns Table */}
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Returns</h5>
              </Card.Header>
              <Card.Body>
                <CommonTable
                  columns={returnColumns}
                  data={returns}
                  renderCell={renderReturnCell}
                />
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            {/* Products Table */}
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Products</h5>
              </Card.Header>
              <Card.Body>
                <CommonTable
                  columns={[
                    {
                      key: 'productId',
                      header: 'Product ID',
                      type: 'text'
                    },
                    {
                      key: 'productName',
                      header: 'Product Name',
                      type: 'text'
                    },
                    {
                      key: 'totalQuantity',
                      header: 'Total Quantity',
                      type: 'text'
                    },
                    {
                      key: 'unitPrice',
                      header: 'Unit Price',
                      type: 'currency'
                    },
                    {
                      key: 'totalValue',
                      header: 'Total Value',
                      type: 'currency'
                    }
                  ]}
                  data={(() => {
                    const productMap = new Map();
                    returns.forEach(returnItem => {
                      returnItem.items.forEach(item => {
                        if (productMap.has(item.productId)) {
                          const existing = productMap.get(item.productId);
                          existing.totalQuantity += item.quantity;
                          existing.totalValue += item.total;
                        } else {
                          productMap.set(item.productId, {
                            productId: item.productId,
                            productName: item.productName,
                            totalQuantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalValue: item.total
                          });
                        }
                      });
                    });
                    return Array.from(productMap.values());
                  })()}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </StyledContainer>
  );
};

export default Returns;