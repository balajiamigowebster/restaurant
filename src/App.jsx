import React, { useState, useEffect } from "react";
import { initialMenu } from "./data/initialMenu";
import Header from "./components/Header";
import OutletSelector from "./components/OutletSelector";
import HomePage from "./components/HomePage";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import CheckoutModal from "./components/CheckoutModal";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";
import { API_BASE } from "./config";
import "./App.css";

export default function App() {
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  // --- Database States (Fetched from backend) ---
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [outletStatus, setOutletStatus] = useState({ "Goregaon East": "Open", "Vile Parle West": "Open" });

  // --- Local Preferences & Session States (Persisted locally) ---
  const [outlet, setOutlet] = useState(() => {
    return localStorage.getItem("idlish_outlet") || null;
  });

  const [activeOrderId, setActiveOrderId] = useState(() => {
    return localStorage.getItem("idlish_active_order_id") || null;
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("idlish_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // --- UI State ---
  const [cart, setCart] = useState([]);
  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem("idlish_current_view") || "home";
  }); // "home", "store" or "admin"
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("idlish_admin_logged_in") === "true";
  });
  const [orderMode, setOrderMode] = useState("Delivery");

  // Sync admin authentication and view states to sessionStorage to persist on refresh
  useEffect(() => {
    sessionStorage.setItem("idlish_current_view", currentView);
  }, [currentView]);

  useEffect(() => {
    sessionStorage.setItem("idlish_admin_logged_in", adminLoggedIn ? "true" : "false");
  }, [adminLoggedIn]);

  const toggleWishlist = (itemId) => {
    setWishlist((prev) => {
      const next = prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId];
      localStorage.setItem("idlish_wishlist", JSON.stringify(next));
      return next;
    });
  };

  // --- Fetch Initial Backend Data with Auto-Probing ---
  useEffect(() => {
    const initData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/menu`);
        if (!res.ok) throw new Error("Probe failed");
        const menuData = await res.json();
        if (Array.isArray(menuData)) {
          setMenu(menuData);
          setUseLocalFallback(false);
          
          // Fetch orders and outlets from backend
          const ordersRes = await fetch(`${API_BASE}/api/orders`);
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            if (Array.isArray(ordersData)) setOrders(ordersData);
          }
          
          const outletsRes = await fetch(`${API_BASE}/api/outlets`);
          if (outletsRes.ok) {
            const outletsData = await outletsRes.json();
            if (outletsData && typeof outletsData === 'object' && !Array.isArray(outletsData)) {
              setOutletStatus(outletsData);
            }
          }
        } else {
          throw new Error("Invalid menu type");
        }
      } catch (err) {
        console.warn("Auto-probing backend failed. Falling back to client-side localStorage:", err);
        setUseLocalFallback(true);
        
        // Load Menu
        const savedMenu = localStorage.getItem("idlish_local_menu");
        if (savedMenu) {
          setMenu(JSON.parse(savedMenu));
        } else {
          localStorage.setItem("idlish_local_menu", JSON.stringify(initialMenu));
          setMenu(initialMenu);
        }
        
        // Load Orders
        const savedOrders = localStorage.getItem("idlish_local_orders");
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          setOrders([]);
        }
        
        // Load Outlets
        const savedOutlets = localStorage.getItem("idlish_local_outlets");
        if (savedOutlets) {
          setOutletStatus(JSON.parse(savedOutlets));
        } else {
          const defaultOutlets = { "Goregaon East": "Open", "Vile Parle West": "Open" };
          localStorage.setItem("idlish_local_outlets", JSON.stringify(defaultOutlets));
          setOutletStatus(defaultOutlets);
        }
      }
    };
    
    initData();
  }, []);

  // --- WebSocket Real-Time Listener ---
  useEffect(() => {
    if (useLocalFallback) return;

    let wsUrl;
    if (import.meta.env.DEV) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.host}/ws`;
    } else {
      // Replace http/https with ws/wss and append /ws
      wsUrl = API_BASE.replace(/^http/, "ws") + "/ws";
    }
    
    let ws;
    let reconnectTimeout;

    const connectWS = () => {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);
          if (type === "menu_updated" && Array.isArray(payload)) {
            setMenu(payload);
          } else if (type === "orders_updated" && Array.isArray(payload)) {
            setOrders(payload);
          } else if (type === "outlets_updated" && payload && typeof payload === 'object' && !Array.isArray(payload)) {
            setOutletStatus(payload);
          }
        } catch (err) {
          console.error("Error parsing WS message:", err);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWS, 2000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [useLocalFallback]);

  // --- Client LocalStorage Synchronization Effects ---
  useEffect(() => {
    if (outlet) {
      localStorage.setItem("idlish_outlet", outlet);
    } else {
      localStorage.removeItem("idlish_outlet");
    }
  }, [outlet]);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem("idlish_active_order_id", activeOrderId);
    } else {
      localStorage.removeItem("idlish_active_order_id");
    }
  }, [activeOrderId]);

  // Resolve the active order object from the live orders array
  const activeOrder = orders.find(o => o.id === activeOrderId) || null;

  // --- Cart Operations ---
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === item.id);
      if (existing) {
        return prevCart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // --- Order & System Operations ---
  const addOrder = (order) => {
    setActiveOrderId(order.id); // Set tracking active
    setCheckoutOpen(true); // Re-open checkout card which acts as tracking screen
  };

  // --- Hybrid API / LocalStorage Actions ---
  const placeOrder = async (newOrder) => {
    if (useLocalFallback) {
      const currentOrders = [...orders, newOrder];
      localStorage.setItem("idlish_local_orders", JSON.stringify(currentOrders));
      setOrders(currentOrders);
      return newOrder;
    } else {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });
      if (!res.ok) throw new Error("Failed to save order");
      return await res.json();
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const updatedPaymentStatus = newStatus === "Completed" ? "Paid" : undefined;
    if (useLocalFallback) {
      const updatedOrders = orders.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            paymentStatus: updatedPaymentStatus || o.paymentStatus
          };
        }
        return o;
      });
      localStorage.setItem("idlish_local_orders", JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
    } else {
      await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, paymentStatus: updatedPaymentStatus })
      });
    }
  };

  const deleteOrder = async (orderId) => {
    if (useLocalFallback) {
      const updatedOrders = orders.filter(o => o.id !== orderId);
      localStorage.setItem("idlish_local_orders", JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
    } else {
      await fetch(`${API_BASE}/api/orders/${orderId}`, { method: "DELETE" });
    }
  };

  const toggleMenuAvailability = async (itemId) => {
    const item = menu.find(i => i.id === itemId);
    if (!item) return;
    const updatedItem = { ...item, isAvailable: !item.isAvailable };
    
    if (useLocalFallback) {
      const updatedMenu = menu.map(i => i.id === itemId ? updatedItem : i);
      localStorage.setItem("idlish_local_menu", JSON.stringify(updatedMenu));
      setMenu(updatedMenu);
    } else {
      await fetch(`${API_BASE}/api/menu/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem)
      });
    }
  };

  const saveMenuItem = async (editingItem) => {
    if (useLocalFallback) {
      const updatedMenu = menu.map(i => i.id === editingItem.id ? editingItem : i);
      localStorage.setItem("idlish_local_menu", JSON.stringify(updatedMenu));
      setMenu(updatedMenu);
    } else {
      await fetch(`${API_BASE}/api/menu/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem)
      });
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (useLocalFallback) {
      const updatedMenu = menu.filter(i => i.id !== itemId);
      localStorage.setItem("idlish_local_menu", JSON.stringify(updatedMenu));
      setMenu(updatedMenu);
    } else {
      await fetch(`${API_BASE}/api/menu/${itemId}`, { method: "DELETE" });
    }
  };

  const addMenuItem = async (itemToAdd) => {
    if (useLocalFallback) {
      const updatedMenu = [...menu, itemToAdd];
      localStorage.setItem("idlish_local_menu", JSON.stringify(updatedMenu));
      setMenu(updatedMenu);
    } else {
      await fetch(`${API_BASE}/api/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToAdd)
      });
    }
  };

  const toggleOutletStatus = async (outletName) => {
    const current = outletStatus[outletName] || "Open";
    const next = current === "Open" ? "Closed" : "Open";
    
    if (useLocalFallback) {
      const updatedOutlets = { ...outletStatus, [outletName]: next };
      localStorage.setItem("idlish_local_outlets", JSON.stringify(updatedOutlets));
      setOutletStatus(updatedOutlets);
    } else {
      await fetch(`${API_BASE}/api/outlets/${outletName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next })
      });
    }
  };

  const resetMenuToDefault = async () => {
    if (useLocalFallback) {
      localStorage.setItem("idlish_local_menu", JSON.stringify(initialMenu));
      setMenu(initialMenu);
    } else {
      await fetch(`${API_BASE}/api/menu/reset`, { method: "POST" });
    }
  };

  const handleSelectOutlet = (outletName) => {
    setOutlet(outletName);
    // If client changes outlet, clear the cart to prevent cross-location inventory mixups
    setCart([]);
  };

  // Total cart items count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-wrapper">
      {/* 1. Header is sticky and rendered on all views */}
      <Header
        selectedOutlet={outlet}
        setSelectedOutlet={handleSelectOutlet}
        cartCount={cartCount}
        setIsCartOpen={setIsCartOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
        adminLoggedIn={adminLoggedIn}
        setAdminLoggedIn={setAdminLoggedIn}
        orderMode={orderMode}
        setOrderMode={setOrderMode}
      />

      {/* 2. Main Router Container */}
      <main className="main-content">
        {currentView === "admin" ? (
          !adminLoggedIn ? (
            <AdminLogin
              onLoginSuccess={() => setAdminLoggedIn(true)}
              onCancel={() => setCurrentView("store")}
            />
          ) : (
            // Admin Console View
            <AdminPanel
              menu={menu}
              setMenu={setMenu}
              orders={orders}
              setOrders={setOrders}
              outletStatus={outletStatus}
              setOutletStatus={setOutletStatus}
              resetMenuToDefault={resetMenuToDefault}
              updateOrderStatus={updateOrderStatus}
              deleteOrder={deleteOrder}
              toggleMenuAvailability={toggleMenuAvailability}
              saveMenuItem={saveMenuItem}
              deleteMenuItem={deleteMenuItem}
              addMenuItem={addMenuItem}
              toggleOutletStatus={toggleOutletStatus}
              onSignOut={() => {
                setAdminLoggedIn(false);
                setCurrentView("store");
              }}
            />
          )
        ) : currentView === "home" ? (
          // Immersive Homepage View
          <HomePage
            setCurrentView={setCurrentView}
            setSelectedOutlet={handleSelectOutlet}
            outletStatus={outletStatus}
          />
        ) : !outlet ? (
          // Landing Outlet Selector
          <OutletSelector
            selectedOutlet={outlet}
            setSelectedOutlet={handleSelectOutlet}
            outletStatus={outletStatus}
          />
        ) : (
          // Storefront Menu Grid
          <Menu
            menu={menu}
            addToCart={addToCart}
            cart={cart}
            removeFromCart={removeFromCart}
            updateCartQuantity={updateCartQuantity}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        )}
      </main>

      {/* 3. Floating Tracking Bar (if user has an active order they closed) */}
      {currentView === "store" && activeOrder && !checkoutOpen && (
        <div className="floating-tracker-bar" onClick={() => setCheckoutOpen(true)}>
          <div className="tracker-bar-content">
            <span className="live-dot"></span>
            <span>Track Active Order: <b>{activeOrder.id}</b> ({activeOrder.status})</span>
          </div>
          <button className="tracker-bar-btn">View Status ➔</button>
        </div>
      )}

      {/* 4. Sliding Cart Sidebar */}
      <Cart
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* 5. Checkout & Tracking Dialog Overlay */}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          onClose={() => setCheckoutOpen(false)}
          selectedOutlet={outlet}
          clearCart={clearCart}
          addOrder={addOrder}
          activeOrder={activeOrder}
          setActiveOrder={setActiveOrderId}
          placeOrder={placeOrder}
        />
      )}

      {/* 6. Footer (Only on Customer Storefront) */}
      {(currentView === "store" || currentView === "home") && (
        <footer className="main-footer">
          <div className="footer-container">
            <div className="footer-brand">
              <h2>🧆 Café IDlish</h2>
              <p>Idli Dosa Relish — South Indian Heritage</p>
            </div>
            <div className="footer-links">
              <div>
                <h4>Outlets</h4>
                <p>Goregaon (East) | Vile Parle (West)</p>
              </div>
              <div>
                <h4>Hours</h4>
                <p>Tuesday - Sunday: 7:00 AM - 11:00 PM</p>
                <p>Closed on Mondays</p>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Café IDlish. Developed as a high-fidelity replica with interactive Admin Controls.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
