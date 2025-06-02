import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", anchor: "hero-section" },
  { label: "Menu", anchor: "menu-section" },
  { label: "About", anchor: "about-section" },
  { label: "Contact Us", anchor: "footer-contact" },
];

const AUTOCOMPLETE_API = "http://127.0.0.1:8000/autocomplete";
const INCREMENT_API = "http://127.0.0.1:8000/increment-frequency";

const Navbar = ({ 
  onSignin, 
  user, 
  onLogout, 
  onCartAccess, 
  onPastOrdersAccess, 
  onBackToHome,
  currentPage = 'home',
  showAdminOnly = false, // New prop to identify admin view
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("Home");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const userDropdownRef = useRef(null);

  // New states for autocomplete (desktop)
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // New states for autocomplete (mobile)
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const [mobileSuggestions, setMobileSuggestions] = useState([]);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const mobileInputRef = useRef(null);

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch suggestions for desktop
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${AUTOCOMPLETE_API}?prefix=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Debounced version
  const debouncedFetchSuggestions = useRef(debounce(fetchSuggestions, 300)).current;

  // Fetch suggestions for mobile
  const fetchMobileSuggestions = async (query) => {
    if (!query) {
      setMobileSuggestions([]);
      setShowMobileSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${AUTOCOMPLETE_API}?prefix=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        console.log("Autocomplete data:", data);
        setMobileSuggestions(data);
        setShowMobileSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching mobile suggestions:", error);
    }
  };

  const debouncedFetchMobileSuggestions = useRef(debounce(fetchMobileSuggestions, 300)).current;

  // Increment frequency API call
  const incrementFrequency = async (foodName) => {
    try {
      await fetch(INCREMENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName }),
      });
    } catch (error) {
      console.error("Error incrementing frequency:", error);
    }
  };

  // Desktop input change handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    debouncedFetchSuggestions(val);
  };

  // Desktop suggestion click handler
  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion);
    setShowSuggestions(false);
    incrementFrequency(suggestion);
  };

  // Mobile input change handler
  const handleMobileSearchChange = (e) => {
    const val = e.target.value;
    setMobileSearchValue(val);
    debouncedFetchMobileSuggestions(val);
  };

  // Mobile suggestion click handler
  const handleMobileSuggestionClick = (suggestion) => {
    setMobileSearchValue(suggestion);
    setShowMobileSuggestions(false);
    incrementFrequency(suggestion);
  };

  // Handle cart access
  const handleCartClick = () => {
    setShowUserDropdown(false);
    setMenuOpen(false);
    onCartAccess();
  };

  // Handle past orders click
  const handlePastOrdersClick = () => {
    setShowUserDropdown(false);
    setMenuOpen(false);
    onPastOrdersAccess();
  };

  // Handle logout click
  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    setMenuOpen(false);
    onLogout();
  };

  // Handle logo click to go back home
  const handleLogoClick = () => {
    onBackToHome();
    setActive("Home");
  };

  // Close suggestion dropdowns and user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current && !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      if (
        mobileInputRef.current && !mobileInputRef.current.contains(event.target)
      ) {
        setShowMobileSuggestions(false);
      }
      if (
        userDropdownRef.current && !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Don't modify body overflow for admin panel
    if (showAdminOnly) return;
    
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen, showAdminOnly]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const nav = document.querySelector(".navbar");
    if (nav) {
      nav.style.position = "sticky";
      nav.style.top = "0";
      nav.style.zIndex = "999";
    }
  }, []);
  
  useEffect(() => {
    // Only handle scroll for home page and non-admin views
    if (currentPage !== 'home' || showAdminOnly) return;

    const handleScroll = () => {
      const scrollSections = NAV_LINKS.filter((x) => x.anchor);
      let found = "Home";

      for (let i = 0; i < scrollSections.length; i++) {
        const { label, anchor } = scrollSections[i];
        const section = document.getElementById(anchor);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 80) {
            found = label;
          }
          if (
            window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 2
          ) {
            found = scrollSections[scrollSections.length - 1].label;
          }
        }
      }
      setActive(found);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage, showAdminOnly]);

  const handleNavClick = (label, anchor) => {
    if (currentPage !== 'home') {
      // If not on home page, go back to home first
      onBackToHome();
      setTimeout(() => {
        if (anchor) {
          document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // If on home page, scroll normally
      if (anchor) {
        setTimeout(() => {
          document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
        }, 10);
      }
    }
    setActive(label);
    setMenuOpen(false);
  };

  // If this is admin view, render simplified navbar
  if (showAdminOnly) {
    return (
      <nav className="navbar">
        <div className="navbar-content">
          <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            FastFeast Admin
          </div>

          <div className="nav-right">
            {user && (
              <div className="user-dropdown-container" ref={userDropdownRef}>
                <button
                  className="user-icon-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  aria-label="User menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mobile-user-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
                
                {showUserDropdown && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      Welcome, {user.name}!
                    </div>
                    <button
                      className="user-dropdown-item"
                      onClick={handleLogoutClick}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="dropdown-icon"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16,17 21,12 16,7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Regular navbar for non-admin users
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          FastFeast
        </div>

        <ul className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <li className="mobile-action-item">
            <div className="mobile-search-input-wrap" ref={mobileInputRef}>
              <input
                className="mobile-search-input"
                placeholder="Search menu..."
                type="text"
                value={mobileSearchValue}
                onChange={handleMobileSearchChange}
                onFocus={() => {
                  if (mobileSearchValue) setShowMobileSuggestions(true);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="mobile-search-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mobile-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              {showMobileSuggestions && mobileSuggestions.length > 0 && (
                <ul className="autocomplete-dropdown mobile-autocomplete-dropdown">
                  {mobileSuggestions.map((item) => (
                    <li
                      key={item}
                      onMouseDown={() => handleMobileSuggestionClick(item)}
                      className="autocomplete-item"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
          {NAV_LINKS.map((item) => (
            <li
              key={item.label}
              className={active === item.label ? "active" : ""}
              onClick={() => handleNavClick(item.label, item.anchor)}
            >
              {item.label}
            </li>
          ))}

          <li className="mobile-action-item">
            <button className="mobile-action-btn" onClick={handleCartClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mobile-icon"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <rect x="3" y="7" width="18" height="14" rx="2" ry="2" />
                <path d="M16 7V5a4 4 0 0 0-8 0v2" />
              </svg>
              View Cart
            </button>
          </li>
          
          <li className="mobile-sign-in">
            {!user ? (
              <button
                className="sign-in-btn"
                onClick={() => {
                  setMenuOpen(false);
                  setTimeout(() => {
                    onSignin();
                  }, 250);
                }}
              >
                Sign in
              </button>
            ) : (
              <div className="mobile-user-section">
                <div className="mobile-user-welcome">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mobile-user-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Welcome, {user.name}!
                </div>
                
                <div className="mobile-user-actions">
                  <button
                    className="mobile-user-btn past-orders-btn"
                    onClick={handlePastOrdersClick}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mobile-btn-icon"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.97" />
                    </svg>
                    Past Orders
                  </button>
                  
                  <button
                    className="mobile-user-btn logout-btn"
                    onClick={handleLogoutClick}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mobile-btn-icon"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </li>
        </ul>

        <div className="nav-right">
          <div className="search-container" ref={searchInputRef}>
            <button
              className={`desktop-search-btn${showSearch ? " show-search" : ""}`}
              onClick={() => setShowSearch((s) => !s)}
              aria-label="Search"
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
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <input
              className={`desktop-search-input${showSearch ? " show-search" : ""}`}
              type="text"
              placeholder="Search menu..."
              value={searchValue}
              onChange={handleSearchChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => {
                if (searchValue) setShowSuggestions(true);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="autocomplete-dropdown">
                {suggestions.map((item) => (
                  <li
                    key={item}
                    onMouseDown={() => handleSuggestionClick(item)}
                    className="autocomplete-item"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={handleCartClick} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
          {!user ? (
            <button className="sign-in-btn" onClick={onSignin}>
              Sign in
            </button>
          ) : (
            <div className="user-dropdown-container" ref={userDropdownRef}>
              <button
                className="user-icon-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                aria-label="User menu"
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {showUserDropdown && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    Welcome, {user.name}!
                  </div>
                  <button
                    className="user-dropdown-item"
                    onClick={handlePastOrdersClick}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="dropdown-icon"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.97" />
                    </svg>
                    Past Orders
                  </button>
                  <button
                    className="user-dropdown-item"
                    onClick={handleLogoutClick}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="dropdown-icon"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            className={`burger-btn${menuOpen ? " open" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="nav-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;