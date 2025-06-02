import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import "./Cart.css";
import axios from "axios";

const TAX_RATE = 0.08;
const DELIVERY_FEE = 0.0;

const CartPage = ({
  user,
  cart: guestCart,
  menuItems,
  onBackToHome,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onProceedToCheckout,
  setCart // For syncing with App.js state
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [cart, setLocalCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart for logged-in user from backend
  useEffect(() => {
  let isMounted = true;
  if (user) {
    setLoading(true);
    axios
      .get("/api/cart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => {
        const normalized = res.data.items.map(i => ({
          ...i.menuItem,
          quantity: i.quantity,
          id: i.menuItem._id
        }));
        if (isMounted) {
          setLocalCart(normalized);
          if (setCart) setCart(normalized);
          setLoading(false);
        }
      })
      .catch(() => {
        setLocalCart([]);
        setLoading(false);
      });
  } else {
    const guestCartArr = (guestCart || []).map(cartItem => {
      const product = menuItems.find(mi => mi._id === cartItem.menuItemId);
      if (!product) return null;
      return { ...product, quantity: cartItem.quantity, id: cartItem.menuItemId };
    }).filter(Boolean);
    setLocalCart(guestCartArr);
    if (setCart) setCart(guestCartArr);
  }
  return () => { isMounted = false; };
}, [user, guestCart, menuItems, setCart]);


  // Cart operations
  const updateCartQuantity = async (itemId, newQty) => {
    if (user) {
      await axios.post(
        "/api/cart/update",
        { menuItemId: itemId, quantity: newQty },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      // Refetch to stay in sync
      const res = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setLocalCart(res.data.items.map(i => ({
        ...i.menuItem,
        quantity: i.quantity,
        id: i.menuItem._id
      })));
      if (setCart) setCart(res.data.items);
    } else {
      onUpdateCartQuantity(itemId, newQty);
    }
  };

  const removeFromCart = async (itemId) => {
    if (user) {
      await axios.post(
        "/api/cart/remove",
        { menuItemId: itemId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const res = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setLocalCart(res.data.items.map(i => ({
        ...i.menuItem,
        quantity: i.quantity,
        id: i.menuItem._id
      })));
      if (setCart) setCart(res.data.items);
    } else {
      onRemoveFromCart(itemId);
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const discount = promoApplied && promoCode.toUpperCase() === "FASTFEAST20" ? subtotal * 0.2 : 0;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax + DELIVERY_FEE;

  // Promo logic
  const applyPromo = () => {
    if (promoCode.trim() === "") {
      setPromoMessage("Please enter a promo code.");
      setPromoApplied(false);
    } else if (promoCode.toUpperCase() === "FASTFEAST20") {
      setPromoApplied(true);
      setPromoMessage("Promo code applied! 20% discount.");
    } else {
      setPromoMessage("Invalid promo code.");
      setPromoApplied(false);
    }
  };

  const removePromo = () => {
    setPromoApplied(false);
    setPromoCode("");
    setPromoMessage("");
  };

  return (
    <div className="ff-cart-page">
      <div className="ff-cart-container">
        <h1 className="ff-cart-title">Your Cart</h1>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>
        ) : cart.length === 0 ? (
          <div className="ff-cart-empty-cart">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="ff-cart-items">
              {cart.map((item) => (
                <div key={item.id} className="ff-cart-item">
                  <div className="ff-cart-item-content">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="ff-cart-item-img"
                    />
                    <div className="ff-cart-item-details">
                      <h3 className="ff-cart-item-name">{item.name}</h3>
                      <p className="ff-cart-item-desc">{item.description}</p>
                    </div>
                    <div className="ff-cart-item-controls">
                      <div className="ff-cart-quantity-controls">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="ff-cart-quantity-btn"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="ff-cart-quantity-display">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="ff-cart-quantity-btn"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="ff-cart-item-price">
                        PKR {(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ff-cart-remove-btn"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ff-cart-bottom-section">
              {/* Promo Code Section */}
              <div className="ff-cart-promo-section">
                <h2 className="ff-cart-section-title ff-cart-dancing">
                  Promo Code
                </h2>
                {promoApplied ? (
                  <div className="ff-cart-promo-applied">
                    <div className="ff-cart-promo-applied-header">
                      <span className="ff-cart-promo-applied-code">
                        {promoCode.toUpperCase()}
                      </span>
                      <button
                        onClick={removePromo}
                        className="ff-cart-remove-promo-btn"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="ff-cart-promo-applied-savings">
                      You saved PKR {discount.toFixed(2)}!
                    </div>
                  </div>
                ) : (
                  <div className="ff-cart-promo-input-group">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="ff-cart-promo-input"
                    />
                    <button onClick={applyPromo} className="ff-cart-apply-btn">
                      Apply
                    </button>
                  </div>
                )}
                {promoMessage && !promoApplied && (
                  <div className={`ff-cart-promo-message error`}>
                    {promoMessage}
                  </div>
                )}
              </div>
              {/* Order Summary */}
              <div className="ff-cart-checkout-section">
                <h2 className="ff-cart-section-title ff-cart-dancing">Order Summary</h2>
                <div className="ff-cart-order-summary">
                  <div className="ff-cart-summary-row">
                    <span>Subtotal</span>
                    <span>PKR {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="ff-cart-summary-row ff-cart-discount">
                      <span>Discount ({promoCode.toUpperCase()})</span>
                      <span>-PKR {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="ff-cart-summary-row">
                    <span>Tax (8%)</span>
                    <span>PKR {tax.toFixed(2)}</span>
                  </div>
                  <div className="ff-cart-summary-row">
                    <span>Delivery Fee</span>
                    <span>PKR {DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                  <div className="ff-cart-summary-row ff-cart-total">
                    <span>Total</span>
                    <span>PKR {total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!user) {
                      alert("Please sign in to proceed to checkout!");
                    } else {
                      onProceedToCheckout();
                    }
                  }}
                  className="ff-cart-checkout-btn"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
