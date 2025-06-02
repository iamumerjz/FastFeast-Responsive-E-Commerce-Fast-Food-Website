import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Menu.css";

const categories = ["All", "Burger", "Pizza", "Pasta", "Fries"];

const Menu = ({ onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isVisible, setIsVisible] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/menu/all");
        setMenuItems(res.data);
      } catch (err) {
        setMenuItems([]);
      }
      setLoading(false);
    };
    fetchMenu();
  }, []);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const ref = sectionRef.current;
    if (!ref) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(ref);

    return () => observer.disconnect();
  }, []);

  const filteredItems =
  selectedCategory === "All"
    ? menuItems.filter(item => item.available)
    : menuItems.filter(item => item.available && item.category === selectedCategory);


  return (
    <section
      className={`menu-section${isVisible ? " menu-visible" : ""}`}
      id="menu-section"
      ref={sectionRef}
    >
      <h2 className="section-title">Our Menu</h2>
      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          Loading menu...
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          No menu items found.
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item._id} className="menu-card">
              <div className="menu-image-wrapper">
                <img
                  src={item.image ? item.image : "/placeholder.jpg"}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
              </div>
              <div className="menu-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="menu-footer">
                  <span className="price">PKR {item.price}</span>
                  <button
                    className="add-to-cart"
                    aria-label={`Add ${item.name} to cart`}
                    onClick={() => onAddToCart(item._id)}
                  >
                    
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <rect x="3" y="7" width="18" height="14" rx="2" ry="2" />
                      <path d="M16 7V5a4 4 0 0 0-8 0v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Menu;
