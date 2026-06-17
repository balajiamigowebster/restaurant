import React, { useState } from "react";

export default function CheckoutModal({ 
  cart, 
  onClose, 
  selectedOutlet, 
  clearCart, 
  addOrder, 
  activeOrder, 
  setActiveOrder 
}) {
  const [orderType, setOrderType] = useState("delivery"); // delivery, dinein
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi, cod
  const [showQR, setShowQR] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const packagingFee = subtotal > 0 ? 25 : 0;
  const gst = Math.round(subtotal * 0.05);
  const deliveryCharges = orderType === "delivery" && subtotal < 200 ? 40 : 0;
  const total = subtotal + packagingFee + gst + deliveryCharges;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    
    if (!name || !phone) {
      alert("Please enter your name and phone number!");
      return;
    }

    if (orderType === "delivery" && !address) {
      alert("Please enter your delivery address!");
      return;
    }

    if (orderType === "dinein" && !tableNumber) {
      alert("Please specify your table number!");
      return;
    }

    if (paymentMethod === "upi" && !showQR) {
      setShowQR(true);
      return;
    }

    // Place order
    setIsSubmitting(true);

    const orderId = "IDL-" + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: orderId,
      customerName: name,
      customerPhone: phone,
      type: orderType,
      address: orderType === "delivery" ? address : `Table #${tableNumber}`,
      outlet: selectedOutlet,
      items: [...cart],
      subtotal,
      packagingFee,
      gst,
      deliveryCharges,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "upi" ? "Paid" : "Pending",
      status: "Pending",
      timestamp: new Date().toISOString()
    };

    // Place order instantly on backend
    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newOrder)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to save order");
        }
        return res.json();
      })
      .then(savedOrder => {
        addOrder(savedOrder);
        setActiveOrder(savedOrder.id); // Set as the active tracked order ID
        setShowSuccessScreen(true); // Show success screen
        clearCart();
        setIsSubmitting(false);
        setShowQR(false);
      })
      .catch(err => {
        console.error("Error submitting order:", err);
        alert("Failed to submit order to server. Please try again.");
        setIsSubmitting(false);
      });
  };

  // Status mapping to progress percentages
  const statusProgress = {
    "Pending": 25,
    "Preparing": 50,
    "Dispatched": 75,
    "Completed": 100,
    "Cancelled": 0
  };

  const statusIcons = {
    "Pending": "⏳",
    "Preparing": "🍳",
    "Dispatched": "🛵",
    "Completed": "✅",
    "Cancelled": "❌"
  };

  const statusDescriptions = {
    "Pending": "Waiting for outlet approval",
    "Preparing": "Chef is handcrafting your meal",
    "Dispatched": "Out for delivery / Ready for pick up",
    "Completed": "Delivered! Hope you relish it!",
    "Cancelled": "Order has been cancelled"
  };

  // Render success screen first if active
  if (showSuccessScreen) {
    return (
      <div className="checkout-modal-overlay" onClick={onClose}>
        <div className="checkout-modal-card success-card" onClick={(e) => e.stopPropagation()}>
          <div className="success-icon-wrapper">
            <span className="success-checkmark">🎉</span>
          </div>
          <h2>Order Placed Successfully!</h2>
          <p className="success-order-msg">
            Thank you for ordering, <b>{name}</b>!
            <br />
            Your order ID is <b>{activeOrder ? activeOrder.id : ""}</b>.
          </p>
          <div className="success-details">
            <p>We've sent your request to <b>Café IDlish ({selectedOutlet})</b>.</p>
            <p>Your order will reflect in the admin panel immediately.</p>
          </div>
          <button 
            className="success-track-btn" 
            onClick={() => {
              setShowSuccessScreen(false);
            }}
          >
            Track Your Order Live ➔
          </button>
        </div>
      </div>
    );
  }

  // Render tracking view if an active order exists
  if (activeOrder) {
    const progress = statusProgress[activeOrder.status] || 0;
    const isCancelled = activeOrder.status === "Cancelled";

    return (
      <div className="checkout-modal-overlay">
        <div className="checkout-modal-card tracking-card">
          <div className="tracking-header">
            <span className="live-pulse">🔴 Live Tracking</span>
            <h2>Order {activeOrder.status === "Completed" ? "Completed" : "In Progress"}</h2>
            <p className="order-id-label">ID: <b>{activeOrder.id}</b></p>
          </div>

          {/* Visual Progress Bar */}
          {!isCancelled && (
            <div className="progress-bar-container">
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-steps">
                <div className={`step-dot ${progress >= 25 ? "active" : ""}`}>
                  <span className="step-icon">📝</span>
                  <span className="step-label">Ordered</span>
                </div>
                <div className={`step-dot ${progress >= 50 ? "active" : ""}`}>
                  <span className="step-icon">🍳</span>
                  <span className="step-label">Preparing</span>
                </div>
                <div className={`step-dot ${progress >= 75 ? "active" : ""}`}>
                  <span className="step-icon">🛵</span>
                  <span className="step-label">Dispatched</span>
                </div>
                <div className={`step-dot ${progress >= 100 ? "active" : ""}`}>
                  <span className="step-icon">😋</span>
                  <span className="step-label">Relished</span>
                </div>
              </div>
            </div>
          )}

          {/* Status Display Card */}
          <div className={`status-display-card ${activeOrder.status.toLowerCase()}`}>
            <span className="status-emoji">{statusIcons[activeOrder.status]}</span>
            <div className="status-info">
              <h3>{activeOrder.status}</h3>
              <p>{statusDescriptions[activeOrder.status]}</p>
            </div>
          </div>

          {/* Alert explaining interactive updates */}
          <div className="admin-sync-hint">
            💡 <b>Try this:</b> Open the <b>Admin Panel</b> (passcode <code>admin123</code>) in another window or toggle it in the header. Changing the status of order <b>{activeOrder.id}</b> there will update this progress bar in real-time!
          </div>

          {/* Order Summary */}
          <div className="order-summary-box">
            <h3>Items Ordered</h3>
            <div className="summary-items-list">
              {activeOrder.items.map((item) => (
                <div key={item.id} className="summary-item-row">
                  <span>{item.icon} {item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <hr />
            <div className="summary-total-row">
              <span>Grand Total</span>
              <span>₹{activeOrder.total}</span>
            </div>
            <div className="summary-details-row">
              <p>📍 <b>Delivery Mode:</b> {activeOrder.type === "delivery" ? "Home Delivery" : "Dine-In"}</p>
              <p>🏠 <b>Location Details:</b> {activeOrder.address}</p>
              <p>💳 <b>Payment Status:</b> {activeOrder.paymentStatus} ({activeOrder.paymentMethod.toUpperCase()})</p>
            </div>
          </div>

          <div className="tracking-footer">
            <button className="close-tracking-btn" onClick={() => setActiveOrder(null)}>
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render checkout form
  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Checkout Details 🍽️</h2>
          <button className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {!showQR ? (
          <form onSubmit={handleSubmitOrder} className="checkout-form">
            {/* Order Type Toggle */}
            <div className="form-group">
              <label>Order Type</label>
              <div className="order-type-toggle">
                <button
                  type="button"
                  className={`toggle-option ${orderType === "delivery" ? "active" : ""}`}
                  onClick={() => setOrderType("delivery")}
                >
                  🛵 Home Delivery
                </button>
                <button
                  type="button"
                  className={`toggle-option ${orderType === "dinein" ? "active" : ""}`}
                  onClick={() => setOrderType("dinein")}
                >
                  🍽️ Dine-In (Table)
                </button>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cust-name">Full Name *</label>
                <input
                  id="cust-name"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cust-phone">Phone Number *</label>
                <input
                  id="cust-phone"
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Dynamic Details based on Order Type */}
            {orderType === "delivery" ? (
              <div className="form-group">
                <label htmlFor="cust-address">Delivery Address *</label>
                <textarea
                  id="cust-address"
                  required
                  rows="3"
                  placeholder="Street Address, Building Name, Flat/House No."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                ></textarea>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="cust-table">Table Number *</label>
                <input
                  id="cust-table"
                  type="number"
                  required
                  min="1"
                  max="50"
                  placeholder="e.g. 12"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="form-group">
              <label>Payment Method</label>
              <div className="payment-options">
                <div 
                  className={`pay-option-card ${paymentMethod === "upi" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <span className="pay-icon">📱</span>
                  <div className="pay-text">
                    <h4>Instant UPI</h4>
                    <p>Pay using GooglePay, PhonePe, or BHIM</p>
                  </div>
                </div>

                <div 
                  className={`pay-option-card ${paymentMethod === "cod" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <span className="pay-icon">💵</span>
                  <div className="pay-text">
                    <h4>{orderType === "delivery" ? "Cash on Delivery" : "Pay at Table"}</h4>
                    <p>Pay when you receive your order</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="checkout-summary-box">
              <div className="summary-row">
                <span>To Pay:</span>
                <span className="summary-total-price">₹{total}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-order-btn">
              {paymentMethod === "upi" ? "Proceed to Pay ➔" : "Place Order ➔"}
            </button>
          </form>
        ) : (
          <div className="upi-payment-screen">
            <h3>Scan UPI QR Code to Pay</h3>
            <p className="pay-amount">Amount: <b>₹{total}</b></p>
            
            {/* Simulated QR Code using beautiful styling */}
            <div className="mock-qr-code-wrapper">
              <div className="mock-qr-code">
                {/* Visual blocks representing QR */}
                <div className="qr-corner top-left"></div>
                <div className="qr-corner top-right"></div>
                <div className="qr-corner bottom-left"></div>
                <div className="qr-center-pattern">IDLISH</div>
                <div className="qr-scan-line"></div>
              </div>
              <p className="upi-id">Merchant ID: <b>idlish@upi</b></p>
            </div>

            <div className="upi-payment-tips">
              <p>1. Open your UPI app (GPay, BHIM, PhonePe, Paytm)</p>
              <p>2. Scan this QR Code or pay the amount shown</p>
              <p>3. Click "Confirm Payment" below once transferred</p>
            </div>

            <div className="qr-actions">
              <button className="qr-back-btn" onClick={() => setShowQR(false)} disabled={isSubmitting}>
                ◀ Change details
              </button>
              <button className="qr-confirm-btn" onClick={handleSubmitOrder} disabled={isSubmitting}>
                {isSubmitting ? "Placing Order..." : "Confirm Payment ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
