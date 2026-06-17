import React from "react";

export default function HomePage({ setCurrentView, setSelectedOutlet, outletStatus }) {
  const outlets = [
    {
      name: "Goregaon East",
      address: "Shop 10, Yashodham Shopping Centre, Aba Karmarkar Rd, Mumbai",
      phone: "+91 98765 43210",
      hours: "7:00 AM - 11:00 PM (Closed Mon)",
      icon: "🕌"
    },
    {
      name: "Vile Parle West",
      address: "Shop No. 4, 2 Himalaya Bldg, S V Road, Mumbai",
      phone: "+91 98765 98765",
      hours: "7:00 AM - 11:00 PM (Closed Mon)",
      icon: "🏢"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sundaram",
      location: "Vile Parle",
      text: "The Benne Dosa has the perfect amount of crunch and butter. Pairing it with their organic jaggery filter coffee is my absolute favorite breakfast routine!",
      stars: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Rohan Mehta",
      location: "Goregaon East",
      text: "Meenamma's Signature Six menu is pure culinary genius. The Pizza Rice Crust and the ChocoLava Paniyaram are must-tries for anyone visiting Café IDlish.",
      stars: 5,
      avatar: "👨‍💻"
    },
    {
      name: "Anjali Rao",
      location: "Dahisar",
      text: "Incredibly soft, fluffy steamed idlis. The packaging keeps the food steaming hot when it arrives. Truly authentic Tamil heritage recipes!",
      stars: 5,
      avatar: "👩‍⚕️"
    }
  ];

  const handleOrderRedirect = (outletName) => {
    setSelectedOutlet(outletName);
    setCurrentView("store");
  };

  return (
    <div className="homepage-wrapper">
      
      {/* 1. Hero Section */}
      <section className="home-hero">
        <div className="hero-bg-overlay"></div>
        <div className="hero-inner-content">
          <span className="hero-tag">Heirloom Recipes. Modern Love.</span>
          <h1 className="hero-title-main">Café IDlish</h1>
          <p className="hero-desc-main">
            Savor authentic South Indian heritage dishes cooked with cold-pressed oils, organic jaggery, and grandmother's secret spice blends.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn-order-now"
              onClick={() => setCurrentView("store")}
            >
              Order Online Now ➔
            </button>
            <a href="#about-story" className="btn-explore-menu">
              Explore Our Story
            </a>
          </div>
        </div>
      </section>

      {/* 2. Brand Value Props Section */}
      <section className="home-values">
        <div className="values-container">
          <div className="value-card">
            <span className="value-icon">🌾</span>
            <h3>100% Organic Ghee</h3>
            <p>We cook our hot crispy dosas and fluffy idlis with premium, pure cow ghee.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">👵</span>
            <h3>Heritage Recipes</h3>
            <p>Dishes passed down from Meenamma's kitchen, preserving traditional Tamil heritage flavor.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">🍃</span>
            <h3>Zero Preservatives</h3>
            <p>Our batters are fermented naturally and contain absolutely no artificial soda or chemical additives.</p>
          </div>
        </div>
      </section>

      {/* 3. Meenamma's Story Section */}
      <section id="about-story" className="home-story">
        <div className="story-container">
          <div className="story-image-box">
            <div className="heritage-badge">Since 1974</div>
            <img src="/south_indian_feast.png" alt="Traditional South Indian Feast" className="story-img" />
          </div>
          <div className="story-text-box">
            <span className="story-subtitle">The Kitchen Legend</span>
            <h2>Meenamma's Heirloom Legacy</h2>
            <p>
              Growing up in the heart of Tamil Nadu, Meenamma mastered the art of perfecting fermentations, roasting local spices to aromatic brilliance, and steaming the softest idlis. 
            </p>
            <p>
              Café IDlish brings her grandmother recipes out of the village home and into the modern bistro, mixing classic staples like Crispy Medu Vada and Mysore Dosa with creative fusion wonders like Pizza Rice Crust and Molten ChocoLava Paniyaram.
            </p>
            <div className="story-signature">
              <span className="sig-text">Meenamma</span>
              <span className="sig-sub">Master Chef & Founder</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Active Outlets Section */}
      <section className="home-outlets">
        <div className="outlets-section-inner">
          <div className="section-header-center">
            <h2>Relish Near You</h2>
            <p>Find our outlets in Mumbai, check live order statuses, and place direct pickup or delivery orders.</p>
          </div>

          <div className="homepage-outlets-grid">
            {outlets.map((o) => {
              const status = outletStatus[o.name] || "Open";
              const isClosed = status === "Closed";

              return (
                <div key={o.name} className={`home-outlet-card ${isClosed ? "closed-card" : ""}`}>
                  <span className="home-outlet-icon">{o.icon}</span>
                  <h3>Café IDlish ({o.name})</h3>
                  <p className="addr">{o.address}</p>
                  <p className="hours">🕒 {o.hours}</p>
                  <p className="phone">📞 {o.phone}</p>
                  
                  <div className={`outlet-live-tag ${isClosed ? "closed" : "open"}`}>
                    {isClosed ? "🚫 Closed for Orders" : "🟢 Accepting Orders"}
                  </div>

                  <button
                    className="home-outlet-order-btn"
                    disabled={isClosed}
                    onClick={() => handleOrderRedirect(o.name)}
                  >
                    {isClosed ? "Closed Temporarily" : "Select & Order Online ➔"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Customer Testimonials Section */}
      <section className="home-testimonials">
        <div className="testimonials-inner">
          <div className="section-header-center">
            <h2>Loved by Foodies</h2>
            <p>Hear what our regular patrons say about the IDlish kitchen experience.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-header">
                  <span className="avatar">{t.avatar}</span>
                  <div className="user-details">
                    <h4>{t.name}</h4>
                    <span>📍 {t.location}</span>
                  </div>
                </div>
                <div className="rating-stars">
                  {"⭐".repeat(t.stars)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
