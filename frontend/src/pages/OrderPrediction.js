import React, { useState } from 'react';
import { Clock, MapPin, Star, Package, Truck, CheckCircle, RotateCcw, ChevronDown, Filter } from 'lucide-react';
import './OrderHistory.css'; 

const PastOrdersPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const pastOrders = [
    // ...your orders array (unchanged, so omit here for brevity)...
    // Copy your array from your code
    // I’ll use the same data as in your original code
    
    {
      id: '#FF2024004',
      date: '2024-05-20',
      status: 'cancelled',
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 12.98, image: '/api/placeholder/60/60' }
      ],
      total: 22,
      deliveryAddress: '123 Main Street, Islamabad',
      estimatedTime: '25-30 mins',
      actualTime: null,
      rating: null
    },
    
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={20} className="ff-orders-status-icon ff-orders-delivered" />;
      case 'cancelled':
        return <RotateCcw size={20} className="ff-orders-status-icon ff-orders-cancelled" />;
      default:
        return <Package size={20} className="ff-orders-status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#f39c12';
    }
  };

  const filteredOrders = pastOrders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.status === selectedFilter;
  });

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="ff-orders-rating">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'ff-orders-star ff-orders-filled' : 'ff-orders-star'}
          />
        ))}
      </div>
    );
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="ff-orders-container">
      <main className="ff-orders-main-content">
        <div className="ff-orders-inner-container">
          <div className="ff-orders-page-header">
            <h1 className="ff-orders-title">Next Order Prediction</h1>
            <p>What to eat next? Don't worry FastFeast got you covered</p>
          </div>
          
          <div className="ff-orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="ff-orders-order-card">
                <div className="ff-orders-order-header" onClick={() => toggleOrderExpansion(order.id)}>
                  <div className="ff-orders-order-info">
                    
                    
                  </div>
                  <div className="ff-orders-order-summary">
                    <div className="ff-orders-order-items-preview">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="ff-orders-item-preview">
                          <div className="ff-orders-item-image">
                            <div className="ff-orders-placeholder-image">🍕</div>
                          </div>
                          <span className="ff-orders-item-name">{item.name}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="ff-orders-more-items">+{order.items.length - 2} more</span>
                      )}
                    </div>
                    <div className="ff-orders-order-total">
                      <span className="ff-orders-total-amount">PKR {order.total}</span>
                      <ChevronDown 
                        size={20} 
                        className={`ff-orders-expand-icon ${expandedOrder === order.id ? 'ff-orders-expanded' : ''}`}
                      />
                    </div>
                  </div>
                </div>
                {expandedOrder === order.id && (
                  <div className="ff-orders-order-details">
                    <div className="ff-orders-details-grid">
                      <div className="ff-orders-items-section">
                        <h4>Items Ordered</h4>
                        <div className="ff-orders-items-list">
                          {order.items.map((item, index) => (
                            <div key={index} className="ff-orders-order-item">
                              <div className="ff-orders-item-image">
                                <div className="ff-orders-placeholder-image">🍕</div>
                              </div>
                              <div className="ff-orders-item-info">
                                <span className="ff-orders-item-name">{item.name}</span>
                                <span className="ff-orders-item-quantity">Quantity: {item.quantity}</span>
                              </div>
                              <span className="ff-orders-item-price">PKR {item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ff-orders-delivery-section">
                        <h4>Delivery Details</h4>
                        <div className="ff-orders-delivery-info">
                          <div className="ff-orders-info-item">
                            <MapPin size={16} />
                            <span>{order.deliveryAddress}</span>
                          </div>
                          <div className="ff-orders-info-item">
                            <Clock size={16} />
                            <span>
                              Estimated: {order.estimatedTime}
                              {order.actualTime && ` | Actual: ${order.actualTime}`}
                            </span>
                          </div>
                          {order.rating && (
                            <div className="ff-orders-info-item">
                              <span>Your Rating:</span>
                              {renderStars(order.rating)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ff-orders-order-actions">
                      {order.status === 'delivered' && (
                        <>
                          <button className="ff-orders-btn ff-orders-btn-primary">Reorder</button>
                          <button className="ff-orders-btn ff-orders-btn-secondary">Leave Review</button>
                        </>
                      )}
                      <button className="ff-orders-btn ff-orders-btn-outline">View Receipt</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {filteredOrders.length === 0 && (
            <div className="ff-orders-empty-state">
              <Package size={80} className="ff-orders-empty-icon" />
              <h3>No orders found</h3>
              <p>You haven't placed any orders yet. Start exploring our delicious menu!</p>
              <button className="ff-orders-btn ff-orders-btn-primary">Browse Menu</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PastOrdersPage;
