import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Package, Truck, CheckCircle, RotateCcw, ChevronDown, Filter } from 'lucide-react';
import axios from 'axios';
import './OrderHistory.css';

const PastOrdersPage = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // User must be logged in
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/orders/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data || []);
      } catch (err) {
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

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

  // Filtering based on status
  const filteredOrders = orders.filter(order => {
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
            <h1 className="ff-orders-title">Your Order History</h1>
            <p>Track your delicious journey with FastFeast</p>
          </div>
          <div className="ff-orders-filter-section">
            <div className="ff-orders-filter-group">
              <Filter size={20} />
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="ff-orders-filter-select"
              >
                <option value="all">All Orders</option>
                <option value="delivered">Delivered</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="ff-orders-orders-count">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {loading ? (
            <div style={{textAlign: "center", marginTop: 32}}>Loading...</div>
          ) : (
          <div className="ff-orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="ff-orders-order-card">
                <div className="ff-orders-order-header" onClick={() => toggleOrderExpansion(order._id)}>
                  <div className="ff-orders-order-info">
                    <div className="ff-orders-order-number-date">
                      <h3 className="ff-orders-order-number">
                        #{order.orderNumber || order._id?.slice(-6)}
                      </h3>
                      <span className="ff-orders-order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="ff-orders-order-status">
                      {getStatusIcon(order.status)}
                      <span style={{ color: getStatusColor(order.status), textTransform: 'capitalize' }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="ff-orders-order-summary">
                    <div className="ff-orders-order-items-preview">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <div key={index} className="ff-orders-item-preview">
                          <div className="ff-orders-item-image">
                            <div className="ff-orders-placeholder-image">🍕</div>
                          </div>
                          <span className="ff-orders-item-name">{item.name}</span>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <span className="ff-orders-more-items">+{order.items.length - 2} more</span>
                      )}
                    </div>
                    <div className="ff-orders-order-total">
                      <span className="ff-orders-total-amount">PKR {order.total}</span>
                      <ChevronDown 
                        size={20} 
                        className={`ff-orders-expand-icon ${expandedOrder === order._id ? 'ff-orders-expanded' : ''}`}
                      />
                    </div>
                  </div>
                </div>
                {expandedOrder === order._id && (
                  <div className="ff-orders-order-details">
                    <div className="ff-orders-details-grid">
                      <div className="ff-orders-items-section">
                        <h4>Items Ordered</h4>
                        <div className="ff-orders-items-list">
                          {order.items?.map((item, index) => (
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
                            <span>
                              {order.addressInfo
                                ? `${order.addressInfo.street}, ${order.addressInfo.city}, ${order.addressInfo.state}, ${order.addressInfo.country}, ${order.addressInfo.zipCode}`
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="ff-orders-info-item">
                            <Clock size={16} />
                            <span>
                              Ordered at: {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {/* Add more details if needed */}
                        </div>
                      </div>
                    </div>
                    <div className="ff-orders-order-actions">
                      <button className="ff-orders-btn ff-orders-btn-outline">View Receipt</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}

          {(!loading && filteredOrders.length === 0) && (
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
