import React, { useState } from "react";

export default function AdminPanel({ 
  menu, 
  setMenu, 
  orders, 
  setOrders, 
  outletStatus, 
  setOutletStatus, 
  resetMenuToDefault,
  onSignOut
}) {
  const [activeTab, setActiveTab] = useState("orders"); // orders, menu, outlets
  const [orderFilter, setOrderFilter] = useState("active"); // all, active, completed, cancelled
  
  // States for Menu Editor
  const [editingItem, setEditingItem] = useState(null); // Item object currently being edited
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "Steamed Idli & Vada",
    isVeg: true,
    spicyLevel: 0,
    rating: 4.5,
    isBestSeller: false,
    isAvailable: true,
    icon: "🧆"
  });

  // Unique categories for select boxes
  const categories = ["Steamed Idli & Vada", "Dosas & Uttapams", "Meenamma's Signature Six", "Combos & Thali", "Dakshin Rice", "Beverages"];

  // 1. Calculate Metrics
  const completedOrders = orders.filter(o => o.status === "Completed");
  const activeOrders = orders.filter(o => ["Pending", "Preparing", "Dispatched"].includes(o.status));
  const cancelledOrders = orders.filter(o => o.status === "Cancelled");
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // 2. Order Filtering
  const filteredOrders = orders.filter(o => {
    if (orderFilter === "active") return ["Pending", "Preparing", "Dispatched"].includes(o.status);
    if (orderFilter === "completed") return o.status === "Completed";
    if (orderFilter === "cancelled") return o.status === "Cancelled";
    return true; // "all"
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Latest orders first

  // 3. Order Actions
  const handleStatusChange = (orderId, newStatus) => {
    const updatedPaymentStatus = newStatus === "Completed" ? "Paid" : undefined;
    fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: newStatus,
        paymentStatus: updatedPaymentStatus
      })
    })
      .catch(err => console.error("Error updating order status:", err));
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(`Are you sure you want to delete order record ${orderId}?`)) {
      fetch(`/api/orders/${orderId}`, { method: "DELETE" })
        .catch(err => console.error("Error deleting order:", err));
    }
  };

  // 4. Menu Actions
  const handleToggleAvailability = (itemId) => {
    const item = menu.find(i => i.id === itemId);
    if (!item) return;
    const updatedItem = { ...item, isAvailable: !item.isAvailable };
    fetch(`/api/menu/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedItem)
    })
      .catch(err => console.error("Error updating menu item availability:", err));
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    fetch(`/api/menu/${editingItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(editingItem)
    })
      .then(() => setEditingItem(null))
      .catch(err => console.error("Error saving menu item edit:", err));
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm("Are you sure you want to delete this menu item from the catalog?")) {
      fetch(`/api/menu/${itemId}`, { method: "DELETE" })
        .catch(err => console.error("Error deleting menu item:", err));
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      alert("Name and Price are required!");
      return;
    }

    const generatedId = "item-" + Date.now();
    const itemToAdd = {
      ...newItem,
      id: generatedId,
      price: Number(newItem.price),
      spicyLevel: Number(newItem.spicyLevel),
      rating: Number(newItem.rating)
    };

    fetch("/api/menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(itemToAdd)
    })
      .then(() => {
        setShowAddForm(false);
        // Reset add form
        setNewItem({
          name: "",
          description: "",
          price: "",
          category: "Steamed Idli & Vada",
          isVeg: true,
          spicyLevel: 0,
          rating: 4.5,
          isBestSeller: false,
          isAvailable: true,
          icon: "🧆"
        });
      })
      .catch(err => console.error("Error adding menu item:", err));
  };

  // 5. Outlet Actions
  const handleToggleOutletStatus = (outletName) => {
    const current = outletStatus[outletName] || "Open";
    const next = current === "Open" ? "Closed" : "Open";
    fetch(`/api/outlets/${outletName}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: next })
    })
      .catch(err => console.error("Error updating outlet status:", err));
  };

  return (
    <div className="admin-panel">
      {/* Dashboard Top bar */}
      <div className="admin-header">
        <div className="admin-header-title-area">
          <h2>🛡️ Café IDlish Control Panel</h2>
          {onSignOut && (
            <button className="admin-logout-btn" onClick={onSignOut} title="Sign Out Securely">
              Logout 🚪
            </button>
          )}
        </div>
        <div className="admin-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📋 Orders ({activeOrders.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === "menu" ? "active" : ""}`}
            onClick={() => setActiveTab("menu")}
          >
            🍽️ Menu Catalog
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === "outlets" ? "active" : ""}`}
            onClick={() => setActiveTab("outlets")}
          >
            ⚙️ Outlets & System
          </button>
        </div>
      </div>

      <div className="admin-body">
        
        {/* TAB 1: ORDERS DASHBOARD */}
        {activeTab === "orders" && (
          <div className="admin-orders-tab">
            {/* Stats Overview */}
            <div className="stats-row">
              <div className="stat-card revenue">
                <h4>Total Revenue</h4>
                <p className="stat-value">₹{totalRevenue}</p>
                <span className="stat-subtitle">From completed orders</span>
              </div>
              <div className="stat-card active">
                <h4>Active Orders</h4>
                <p className="stat-value">{activeOrders.length}</p>
                <span className="stat-subtitle">In preparation/dispatch</span>
              </div>
              <div className="stat-card completed">
                <h4>Completed</h4>
                <p className="stat-value">{completedOrders.length}</p>
                <span className="stat-subtitle">Delivered successfully</span>
              </div>
              <div className="stat-card cancelled">
                <h4>Cancelled</h4>
                <p className="stat-value">{cancelledOrders.length}</p>
                <span className="stat-subtitle">Cancelled by kitchen/user</span>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="order-filter-bar">
              <button 
                className={`filter-tab ${orderFilter === "active" ? "active" : ""}`}
                onClick={() => setOrderFilter("active")}
              >
                Active Orders
              </button>
              <button 
                className={`filter-tab ${orderFilter === "completed" ? "active" : ""}`}
                onClick={() => setOrderFilter("completed")}
              >
                Completed Orders
              </button>
              <button 
                className={`filter-tab ${orderFilter === "cancelled" ? "active" : ""}`}
                onClick={() => setOrderFilter("cancelled")}
              >
                Cancelled Orders
              </button>
              <button 
                className={`filter-tab ${orderFilter === "all" ? "active" : ""}`}
                onClick={() => setOrderFilter("all")}
              >
                All Orders ({orders.length})
              </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Time</th>
                      <th>Customer Details</th>
                      <th>Location / Outlet</th>
                      <th>Items Ordered</th>
                      <th>Total</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className={`order-row ${o.status.toLowerCase()}`}>
                        <td>
                          <span className="order-id-badge">{o.id}</span>
                        </td>
                        <td>
                          {new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <br />
                          <small>{new Date(o.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</small>
                        </td>
                        <td>
                          <strong>{o.customerName}</strong>
                          <br />
                          <small>📞 {o.customerPhone}</small>
                        </td>
                        <td>
                          <span className="outlet-name-badge">{o.outlet}</span>
                          <br />
                          <span className="address-label">
                            {o.type === "dinein" ? "🍽️" : "🛵"} {o.address}
                          </span>
                        </td>
                        <td>
                          <div className="ordered-items-summary">
                            {o.items.map((item) => (
                              <div key={item.id} className="item-summary-line">
                                {item.icon} {item.name} <b>x{item.quantity}</b>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong className="order-total-price">₹{o.total}</strong>
                        </td>
                        <td>
                          <span className={`payment-status-badge ${o.paymentStatus.toLowerCase()}`}>
                            {o.paymentStatus} ({o.paymentMethod.toUpperCase()})
                          </span>
                        </td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className={`status-selector ${o.status.toLowerCase()}`}
                          >
                            <option value="Pending">⏳ Pending</option>
                            <option value="Preparing">🍳 Preparing</option>
                            <option value="Dispatched">🛵 Dispatched</option>
                            <option value="Completed">✅ Completed</option>
                            <option value="Cancelled">❌ Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            className="delete-order-btn" 
                            onClick={() => handleDeleteOrder(o.id)}
                            title="Delete order history"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-orders-state">
                <span className="empty-icon">📂</span>
                <h3>No orders found.</h3>
                <p>Orders placed by storefront clients will show up here instantly!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MENU CATALOG EDITOR */}
        {activeTab === "menu" && (
          <div className="admin-menu-tab">
            <div className="menu-action-header">
              <h3>Menu Items Catalog ({menu.length} total)</h3>
              <button 
                className="add-new-item-btn"
                onClick={() => {
                  setShowAddForm(true);
                  setEditingItem(null);
                }}
              >
                Add New Item +
              </button>
            </div>

            {/* Form overlays */}
            {(showAddForm || editingItem) && (
              <div className="admin-form-overlay">
                <div className="admin-form-card">
                  <h3>{showAddForm ? "Add New Menu Item" : `Edit Item: ${editingItem.name}`}</h3>
                  
                  <form onSubmit={showAddForm ? handleAddItem : handleSaveEdit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Item Name *</label>
                        <input
                          type="text"
                          required
                          value={showAddForm ? newItem.name : editingItem.name}
                          onChange={(e) => showAddForm 
                            ? setNewItem({ ...newItem, name: e.target.value })
                            : setEditingItem({ ...editingItem, name: e.target.value })
                          }
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Price (₹) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={showAddForm ? newItem.price : editingItem.price}
                          onChange={(e) => showAddForm 
                            ? setNewItem({ ...newItem, price: e.target.value })
                            : setEditingItem({ ...editingItem, price: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={showAddForm ? newItem.category : editingItem.category}
                          onChange={(e) => showAddForm 
                            ? setNewItem({ ...newItem, category: e.target.value })
                            : setEditingItem({ ...editingItem, category: e.target.value })
                          }
                        >
                          {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Emoji Icon</label>
                        <input
                          type="text"
                          placeholder="e.g. 🧆"
                          value={showAddForm ? newItem.icon : editingItem.icon}
                          onChange={(e) => showAddForm 
                            ? setNewItem({ ...newItem, icon: e.target.value })
                            : setEditingItem({ ...editingItem, icon: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        rows="2"
                        value={showAddForm ? newItem.description : editingItem.description}
                        onChange={(e) => showAddForm 
                          ? setNewItem({ ...newItem, description: e.target.value })
                          : setEditingItem({ ...editingItem, description: e.target.value })
                        }
                      ></textarea>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Spice Level (0-3)</label>
                        <input
                          type="number"
                          min="0"
                          max="3"
                          value={showAddForm ? newItem.spicyLevel : editingItem.spicyLevel}
                          onChange={(e) => showAddForm 
                            ? setNewItem({ ...newItem, spicyLevel: Number(e.target.value) })
                            : setEditingItem({ ...editingItem, spicyLevel: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Rating (1-5)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={showAddForm ? newItem.rating : editingItem.rating}
                          onChange={(e) => showAddForm 
                            ? setNewItem({ ...newItem, rating: Number(e.target.value) })
                            : setEditingItem({ ...editingItem, rating: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="checkbox-row">
                      <label>
                        <input
                          type="checkbox"
                          checked={showAddForm ? newItem.isBestSeller : editingItem.isBestSeller}
                          onChange={(e) => showAddForm 
                            ? setNewItem({ ...newItem, isBestSeller: e.target.checked })
                            : setEditingItem({ ...editingItem, isBestSeller: e.target.checked })
                          }
                        />
                        Mark as Bestseller ⭐
                      </label>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingItem(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {showAddForm ? "Add Product" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Menu Items Table */}
            <div className="admin-menu-list">
              <table className="admin-menu-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Spicy</th>
                    <th>Bestseller</th>
                    <th>Store Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menu.map((item) => (
                    <tr key={item.id} className={item.isAvailable ? "" : "item-disabled"}>
                      <td className="menu-emoji">{item.icon}</td>
                      <td>
                        <strong>{item.name}</strong>
                        <div className="menu-desc-tooltip">{item.description}</div>
                      </td>
                      <td>
                        <span className="category-tag">{item.category}</span>
                      </td>
                      <td>
                        <strong>₹{item.price}</strong>
                      </td>
                      <td>⭐ {item.rating}</td>
                      <td>{"🌶️".repeat(item.spicyLevel) || "None"}</td>
                      <td>{item.isBestSeller ? "⭐ Yes" : "No"}</td>
                      <td>
                        <button
                          className={`visibility-toggle-btn ${item.isAvailable ? "visible" : "hidden"}`}
                          onClick={() => handleToggleAvailability(item.id)}
                        >
                          {item.isAvailable ? "🟢 Available" : "🔴 Hidden"}
                        </button>
                      </td>
                      <td>
                        <div className="menu-action-buttons">
                          <button 
                            className="edit-item-btn"
                            onClick={() => handleEditItem(item)}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="delete-item-btn"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: OUTLETS & SYSTEM CONTROLS */}
        {activeTab === "outlets" && (
          <div className="admin-outlets-tab">
            <div className="outlet-management-section">
              <h3>Outlet Location Controls</h3>
              <p className="section-desc">Manage store hours. Closing an outlet prevents customers from placing new orders for that location.</p>
              
              <div className="outlets-control-grid">
                {["Goregaon East", "Vile Parle West"].map((outletName) => {
                  const status = outletStatus[outletName] || "Open";
                  const isClosed = status === "Closed";

                  return (
                    <div key={outletName} className={`outlet-control-card ${isClosed ? "closed" : "open"}`}>
                      <div className="outlet-ctrl-info">
                        <h4>📍 Cafe IDlish ({outletName})</h4>
                        <p>Status: <b className={isClosed ? "text-red" : "text-green"}>{status.toUpperCase()}</b></p>
                      </div>
                      <button
                        className={`outlet-toggle-action-btn ${isClosed ? "btn-open" : "btn-close"}`}
                        onClick={() => handleToggleOutletStatus(outletName)}
                      >
                        {isClosed ? "🟢 Open Outlet" : "🔴 Close Outlet"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="section-divider" />

            <div className="system-reset-section">
              <h3>System Data Maintenance</h3>
              <p className="section-desc">Reset the menu list back to the original database seed configuration. This will reload default prices and items, but preserve order logs.</p>
              <button 
                className="system-reset-btn"
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset the menu to default settings? This will overwrite your custom menu items and prices.")) {
                    resetMenuToDefault();
                    alert("Menu has been reset successfully!");
                  }
                }}
              >
                🔄 Reset Menu Catalog to Default
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
