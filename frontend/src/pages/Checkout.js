import React, { useState, useRef, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import {
  MapPin,
  User,
  CreditCard,
  Lock,
  AlertCircle,
  Navigation,
} from "lucide-react";
import "./Checkout.css";

const MAPBOX_ACCESS_TOKEN = "your_key_here";
const initialCountry = "Pakistan";
const TAX_RATE = 0.08;
const DELIVERY_FEE = 0;

// Utility to generate a random order number
const generateOrderNumber = () => {
  return "FF" + Math.floor(1000000 + Math.random() * 9000000);
};

const CheckoutPage = ({ cart, menuItems, user, onOrderPlaced }) => {
  // --- STATES
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [addressInfo, setAddressInfo] = useState({
    street: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: initialCountry,
  });
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState("");

  // Mapbox
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [lng] = useState(73.0479);
  const [lat] = useState(33.6844);
  const [zoom] = useState(12);

  // Stripe
  const stripe = useStripe();
  const elements = useElements();

  // --- CART LOGIC
  const getItemInfo = (cartItem) => {
  // For logged-in user, cartItem is already normalized:
  if (cartItem.id && cartItem.price) {
    // Already a product object
    return cartItem;
  } else if (cartItem.menuItem) {
    // In case you ever get the old structure
    return {
      ...cartItem.menuItem,
      quantity: cartItem.quantity,
      id: cartItem.menuItem._id,
    };
  } else {
    // guest
    const product = menuItems.find((mi) => mi._id === cartItem.menuItemId);
    return {
      ...product,
      quantity: cartItem.quantity,
      id: cartItem.menuItemId,
    };
  }
};
  const displayCart = (cart || []).map(getItemInfo).filter(Boolean);

  const subtotal = displayCart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const discount = 0;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax + DELIVERY_FEE;

  // --- MAPBOX SCRIPTS
  useEffect(() => {
    if (!window.mapboxgl) {
      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
      script.onload = () => {
        const link = document.createElement("link");
        link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
        link.rel = "stylesheet";
        document.head.appendChild(link);
      };
      document.head.appendChild(script);
    }
  }, []);
  useEffect(() => {
    if (
      isMapVisible &&
      mapContainer.current &&
      window.mapboxgl &&
      !map.current
    ) {
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: zoom,
        accessToken: MAPBOX_ACCESS_TOKEN,
      });
      map.current.addControl(new window.mapboxgl.NavigationControl());
      const geolocate = new window.mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map.current.addControl(geolocate);

      map.current.on("click", async (e) => {
        const { lng: clickLng, lat: clickLat } = e.lngLat;
        setIsGeocodingLoading(true);
        try {
          if (marker.current) marker.current.remove();
          marker.current = new window.mapboxgl.Marker({ color: "#dc2626" })
            .setLngLat([clickLng, clickLat])
            .addTo(map.current);
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${clickLng},${clickLat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=pk&types=address,poi&limit=1`
          );
          if (!response.ok) throw new Error("Geocoding request failed");
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const context = feature.context || [];
            const fullStreet = feature.place_name || "";
            let city = "",
              state = "",
              zipCode = "";
            context.forEach((item) => {
              if (item.id.includes("place")) city = item.text;
              else if (item.id.includes("region")) state = item.text;
              else if (item.id.includes("postcode")) zipCode = item.text;
            });
            if (!city) city = "Islamabad";
            if (!state) state = "Islamabad Capital Territory";
            setAddressInfo((prev) => ({
              ...prev,
              street: fullStreet,
              city,
              state,
              zipCode: zipCode || "",
            }));
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.street;
              delete newErrors.city;
              delete newErrors.state;
              return newErrors;
            });
          } else {
            setAddressInfo((prev) => ({
              ...prev,
              street: `Location at ${clickLat.toFixed(6)}, ${clickLng.toFixed(
                6
              )}`,
              city: prev.city || "Islamabad",
              state: prev.state || "Islamabad Capital Territory",
            }));
          }
        } catch (error) {
          setAddressInfo((prev) => ({
            ...prev,
            street: `Selected Location (${clickLat.toFixed(
              4
            )}, ${clickLng.toFixed(4)})`,
            city: prev.city || "Islamabad",
            state: prev.state || "Islamabad Capital Territory",
          }));
        } finally {
          setIsGeocodingLoading(false);
        }
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }
  }, [isMapVisible, lng, lat, zoom]);

  // Map handlers
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsGeocodingLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              duration: 2000,
            });
            map.current.fire("click", {
              lngLat: { lng: longitude, lat: latitude },
            });
          }
          setIsGeocodingLoading(false);
        },
        () => {
          setIsGeocodingLoading(false);
          alert(
            "Could not get your current location. Please select manually on the map."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!contactInfo.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!contactInfo.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!contactInfo.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(contactInfo.email))
      newErrors.email = "Email is invalid";
    if (!contactInfo.phone.trim()) newErrors.phone = "Phone number is required";
    if (!addressInfo.street.trim())
      newErrors.street = "Street address is required";
    if (!addressInfo.city.trim()) newErrors.city = "City is required";
    if (!addressInfo.state.trim()) newErrors.state = "State is required";
    if (!addressInfo.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!addressInfo.country.trim()) newErrors.country = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactChange = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };
  const handleAddressChange = (field, value) => {
    setAddressInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // --- MAIN PLACE ORDER
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    setPaymentError("");
    try {
      // Stripe Payment (demo, NOT a real charge without PaymentIntent)
      if (!stripe || !elements) {
        setPaymentError("Stripe not loaded.");
        setIsProcessing(false);
        return;
      }
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: contactInfo.firstName + " " + contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: {
            line1: addressInfo.street,
            line2: addressInfo.apartment,
            city: addressInfo.city,
            state: addressInfo.state,
            postal_code: addressInfo.zipCode,
            country: addressInfo.country === "Pakistan" ? "PK" : "US",
          },
        },
      });
      if (error) {
        setPaymentError("Payment failed: " + error.message);
        setIsProcessing(false);
        return;
      }

      // --- PREPARE ORDER OBJECT
      const orderNumber = generateOrderNumber();
      const items = displayCart.map((item) => ({
        menuItem: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const deliveryInfo = {
        name: contactInfo.firstName + " " + contactInfo.lastName,
        phone: contactInfo.phone,
        address: `${addressInfo.street}, ${addressInfo.city}, ${addressInfo.state}, ${addressInfo.country}, ${addressInfo.zipCode}`,
      };

      // --- POST TO BACKEND ---
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/orders",
        {
          cart: displayCart, // this is your cart array of {id, name, price, quantity}
          subtotal,
          tax,
          discount,
          deliveryFee: DELIVERY_FEE,
          total,
          contactInfo,
          addressInfo,
          // orderNumber, status, paymentMethod are handled in backend
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      // Pass order data up, redirect to order placed page
      if (response.data && response.data._id) {
        // _id always exists if order saved
        if (typeof onOrderPlaced === "function") onOrderPlaced(response.data);
      } else {
        alert("Order placed, but no order data returned.");
      }
    } catch (err) {
      setPaymentError(
        "Order failed: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMapVisibility = () => {
    setIsMapVisible(!isMapVisible);
    if (isMapVisible && map.current) {
      map.current.remove();
      map.current = null;
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    }
  };

  // -- RENDER
  return (
    <div className="fco-checkout-page">
      <div className="fco-checkout-container">
        <h1 className="fco-checkout-title">Checkout</h1>
        <div className="fco-checkout-content">
          {/* Form */}
          <div className="fco-checkout-form">
            {/* Contact Info */}
            <div className="fco-form-section">
              <div className="fco-section-header">
                <User className="fco-section-icon" />
                <h2 className="fco-section-title">Contact Information</h2>
              </div>
              <div className="fco-form-grid fco-two-col">
                <div className="fco-form-group">
                  <label className="fco-form-label">First Name *</label>
                  <input
                    type="text"
                    className={`fco-form-input ${
                      errors.firstName ? "fco-error" : ""
                    }`}
                    value={contactInfo.firstName}
                    onChange={(e) =>
                      handleContactChange("firstName", e.target.value)
                    }
                    placeholder="John"
                    required
                  />
                  {errors.firstName && (
                    <span className="fco-error-message">
                      <AlertCircle size={14} /> {errors.firstName}
                    </span>
                  )}
                </div>
                <div className="fco-form-group">
                  <label className="fco-form-label">Last Name *</label>
                  <input
                    type="text"
                    className={`fco-form-input ${
                      errors.lastName ? "fco-error" : ""
                    }`}
                    value={contactInfo.lastName}
                    onChange={(e) =>
                      handleContactChange("lastName", e.target.value)
                    }
                    placeholder="Doe"
                    required
                  />
                  {errors.lastName && (
                    <span className="fco-error-message">
                      <AlertCircle size={14} /> {errors.lastName}
                    </span>
                  )}
                </div>
                <div className="fco-form-group">
                  <label className="fco-form-label">Email *</label>
                  <input
                    type="email"
                    className={`fco-form-input ${
                      errors.email ? "fco-error" : ""
                    }`}
                    value={contactInfo.email}
                    onChange={(e) =>
                      handleContactChange("email", e.target.value)
                    }
                    placeholder="john@example.com"
                    required
                  />
                  {errors.email && (
                    <span className="fco-error-message">
                      <AlertCircle size={14} /> {errors.email}
                    </span>
                  )}
                </div>
                <div className="fco-form-group">
                  <label className="fco-form-label">Phone *</label>
                  <input
                    type="tel"
                    className={`fco-form-input ${
                      errors.phone ? "fco-error" : ""
                    }`}
                    value={contactInfo.phone}
                    onChange={(e) =>
                      handleContactChange("phone", e.target.value)
                    }
                    placeholder="+92 300 1234567"
                    required
                  />
                  {errors.phone && (
                    <span className="fco-error-message">
                      <AlertCircle size={14} /> {errors.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Address */}
            <div className="fco-form-section">
              <div className="fco-section-header">
                <MapPin className="fco-section-icon" />
                <h2 className="fco-section-title">Delivery Address</h2>
                {isGeocodingLoading && (
                  <div className="fco-geocoding-loader">
                    <div className="fco-loading-spinner" />
                    <span>Getting address...</span>
                  </div>
                )}
              </div>
              <div className="fco-map-section">
                <div className="fco-map-controls">
                  <button
                    type="button"
                    onClick={toggleMapVisibility}
                    className="fco-map-toggle"
                  >
                    <MapPin size={16} />
                    {isMapVisible ? "Hide Map" : "Select Address on Map"}
                  </button>
                  {isMapVisible && (
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="fco-location-btn"
                      disabled={isGeocodingLoading}
                    >
                      <Navigation size={16} />
                      Use My Location
                    </button>
                  )}
                </div>
                {isMapVisible && (
                  <>
                    <div ref={mapContainer} className="fco-map-container" />
                    <div className="fco-map-instructions">
                      Click anywhere on the map to autofill your delivery
                      address.
                    </div>
                  </>
                )}
              </div>
              <div className="fco-form-grid" style={{ marginTop: "1rem" }}>
                <div className="fco-form-group">
                  <label className="fco-form-label">Street Address *</label>
                  <input
                    type="text"
                    className={`fco-form-input ${
                      errors.street ? "fco-error" : ""
                    }`}
                    value={addressInfo.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                    placeholder="House 123, Street 1, Sector F-8"
                    required
                  />
                  {errors.street && (
                    <span className="fco-error-message">
                      <AlertCircle size={14} /> {errors.street}
                    </span>
                  )}
                </div>
                <div className="fco-form-group">
                  <label className="fco-form-label">
                    Apartment, Suite, etc.
                  </label>
                  <input
                    type="text"
                    className="fco-form-input"
                    value={addressInfo.apartment}
                    onChange={(e) =>
                      handleAddressChange("apartment", e.target.value)
                    }
                    placeholder="Apt 4B"
                  />
                </div>
                <div className="fco-form-grid fco-responsive">
                  <div className="fco-form-group">
                    <label className="fco-form-label">City *</label>
                    <input
                      type="text"
                      className={`fco-form-input ${
                        errors.city ? "fco-error" : ""
                      }`}
                      value={addressInfo.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                      placeholder="Islamabad"
                      required
                    />
                    {errors.city && (
                      <span className="fco-error-message">
                        <AlertCircle size={14} /> {errors.city}
                      </span>
                    )}
                  </div>
                  <div className="fco-form-group">
                    <label className="fco-form-label">State/Province *</label>
                    <input
                      type="text"
                      className={`fco-form-input ${
                        errors.state ? "fco-error" : ""
                      }`}
                      value={addressInfo.state}
                      onChange={(e) =>
                        handleAddressChange("state", e.target.value)
                      }
                      placeholder="Islamabad Capital Territory"
                      required
                    />
                    {errors.state && (
                      <span className="fco-error-message">
                        <AlertCircle size={14} /> {errors.state}
                      </span>
                    )}
                  </div>
                </div>
                <div className="fco-form-grid fco-responsive">
                  <div className="fco-form-group">
                    <label className="fco-form-label">Postal Code *</label>
                    <input
                      type="text"
                      className={`fco-form-input ${
                        errors.zipCode ? "fco-error" : ""
                      }`}
                      value={addressInfo.zipCode}
                      onChange={(e) =>
                        handleAddressChange("zipCode", e.target.value)
                      }
                      placeholder="44000"
                      required
                    />
                    {errors.zipCode && (
                      <span className="fco-error-message">
                        <AlertCircle size={14} /> {errors.zipCode}
                      </span>
                    )}
                  </div>
                  <div className="fco-form-group">
                    <label className="fco-form-label">Country *</label>
                    <select
                      className={`fco-form-select ${
                        errors.country ? "fco-error" : ""
                      }`}
                      value={addressInfo.country}
                      onChange={(e) =>
                        handleAddressChange("country", e.target.value)
                      }
                      required
                    >
                      <option value="Pakistan">Pakistan</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                    {errors.country && (
                      <span className="fco-error-message">
                        <AlertCircle size={14} /> {errors.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Payment Information */}
            <div className="fco-form-section">
              <div className="fco-section-header">
                <CreditCard className="fco-section-icon" />
                <h2 className="fco-section-title">Payment Information</h2>
              </div>
              <div className="fco-form-group">
                <label>Card Details *</label>
                <div
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: 12,
                    background: "#fff",
                  }}
                >
                  <CardElement
                    options={{
                      style: { base: { fontSize: "16px", color: "#1f2937" } },
                    }}
                  />
                </div>
              </div>
              <div className="fco-security-note" style={{ marginTop: 8 }}>
                <Lock size={16} /> Your payment information is secure and
                encrypted with Stripe
              </div>
              {paymentError && (
                <div
                  className="fco-error-message"
                  style={{ marginTop: 10, color: "red" }}
                >
                  {paymentError}
                </div>
              )}
            </div>
          </div>
          {/* Order Summary */}
          <div className="fco-order-summary">
            <h2 className="fco-summary-title">Order Summary</h2>
            <div className="fco-summary-row">
              <span>Subtotal</span>
              <span>PKR {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="fco-summary-row fco-discount">
                <span>Discount</span>
                <span>-PKR {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="fco-summary-row">
              <span>Tax (8%)</span>
              <span>PKR {tax.toFixed(2)}</span>
            </div>
            <div className="fco-summary-row">
              <span>Delivery Fee</span>
              <span>PKR {DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="fco-summary-row fco-total">
              <span>Total</span>
              <span>PKR {total.toFixed(2)}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="fco-place-order-btn"
            >
              {isProcessing ? (
                <>
                  <div className="fco-loading-spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock size={16} /> Place Order - PKR {total.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
