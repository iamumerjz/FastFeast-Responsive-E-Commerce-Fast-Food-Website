
import "./Signup.css";
import React, { useState } from "react";
import axios from "axios";

const Signup = ({ onClose, goToLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/signup", formData);
      alert("Signup successful! Please login.");
      goToLogin();
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Signup</h2>
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input name="name" type="text" onChange={handleChange} required />

          <label>Email</label>
          <input name="email" type="email" onChange={handleChange} required />

          <label>Password</label>
          <input name="password" type="password" onChange={handleChange} required />

          <button className="login-btn" type="submit">Sign Up</button>

          <div className="checkbox-row">
            <label>
              <input type="checkbox" required /> I agree to the{" "}
              <span className="pink">Terms & Conditions</span>.
            </label>
          </div>

          <div className="signup-link">
            Already have an account?{" "}
            <span style={{ color: "#ee032b", cursor: "pointer" }} onClick={goToLogin}>
              Login Now.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};


export default Signup;
