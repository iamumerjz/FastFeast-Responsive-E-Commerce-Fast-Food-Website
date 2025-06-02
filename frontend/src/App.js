import React, { useState, useEffect } from "react";
import Navbar from "./component/Navbar";
import HeroSlider from "./component/HeroSlider";
import Menu from "./component/Menu";
import Footer from "./component/Footer";
import PromoCards from "./component/PromoCards";
import About from "./component/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderPlaced from "./pages/OrderPlaced";
import OrderHistory from "./pages/OrderHistory";
import AdminDashboard from "./pages/AdminDashboard";
import Signin from "./pages/Signin";
import axios from "axios";
import "./App.css";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51KMDzkKflbV4GnnS4hSj2wWMFBRPkNRRm1G6Lw68BcDtlWpOlsdayVxxLckz5d1ep77Lq0CUpqlBNyEprh6Kc1qm00L4psUYdV";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

function App() {
  const [latestOrder, setLatestOrder] = useState(null);

const handleOrderPlaced = (order) => {
  setLatestOrder(order);
  setCart([]); // Clear cart after placing order
  setCurrentPage("order-placed");
};
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showSignin, setShowSignin] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [menuItems, setMenuItems] = useState([]); // For displaying guest cart

  // Load menu items once (for guest cart rendering)
  useEffect(() => {
    axios.get("/api/menu/all").then((res) => setMenuItems(res.data));
  }, []);

  // Restore user from localStorage on app load/refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Restore guest cart from localStorage
  useEffect(() => {
    if (!user) {
      const guestCart = localStorage.getItem("cart");
      setCart(guestCart ? JSON.parse(guestCart) : []);
    }
  }, [user]);

  // Fetch cart from backend if logged in
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  // Save guest cart to localStorage on cart change (guests only)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  // Function to fetch cart from backend (for logged-in users)
  const fetchCart = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await axios.get("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Normalize items for frontend use!
    setCart(
      res.data.items
        ? res.data.items.map(i => ({
            ...i.menuItem,
            quantity: i.quantity,
            id: i.menuItem._id
          }))
        : []
    );
  } catch {
    setCart([]);
  }
};

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setCurrentPage("home");
    // Don't clear guest cart!
  };

  // Add to cart for guest and logged-in users
  const handleAddToCart = async (menuItemId, quantity = 1) => {
    if (user) {
      try {
        await axios.post(
          "/api/cart/add",
          { menuItemId, quantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        fetchCart();
      } catch (err) {
        alert("Failed to add to cart.");
      }
    } else {
      setCart((prev) => {
        const idx = prev.findIndex((i) => i.menuItemId === menuItemId);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx].quantity += quantity;
          return updated;
        }
        return [...prev, { menuItemId, quantity }];
      });
    }
  };

  // Remove from cart handler
  const handleRemoveFromCart = (menuItemId) => {
    if (user) {
      axios
        .post(
          "/api/cart/remove",
          { menuItemId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then(() => fetchCart())
        .catch(() => alert("Failed to remove item."));
    } else {
      setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
    }
  };
const handleDiscoverMenu = () => {
  setCurrentPage("home"); // or "menu", whichever renders <Menu />
  setTimeout(() => {
    const menuSection = document.getElementById("menu-section");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  }, 100); // Slight delay to allow re-render
};
  // Update quantity handler
  const handleUpdateCartQuantity = (menuItemId, quantity) => {
    if (user) {
      axios
        .post(
          "/api/cart/update",
          { menuItemId, quantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then(() => fetchCart())
        .catch(() => alert("Failed to update quantity."));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
      );
    }
  };

  // Navigation handlers
  const handleCartAccess = () => setCurrentPage("cart");
  const handlePastOrdersAccess = () => setCurrentPage("past-orders");
  const handleBackToHome = () => setCurrentPage("home");

  // Admin dashboard
  if (user && user.role === 2) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} showAdminOnly />
        <AdminDashboard onLogout={handleLogout} />
        <Footer />
      </div>
    );
  }

  // Render different pages based on currentPage state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "cart":
        return (
          <div>
            <Navbar
              onSignin={() => setShowSignin(true)}
              user={user}
              onLogout={handleLogout}
              onCartAccess={handleCartAccess}
              onPastOrdersAccess={handlePastOrdersAccess}
              onBackToHome={handleBackToHome}
              currentPage={currentPage}
              cartCount={
                user
                  ? cart.reduce((sum, ci) => sum + ci.quantity, 0)
                  : cart.reduce((sum, ci) => sum + ci.quantity, 0)
              }
            />
            <Cart
              user={user}
              cart={cart}
              menuItems={menuItems}
              onBackToHome={handleBackToHome}
              onRemoveFromCart={handleRemoveFromCart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onProceedToCheckout={() => setCurrentPage("checkout")} // <-- add this line
            />
            <Footer />
          </div>
        );
      case "past-orders":
        return (
          <div>
            <Navbar
              onSignin={() => setShowSignin(true)}
              user={user}
              onLogout={handleLogout}
              onCartAccess={handleCartAccess}
              onPastOrdersAccess={handlePastOrdersAccess}
              onBackToHome={handleBackToHome}
              currentPage={currentPage}
              cartCount={
                user
                  ? cart.reduce((sum, ci) => sum + ci.quantity, 0)
                  : cart.reduce((sum, ci) => sum + ci.quantity, 0)
              }
            />
            <OrderHistory user={user} onBackToHome={handleBackToHome} />
            <Footer />
          </div>
        );
      case "checkout":
        return (
          <div>
            <Navbar
              onSignin={() => setShowSignin(true)}
              user={user}
              cart={cart}
              onLogout={handleLogout}
              onCartAccess={handleCartAccess}
              onPastOrdersAccess={handlePastOrdersAccess}
              onBackToHome={handleBackToHome}
              currentPage={currentPage}
              cartCount={
                user
                  ? cart.reduce((sum, ci) => sum + ci.quantity, 0)
                  : cart.reduce((sum, ci) => sum + ci.quantity, 0)
              }
            />
            <Elements stripe={stripePromise}>
              <Checkout
                user={user}
                cart={cart}
                menuItems={menuItems}
                onBackToHome={handleBackToHome}
                 onOrderPlaced={handleOrderPlaced}
              />
            </Elements>

            <Footer />
          </div>
        );
      case "order-placed":
        return (
          <div>
            <Navbar
              onSignin={() => setShowSignin(true)}
              user={user}
              onLogout={handleLogout}
              onCartAccess={handleCartAccess}
              onPastOrdersAccess={handlePastOrdersAccess}
              onBackToHome={handleBackToHome}
              currentPage={currentPage}
              cartCount={
                user
                  ? cart.reduce((sum, ci) => sum + ci.quantity, 0)
                  : cart.reduce((sum, ci) => sum + ci.quantity, 0)
              }
            />
            <OrderPlaced order={latestOrder} onBackToHome={handleBackToHome} />
            <Footer />
          </div>
        );
      default:
        return (
          <div>
            <Navbar
              onSignin={() => setShowSignin(true)}
              user={user}
              onLogout={handleLogout}
              onCartAccess={handleCartAccess}
              onPastOrdersAccess={handlePastOrdersAccess}
              onBackToHome={handleBackToHome}
              currentPage={currentPage}
              cartCount={
                user
                  ? cart.reduce((sum, ci) => sum + ci.quantity, 0)
                  : cart.reduce((sum, ci) => sum + ci.quantity, 0)
              }
            />
            <HeroSlider />
            <PromoCards />
            <Menu onAddToCart={handleAddToCart} />
            <About onDiscoverMenu={handleDiscoverMenu} />
            <Footer />
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {renderCurrentPage()}
      {showSignin && (
        <Signin
          open={showSignin}
          onClose={() => setShowSignin(false)}
          onLogin={(userData) => {
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            setShowSignin(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
