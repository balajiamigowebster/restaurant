import React, { useState } from "react";

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode === "admin123") {
      setError("");
      onLoginSuccess();
    } else {
      setError("Incorrect Admin Passcode! Please try again.");
      setIsShaking(true);
      // Reset shake animation class after it completes
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  };

  return (
    <div className="admin-login-overlay">
      <div className={`admin-login-card ${isShaking ? "shake-anim" : ""}`}>
        
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="idlish-logo-badge large">
            <span className="logo-main">IDlish</span>
            <span className="logo-sub">Idli | Dosa | Relish</span>
          </div>
          <h2>Admin Control Panel</h2>
          <p>Please enter your passcode to access restaurant management dashboards.</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="login-error-alert">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group password-group">
            <label htmlFor="admin-passcode">Enter Passcode</label>
            <div className="input-with-icon-wrapper">
              <span className="input-left-icon">🔑</span>
              <input
                id="admin-passcode"
                type={showPasscode ? "text" : "password"}
                placeholder="••••••••"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="password-toggle-eye-btn"
                onClick={() => setShowPasscode(!showPasscode)}
                title={showPasscode ? "Hide Passcode" : "Show Passcode"}
              >
                {showPasscode ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="login-actions">
            <button type="button" className="login-back-btn" onClick={onCancel}>
              ◀ Storefront
            </button>
            <button type="submit" className="login-submit-btn">
              Unlock Dashboard ➔
            </button>
          </div>
        </form>

        <div className="login-card-footer">
          <p>💡 <b>Testing Hint:</b> Use the default passcode <code>admin123</code></p>
        </div>

      </div>
    </div>
  );
}
