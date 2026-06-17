import React from "react";

export default function OutletSelector({ selectedOutlet, setSelectedOutlet, outletStatus }) {
  const outlets = [
    {
      id: "goregaon",
      name: "Goregaon East",
      address: "Shop 10, Yashodham Shopping Centre, Aba Karmarkar Rd, Mumbai",
      phone: "+91 98765 43210",
      image: "🕌"
    },
    {
      id: "vileparle",
      name: "Vile Parle West",
      address: "Shop No. 4, 2 Himalaya Bldg, S V Road, Mumbai",
      phone: "+91 98765 98765",
      image: "🏢"
    }
  ];

  return (
    <div className="outlet-selector-overlay">
      <div className="outlet-selector-card">
        <div className="outlet-selector-header">
          <div className="logo-badge">IDlish</div>
          <h1>Cafe IDlish</h1>
          <p className="subtitle">Idli Dosa Relish — Authentic South Indian Bistro</p>
          <h2>Choose a Location to Order Online</h2>
        </div>

        <div className="outlets-grid">
          {outlets.map((o) => {
            const status = outletStatus[o.name] || "Open";
            const isClosed = status === "Closed";

            return (
              <div
                key={o.id}
                className={`outlet-card ${isClosed ? "disabled" : ""}`}
                onClick={() => {
                  if (!isClosed) {
                    setSelectedOutlet(o.name);
                  }
                }}
              >
                <div className="outlet-icon">{o.image}</div>
                <h3>{o.name}</h3>
                <p className="outlet-address">{o.address}</p>
                <p className="outlet-phone">📞 {o.phone}</p>
                <div className={`status-tag ${isClosed ? "closed" : "open"}`}>
                  {isClosed ? "🚫 Closed for Orders" : "🟢 Accepting Orders"}
                </div>
                {!isClosed && <button className="select-btn">Order Now</button>}
              </div>
            );
          })}
        </div>

        <div className="outlet-selector-footer">
          <p>Fresh ingredients, grandmother's recipes, modern love.</p>
        </div>
      </div>
    </div>
  );
}
