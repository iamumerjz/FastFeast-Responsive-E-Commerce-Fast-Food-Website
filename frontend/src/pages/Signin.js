import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Signin.css";
import Signup from "./Signup";

const initialForm = { email: "", password: "" };

const Signin = ({ open, onClose, onLogin }) => {
  const [formData, setFormData] = useState(initialForm);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Clear fields when modal is closed
  useEffect(() => {
    if (!open) {
      setFormData(initialForm);
      setShowSignup(false);
      setIsLoading(false);
    }
  }, [open]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/api/auth/login", formData);

      // Save token and user to localStorage for persistence
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Call parent handler to update user state in App.js
      if (onLogin) {
        onLogin(res.data.user);
      }

      setFormData(initialForm);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful signup (optional: auto-login)
  const handleSignupSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (onLogin) onLogin(userData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} disabled={isLoading}>
          &times;
        </button>
        {!showSignup ? (
          <>
            <h2 className="modal-title">Login</h2>
            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                name="email"
                type="email"
                onChange={handleChange}
                value={formData.email}
                required
                disabled={isLoading}
              />
              <label>Password</label>
              <input
                name="password"
                type="password"
                onChange={handleChange}
                value={formData.password}
                required
                disabled={isLoading}
              />
              <button
                className="login-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Login"}
              </button>
              <div className="signup-link">
                No account?{" "}
                <span
                  style={{
                    color: "#ee032b",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  onClick={() => !isLoading && setShowSignup(true)}
                >
                  Click to create an account.
                </span>
              </div>
            </form>
          </>
        ) : (
          <Signup
            onClose={onClose}
            goToLogin={() => setShowSignup(false)}
            onSignupSuccess={handleSignupSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Signin;
