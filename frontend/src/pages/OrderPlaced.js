import React from "react";
import { CheckCircle, Clock, MapPin, Phone, Mail } from "lucide-react";
import "./OrderPlaced.css";

const OrderSuccessPage = ({ order }) => {
  if (!order) return <div>Order not found.</div>;
  return (
    <div className="ff-order-success-container">
      <main className="ff-order-success-main-content">
        <div className="ff-order-success-inner-container">
          <div className="ff-order-success-card">
            <div className="ff-order-success-icon">
              <div className="ff-order-success-animated-check">
                <CheckCircle size={80} />
              </div>
            </div>
            <h1 className="ff-order-success-title">
              Order Placed Successfully!
            </h1>
            <p className="ff-order-success-subtitle">
              Thank you for choosing FastFeast. Your delicious meal is being
              prepared with love!
            </p>
            <div className="ff-order-success-order-info">
              <div className="ff-order-success-order-number">
                <h3>Order Number: {order.orderNumber || "N/A"}</h3>
              </div>
              <div className="ff-order-success-estimated-time">
                <Clock className="ff-order-success-icon-inline" size={20} />
                <span>Estimated delivery time: 25-30 minutes</span>
              </div>
            </div>
            <div className="ff-order-success-order-summary">
              <h3>Order Summary</h3>
              <div className="ff-order-success-order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="ff-order-success-order-item">
                    <div className="ff-order-success-item-details">
                      <span className="ff-order-success-item-name">
                        {item.name}
                      </span>
                      <span className="ff-order-success-item-quantity">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="ff-order-success-item-price">
                      PKR {item.price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="ff-order-success-order-totals">
                <div className="ff-order-success-total-row">
                  <span>Subtotal:</span>
                  <span>PKR {order.subtotal}</span>
                </div>
                <div className="ff-order-success-total-row">
                  <span>Delivery Fee:</span>
                  <span>PKR {order.deliveryFee}</span>
                </div>
                <div className="ff-order-success-total-row ff-order-success-final-total">
                  <span>Total:</span>
                  <span>PKR {order.total}</span>
                </div>
              </div>
            </div>
            <div className="ff-order-success-delivery-info">
              <h3>Delivery Information</h3>
              <div className="ff-order-success-delivery-details">
                <div className="ff-order-success-delivery-item">
                  <MapPin className="ff-order-success-icon-inline" size={18} />
                  <span>
                    {order.addressInfo?.street}, {order.addressInfo?.city},{" "}
                    {order.addressInfo?.state}, {order.addressInfo?.country},{" "}
                    {order.addressInfo?.zipCode}
                  </span>
                </div>
                <div className="ff-order-success-delivery-item">
                  <Phone className="ff-order-success-icon-inline" size={18} />
                  <span>{order.contactInfo?.phone}</span>
                </div>
              </div>
            </div>
            <div className="ff-order-success-action-buttons">
              <button className="ff-order-success-btn ff-order-success-btn-primary">
                Track Your Order
              </button>
              <button className="ff-order-success-btn ff-order-success-btn-secondary">
                Continue Shopping
              </button>
            </div>
            <div className="ff-order-success-additional-info">
              <p>
                We'll send you updates via SMS. For any queries, contact us at:
              </p>
              <div className="ff-order-success-contact-info">
                <Phone className="ff-order-success-icon-inline" size={16} />
                <span>+92 312456789</span>
                <Mail className="ff-order-success-icon-inline" size={16} />
                <span>contact@fastfeast.com</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccessPage;
