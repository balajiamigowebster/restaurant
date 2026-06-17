import React from "react";

export default function Cart({ 
  cart, 
  isOpen, 
  onClose, 
  updateCartQuantity, 
  removeFromCart, 
  onCheckout 
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const packagingFee = subtotal > 0 ? 25 : 0;
  const gst = Math.round(subtotal * 0.05); // 5% GST for restaurants
  const deliveryCharges = subtotal > 200 || subtotal === 0 ? 0 : 40;
  const total = subtotal + packagingFee + gst + deliveryCharges;

  return (
    <div className={`cart-drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Cart Header */}
        <div className="cart-header">
          <h2>Your Plate 🧆</h2>
          <button className="close-cart-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Cart Body */}
        {cart.length > 0 ? (
          <>
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-icon">{item.icon}</div>
                  <div className="cart-item-details">
                    <div className="cart-item-name-row">
                      <h4>{item.name}</h4>
                      <button 
                        className="remove-item-btn" 
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="cart-item-price-row">
                      <span className="cart-item-price">₹{item.price} each</span>
                      
                      <div className="qty-controller small">
                        <button 
                          className="qty-btn minus" 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button 
                          className="qty-btn plus" 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      
                      <span className="cart-item-total">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="cart-bill-details">
              <h3>Bill Details</h3>
              <div className="bill-row">
                <span>Item Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="bill-row">
                <span>Restaurant Packaging Charges</span>
                <span>₹{packagingFee}</span>
              </div>
              <div className="bill-row">
                <span>Govt Taxes (GST 5%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Partner Fee</span>
                <span>
                  {deliveryCharges === 0 ? (
                    <span className="free-delivery">FREE</span>
                  ) : (
                    `₹${deliveryCharges}`
                  )}
                </span>
              </div>
              
              {subtotal < 200 && (
                <div className="delivery-tip-alert">
                  Add <b>₹{200 - subtotal}</b> more for <b>FREE Delivery</b>!
                </div>
              )}
              
              <hr className="bill-divider" />
              
              <div className="bill-row grand-total">
                <span>To Pay</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Cart Footer Checkout button */}
            <div className="cart-footer">
              <button className="checkout-proceed-btn" onClick={onCheckout}>
                Proceed to Checkout (₹{total}) ➔
              </button>
            </div>
          </>
        ) : (
          <div className="empty-cart-state">
            <div className="empty-cart-icon">🥣</div>
            <h3>Your plate is empty!</h3>
            <p>Add some sizzling hot dosas or soft idlis to start relishing.</p>
            <button className="browse-menu-btn" onClick={onClose}>
              Browse Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
