import React, { useState, useEffect } from "react";

export default function Menu({ 
  menu, 
  addToCart, 
  cart, 
  removeFromCart, 
  updateCartQuantity,
  wishlist = [],
  toggleWishlist
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState("");

  // Extract unique categories (ordered as they appear in screenshots)
  const categories = [
    "Idli & Vada",
    "Dosa & Uthappam",
    "Meenamma's Signature Six",
    "Combos, Thali & Rice",
    "Warm Drinks",
    "Iced Drinks",
    "Desserts"
  ];

  // Dynamically count items per category that are available
  const categoryCounts = menu.reduce((acc, item) => {
    if (item.isAvailable) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {});

  // Handle section folding/collapsing
  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Scroll to selected category section
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    const element = document.getElementById(`category-${cat.replace(/\s+/g, '-').toLowerCase()}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Setup intersection observer to highlight active category in sidebar on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-140px 0px -60% 0px", // adjust for sticky headers
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.id;
          // find matching category name
          const matchedCat = categories.find(
            cat => `category-${cat.replace(/\s+/g, '-').toLowerCase()}` === categoryId
          );
          if (matchedCat) {
            setActiveCategory(matchedCat);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    categories.forEach((cat) => {
      const element = document.getElementById(`category-${cat.replace(/\s+/g, '-').toLowerCase()}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [menu]);

  // Helper to check item quantities in cart
  const getItemQuantityInCart = (itemId) => {
    const cartItem = cart.find((item) => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Filter items based on search query
  const getFilteredItemsByCategory = (category) => {
    return menu.filter((item) => {
      if (!item.isAvailable) return false;
      if (item.category !== category) return false;

      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  };

  return (
    <div className="storefront-layout">
      
      {/* 1. Left Sidebar Navigation */}
      <aside className="storefront-sidebar">
        <h3 className="sidebar-title">Categories</h3>
        <ul className="sidebar-menu">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            if (count === 0 && !searchQuery) return null; // Hide if empty
            
            return (
              <li 
                key={cat} 
                className={`sidebar-item ${activeCategory === cat ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <span className="sidebar-cat-name">{cat}</span>
                <span className="sidebar-cat-count">{count}</span>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* 2. Right Content Scroll View */}
      <section className="storefront-content">
        
        {/* Search Bar at the top of content */}
        <div className="store-search-bar">
          <div className="search-input-container">
            <button className="search-btn-icon">🔍</button>
            <input
              type="text"
              placeholder="Search ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-field"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories Grid Container */}
        <div className="categories-sections-container">
          {categories.map((cat) => {
            const items = getFilteredItemsByCategory(cat);
            if (items.length === 0) return null; // Hide category if no search results

            const isCollapsed = collapsedCategories[cat];

            return (
              <div 
                key={cat} 
                id={`category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                className="category-section"
              >
                {/* Collapsible Section Header */}
                <div 
                  className="category-section-header"
                  onClick={() => toggleCategoryCollapse(cat)}
                >
                  <h2 className="category-section-title">{cat}</h2>
                  <div className="header-line"></div>
                  <span className={`collapse-chevron ${isCollapsed ? "collapsed" : ""}`}>
                    ▼
                  </span>
                </div>

                {/* Grid of Food Cards */}
                {!isCollapsed && (
                  <div className="food-cards-grid">
                    {items.map((item) => {
                      const qty = getItemQuantityInCart(item.id);
                      const isWishlisted = wishlist.includes(item.id);

                      return (
                        <div key={item.id} className="menu-food-card">
                          
                          {/* Image area */}
                          <div className="card-image-box">
                            {/* We use our generated feast image or a default fallback */}
                            <img 
                              src={item.image || "/south_indian_feast.png"} 
                              alt={item.name} 
                              className="food-card-img" 
                            />
                          </div>

                          {/* Card Content body */}
                          <div className="card-info-box">
                            {/* Veg Indicator, Title & Wishlist */}
                            <div className="card-title-row">
                              <div className="diet-dot-square" title="Vegetarian">
                                <span className="diet-inner-dot"></span>
                              </div>
                              <h4 className="card-food-name">{item.name}</h4>
                              <button 
                                className={`wishlist-heart-btn ${isWishlisted ? "active" : ""}`}
                                onClick={() => toggleWishlist(item.id)}
                              >
                                {isWishlisted ? "❤️" : "🤍"}
                              </button>
                            </div>

                            {/* Discount Tag */}
                            {item.discountText && (
                              <div className="card-discount-tag">
                                {item.discountText}
                              </div>
                            )}

                            {/* Pricing & Add control */}
                            <div className="card-price-action-row">
                              <div className="price-label-box">
                                <div className="price-details">
                                  <span className="current-price">₹{item.price.toFixed(2)}</span>
                                  {item.originalPrice && (
                                    <span className="original-price">₹{item.originalPrice.toFixed(2)}</span>
                                  )}
                                </div>
                                {item.customization && (
                                  <span className="customization-tag">Customization available</span>
                                )}
                              </div>

                              {/* Action controls */}
                              <div className="card-add-action">
                                {qty > 0 ? (
                                  <div className="qty-pills-selector">
                                    <button 
                                      className="qty-pill-btn" 
                                      onClick={() => updateCartQuantity(item.id, qty - 1)}
                                    >
                                      -
                                    </button>
                                    <span className="qty-pill-value">{qty}</span>
                                    <button 
                                      className="qty-pill-btn" 
                                      onClick={() => updateCartQuantity(item.id, qty + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    className="item-add-plus-btn"
                                    onClick={() => addToCart(item)}
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>
    </div>
  );
}
