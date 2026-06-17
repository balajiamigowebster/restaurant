import React from "react";

export default function Header({ 
  selectedOutlet, 
  setSelectedOutlet, 
  cartCount, 
  setIsCartOpen, 
  currentView, 
  setCurrentView,
  adminLoggedIn,
  setAdminLoggedIn,
  orderMode,
  setOrderMode
}) {
  
  const handleAdminToggle = () => {
    if (currentView === "admin") {
      setCurrentView("store");
    } else {
      setCurrentView("admin");
    }
  };

  return (
    <>
      {/* Top Minimum Order Info Banner */}
      {currentView === "store" && (
        <div className="top-info-banner">
          <span>🛒 Minimum order amount : ₹0</span>
          <span className="banner-separator">|</span>
          <span>⏱️ Minimum Delivery Time: 35 mins</span>
        </div>
      )}

      <header className="main-header">
        <div className="header-container">
          
          {/* Brand Logo & Store Name */}
          <div className="header-left">
            <div className="idlish-logo-badge" onClick={() => setCurrentView("home")} title="Go to Home">
              <span className="logo-main">IDlish</span>
              <span className="logo-sub">Idli | Dosa | Relish</span>
            </div>
            
            {selectedOutlet && currentView === "store" && (
              <div className="store-name-container" onClick={() => setSelectedOutlet(null)}>
                <h2 className="store-name">Cafe IDlish ({selectedOutlet})</h2>
                <span className="change-store-link">Change</span>
              </div>
            )}
          </div>

          {/* Center Navigation & Order Mode Selector */}
          <div className="header-center">
            <nav className="header-nav">
              <button 
                className={`nav-link-btn ${currentView === "home" ? "active" : ""}`}
                onClick={() => setCurrentView("home")}
              >
                Home
              </button>
              <button 
                className={`nav-link-btn ${currentView === "store" ? "active" : ""}`}
                onClick={() => setCurrentView("store")}
              >
                Order Online
              </button>
            </nav>

            {currentView === "store" && selectedOutlet && (
              <div className="order-mode-selector">
                {["Delivery", "Pick up", "Eat In"].map((mode) => (
                  <button
                    key={mode}
                    className={`mode-pill ${orderMode === mode ? "active" : ""}`}
                    onClick={() => setOrderMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="header-right">
            {/* Cart Button */}
            {currentView === "store" && (
              <button className="bag-trigger-btn" onClick={() => setIsCartOpen(true)} title="View Cart">
                <svg className="bag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {cartCount > 0 && <span className="bag-badge">{cartCount}</span>}
              </button>
            )}

            {/* Sign In Button */}
            <button className="sign-in-btn">
              Sign in
            </button>

            {/* Admin Key Lock button */}
            <button 
              className={`admin-icon-btn ${currentView === "admin" ? "active" : ""}`}
              onClick={handleAdminToggle}
              title={currentView === "admin" ? "View Storefront" : "Access Admin Panel"}
            >
              {currentView === "admin" ? "🏪" : "🔐"}
            </button>
          </div>

        </div>
      </header>
    </>
  );
}
