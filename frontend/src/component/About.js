import React, { useState, useEffect } from "react";
import "./About.css";

const About = ({ onDiscoverMenu }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { number: "500+", label: "Happy Customers", icon: "👥" },
    { number: "50+", label: "Recipes", icon: "📖" },
    { number: "5", label: "Years Experience", icon: "⭐" }
  ];

  return (
    <section className="about-section" id="about-section">
      {/* Animated background elements */}
      <div className="bg-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className={`about-container ${isVisible ? 'fade-in' : ''}`}>
        {/* Image Section with Enhanced Effects */}
        <div className="about-image">
          <div className="image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
              alt="Delicious Burger Layers" 
            />
            <div className="image-overlay"></div>
            <div className="pulse-ring"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="about-content">
          <div className="title-section">
            <span className="subtitle">Our Story</span>
            <h2 className="about-title">
              We Are <span className="highlight">FastFeast</span>
            </h2>
            <div className="title-underline"></div>
          </div>

          <p className="about-desc">
            Our story began in a small, close-knit village of Pakistan, where food wasn't just a meal—it was a way to bring people together. With little more than a dream and a family recipe book, we started serving homemade burgers and fries from a tiny roadside cart.
          </p>

          <p className="about-desc secondary">
            Word traveled quickly, and soon people from neighboring towns were stopping by just to taste our fresh, local ingredients prepared with love. Today, FastFeast shares those authentic village flavors with the world, one meal at a time.
          </p>

          {/* Stats Section */}
          <div className="stats-container">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`stat-card ${hoveredCard === index ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <button className="about-btn" onClick={onDiscoverMenu}>
            <span>Discover Our Menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

    </section>
  );
};

export default About;