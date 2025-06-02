import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Check,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import "./AdminDashboard.css";

const categories = ["Pizza", "Burger", "Pasta", "Fries"];
const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const API_URL = "/api/menu";
const ORDERS_API = "/api/orders";

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Pizza",
    price: "",
    description: "",
    image: "",
    available: true,
  });
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    todayRevenue: 0,
    monthlyGrowth: 0,
  });

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const res = await axios.get(`${API_URL}/all`);
      setMenuItems(res.data);
    } catch (err) {
      alert("Could not load menu items.");
    }
    setLoadingMenu(false);
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);
useEffect(() => {
  // fetch stats when dashboard loads
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/orders/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data); // now contains totalRevenue too!
    } catch (err) {
      // fallback or error
    }
  };
  fetchStats();
}, []);
  // Fetch dashboard stats (real)
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/orders/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        todayRevenue: 0,
        monthlyGrowth: 0,
      });
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${ORDERS_API}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not load orders. Make sure you have /api/orders/all route."
      );
    }
    setLoadingOrders(false);
  };

  // Update dashboard stats/orders based on active tab
  useEffect(() => {
    if (activeTab === "dashboard") fetchStats();
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const handleAddItem = async () => {
    const token = localStorage.getItem("token");
    if (!newItem.name || !newItem.price)
      return alert("Name and price required");
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("category", newItem.category);
      formData.append("price", newItem.price);
      formData.append("description", newItem.description);
      formData.append("available", newItem.available);
      if (newItem.image) formData.append("image", newItem.image);
      await axios.post("/api/menu/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setShowAddItemModal(false);
      setNewItem({
        name: "",
        category: "Pizza",
        price: "",
        description: "",
        image: "",
        available: true,
      });
      setEditingItem(null);
      fetchMenuItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add item.");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({ ...item, price: item.price.toString() });
    setShowAddItemModal(true);
  };

  const handleUpdateItem = async () => {
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("category", newItem.category);
      formData.append("price", newItem.price);
      formData.append("description", newItem.description);
      formData.append("available", newItem.available);
      if (newItem.image instanceof File) {
        formData.append("image", newItem.image);
      }
      await axios.put(`${API_URL}/${editingItem._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setShowAddItemModal(false);
      setEditingItem(null);
      setNewItem({
        name: "",
        category: "Pizza",
        price: "",
        description: "",
        image: "",
        available: true,
      });
      fetchMenuItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update item.");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMenuItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete item.");
    }
  };

  const handleToggleAvailable = async (item) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_URL}/${item._id}`,
        { ...item, available: !item.available },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMenuItems();
    } catch (err) {
      alert("Could not update availability.");
    }
  };

  const handleChangeOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update order status. Make sure backend supports PUT /api/orders/:id/status."
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "preparing":
        return "#3b82f6";
      case "completed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="ff-admin-dashboard">
      <div className="ff-admin-dashboard-content">
        <div className="ff-admin-tab-navigation">
          <button
            className={`ff-admin-tab-button ${
              activeTab === "dashboard" ? "ff-admin-active" : ""
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Users size={18} />
            Dashboard
          </button>
          <button
            className={`ff-admin-tab-button ${
              activeTab === "orders" ? "ff-admin-active" : ""
            }`}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={18} />
            Orders
          </button>
          <button
            className={`ff-admin-tab-button ${
              activeTab === "menu" ? "ff-admin-active" : ""
            }`}
            onClick={() => setActiveTab("menu")}
          >
            <Plus size={18} />
            Menu Management
          </button>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="ff-admin-content-section ff-admin-dashboard-stats">
            <div className="ff-admin-stats-header">
              <h2 className="ff-admin-section-title">Analytics Overview</h2>
              <div className="ff-admin-stats-period">All Time</div>
            </div>
            <div className="ff-admin-stats-row">
              <div className="ff-admin-stat-card ff-admin-stat-users">
                <div className="ff-admin-stat-icon">
                  <Users size={24} />
                </div>
                <div className="ff-admin-stat-content">
                  <div className="ff-admin-stat-value">
                    {stats.totalUsers?.toLocaleString?.() || 0}
                  </div>
                  <div className="ff-admin-stat-label">Total Users</div>
                </div>
              </div>
              <div className="ff-admin-stat-card ff-admin-stat-orders">
                <div className="ff-admin-stat-icon">
                  <ShoppingBag size={24} />
                </div>
                <div className="ff-admin-stat-content">
                  <div className="ff-admin-stat-value">
                    {stats.totalOrders?.toLocaleString?.() || 0}
                  </div>
                  <div className="ff-admin-stat-label">Total Orders</div>
                </div>
              </div>
              <div className="ff-admin-stat-card ff-admin-stat-revenue">
                <div className="ff-admin-stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="ff-admin-stat-content">
                  <div className="ff-admin-stat-value">
                    PKR {stats.totalRevenue?.toLocaleString() || 0}
                  </div>
                  <div className="ff-admin-stat-label">Today's Revenue</div>
                </div>
              </div>
              <div className="ff-admin-stat-card ff-admin-stat-growth">
                <div className="ff-admin-stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="ff-admin-stat-content">
                  <div className="ff-admin-stat-value">
                    +{stats.monthlyGrowth}%</div>
                  <div className="ff-admin-stat-label">Monthly Growth</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="ff-admin-content-section">
            <div className="ff-admin-section-header">
              <h2 className="ff-admin-section-title">Order Management</h2>
              <div className="ff-admin-orders-summary">
                {orders.length} total orders
              </div>
            </div>
            {loadingOrders ? (
              <div className="ff-admin-loading">
                <div className="ff-admin-spinner"></div>
                Loading orders...
              </div>
            ) : (
              <div className="ff-admin-orders-list">
                {orders.length === 0 ? (
                  <div className="ff-admin-empty-state">
                    <ShoppingBag size={48} />
                    <h3>No orders yet</h3>
                    <p>Orders will appear here once customers start placing them.</p>
                  </div>
                ) : (
                  orders.map((order, idx) => (
                    <div
                      key={order._id}
                      className={`ff-admin-order-card ${
                        expandedOrder === idx ? "ff-admin-expanded" : ""
                      }`}
                    >
                      <div
                        className="ff-admin-order-summary"
                        onClick={() =>
                          setExpandedOrder(expandedOrder === idx ? null : idx)
                        }
                      >
                        <div className="ff-admin-order-header">
                          <div className="ff-admin-order-info">
                            <div className="ff-admin-order-number">
                              #{order.orderNumber || order._id.slice(-6)}
                            </div>
                            <div className="ff-admin-order-user">
                              {order.user?.email || order.user?.name || order.user}
                            </div>
                          </div>
                          <div className="ff-admin-order-meta">
                            <div className="ff-admin-order-date">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div
                              className="ff-admin-order-status"
                              style={{
                                background: getStatusColor(order.status),
                              }}
                            >
                              {order.status}
                            </div>
                            <div className="ff-admin-order-total">
                              PKR {order.total}
                            </div>
                            <div className="ff-admin-expand-icon">
                              {expandedOrder === idx ? (
                                <ChevronUp size={18} />
                              ) : (
                                <ChevronDown size={18} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {expandedOrder === idx && (
                        <div className="ff-admin-order-details">
                          <div className="ff-admin-order-items">
                            <h4>Order Items</h4>
                            <div className="ff-admin-items-list">
                              {order.items.map((item, i) => (
                                <div key={i} className="ff-admin-order-item">
                                  <span className="ff-admin-item-name">{item.name}</span>
                                  <span className="ff-admin-item-quantity">x{item.quantity}</span>
                                  <span className="ff-admin-item-category">{item.category}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="ff-admin-order-info-grid">
                            <div className="ff-admin-info-section">
                              <h4>Contact Information</h4>
                              <p>{order.contactInfo?.firstName} {order.contactInfo?.lastName}</p>
                              <p>{order.contactInfo?.email}</p>
                              <p>{order.contactInfo?.phone}</p>
                            </div>
                            <div className="ff-admin-info-section">
                              <h4>Delivery Address</h4>
                              <p>{order.addressInfo?.street}</p>
                              <p>{order.addressInfo?.city}</p>
                            </div>
                            <div className="ff-admin-info-section">
                              <h4>Status Management</h4>
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleChangeOrderStatus(order._id, e.target.value)
                                }
                                className="ff-admin-status-select"
                              >
                                {statusOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === "menu" && (
          <div className="ff-admin-content-section">
            <div className="ff-admin-section-header">
              <h2 className="ff-admin-section-title">Menu Management</h2>
              <button
                className="ff-admin-add-button"
                onClick={() => {
                  setShowAddItemModal(true);
                  setEditingItem(null);
                  setNewItem({
                    name: "",
                    category: "Pizza",
                    price: "",
                    description: "",
                    image: "",
                    available: true,
                  });
                }}
              >
                <Plus size={20} />
                Add New Item
              </button>
            </div>
            {loadingMenu ? (
              <div className="ff-admin-loading">
                <div className="ff-admin-spinner"></div>
                Loading menu items...
              </div>
            ) : (
              <div className="ff-admin-menu-grid">
                {menuItems.map((item) => (
                  <div key={item._id} className="ff-admin-menu-item-card">
                    <div className="ff-admin-item-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="ff-admin-item-img"
                        />
                      ) : (
                        <div className="ff-admin-no-image">
                          <Plus size={32} />
                          <span>No Image</span>
                        </div>
                      )}
                      <div className="ff-admin-item-overlay">
                        <div className="ff-admin-item-actions">
                          <button
                            className="ff-admin-action-button ff-admin-edit-button"
                            onClick={() => handleEditItem(item)}
                            title="Edit item"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="ff-admin-action-button ff-admin-delete-button"
                            onClick={() => handleDeleteItem(item._id)}
                            title="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            className={`ff-admin-action-button ff-admin-toggle-button ${
                              !item.available ? "ff-admin-inactive" : ""
                            }`}
                            onClick={() => handleToggleAvailable(item)}
                            title={item.available ? "Mark unavailable" : "Mark available"}
                          >
                            {item.available ? <Eye size={16} /> : <X size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="ff-admin-item-content">
                      <div className="ff-admin-item-header">
                        <div className="ff-admin-item-name">{item.name}</div>
                        <div className="ff-admin-item-category">{item.category}</div>
                      </div>
                      <div className="ff-admin-item-price">PKR {item.price}</div>
                      <div className="ff-admin-item-description">{item.description}</div>
                      <div
                        className={`ff-admin-availability-badge ${
                          item.available ? "ff-admin-available" : "ff-admin-unavailable"
                        }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL */}
        {showAddItemModal && (
          <div className="ff-admin-modal">
            <div className="ff-admin-modal-content">
              <div className="ff-admin-modal-header">
                <h3 className="ff-admin-modal-title">
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </h3>
                <button
                  className="ff-admin-close-button"
                  onClick={() => {
                    setShowAddItemModal(false);
                    setEditingItem(null);
                    setNewItem({
                      name: "",
                      category: "Pizza",
                      price: "",
                      description: "",
                      image: "",
                      available: true,
                    });
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="ff-admin-form-group">
                <label className="ff-admin-form-label" htmlFor="itemName">
                  Item Name <span className="ff-admin-required">*</span>
                </label>
                <input
                  type="text"
                  id="itemName"
                  className="ff-admin-form-input"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="Enter item name"
                  maxLength={40}
                  required
                />
              </div>

              <div className="ff-admin-form-group">
                <label className="ff-admin-form-label" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  className="ff-admin-form-input"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "Pizza" && "🍕 "}
                      {category === "Burger" && "🍔 "}
                      {category === "Pasta" && "🍝 "}
                      {category === "Fries" && "🍟 "}
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ff-admin-form-group">
                <label className="ff-admin-form-label" htmlFor="price">
                  Price (PKR) <span className="ff-admin-required">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  className="ff-admin-form-input"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="ff-admin-form-group">
                <label className="ff-admin-form-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  className="ff-admin-form-input ff-admin-form-textarea"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Enter item description"
                  maxLength={200}
                />
                <div className="ff-admin-char-count">
                  {newItem.description?.length || 0}/200
                </div>
              </div>

              <div className="ff-admin-form-group">
                <label className="ff-admin-form-label" htmlFor="image-upload">
                  Image Upload
                </label>
                <input
                  id="image-upload"
                  type="file"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={(e) =>
                    setNewItem({ ...newItem, image: e.target.files[0] })
                  }
                />
                <label htmlFor="image-upload" className="ff-admin-image-upload-label">
                  <Plus size={20} />
                  {newItem.image && newItem.image.name
                    ? newItem.image.name
                    : "Choose Image File"}
                </label>
                {newItem.image && (
                  <img
                    src={
                      newItem.image instanceof File
                        ? URL.createObjectURL(newItem.image)
                        : newItem.image
                    }
                    alt="Preview"
                    className="ff-admin-preview-thumb"
                  />
                )}
              </div>

              <div className="ff-admin-form-group">
                <div className="ff-admin-checkbox-group">
                  <input
                    type="checkbox"
                    id="available"
                    checked={newItem.available}
                    onChange={(e) =>
                      setNewItem({ ...newItem, available: e.target.checked })
                    }
                    className="ff-admin-checkbox"
                  />
                  <label htmlFor="available" className="ff-admin-checkbox-label">
                    Available for order
                  </label>
                </div>
              </div>

              <div className="ff-admin-modal-actions">
                <button
                  className="ff-admin-cancel-button"
                  onClick={() => {
                    setShowAddItemModal(false);
                    setEditingItem(null);
                    setNewItem({
                      name: "",
                      category: "Pizza",
                      price: "",
                      description: "",
                      image: "",
                      available: true,
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="ff-admin-save-button"
                  disabled={!newItem.name || !newItem.price}
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                >
                  {editingItem ? <Edit size={16} /> : <Plus size={16} />}
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
