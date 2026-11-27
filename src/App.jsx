import React, { useState } from "react";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
      <rect width="400" height="260" fill="#e2e8f0"/>
      <text x="200" y="135" text-anchor="middle" fill="#475569" font-size="20" font-family="Arial">Product Image</text>
    </svg>`
  );

const PRODUCTS = [
  {
    id: 1,
    name: "Laptop",
    price: 650,
    tag: "Electronics",
    image:
      "https://www.cnet.com/wp-content/uploads/sites/2/a607f46f-73e9-4382-a9f7-b0b13093156e.png?resize=1200,1200",
  },
  {
    id: 2,
    name: "Mouse",
    price: 15,
    tag: "Accessories",
    image:
      "https://m.media-amazon.com/images/I/71OsIjjXrNL.jpg",
  },
  {
    id: 3,
    name: "Keyboard",
    price: 25,
    tag: "Accessories",
    image:
      "https://www.lapcare.com/cdn/shop/files/2_a806a78f-2fcb-4abe-8949-bb4027897d6e.webp?v=1760430314&width=1080",
  },
  {
    id: 4,
    name: "Monitor",
    price: 120,
    tag: "Displays",
    image:
      "https://shop.zebronics.com/cdn/shop/files/Zeb-PA23-pic1.jpg?v=1780490709&width=2000",
  },
];

export default function App() {
  const [page, setPage] = useState("products"); // "products" | "cart" | "checkout" | "confirmation"
  const [cart, setCart] = useState([]);
  const [badgeKey, setBadgeKey] = useState(0);
  const [toast, setToast] = useState("");

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    shippingMethod: "free", // "free" ($0) | "express" ($9)
  });
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? "" : prev));
    }, 1800);
  };

  const handleImgError = (e) => {
    if (e.currentTarget.src !== FALLBACK_IMG) {
      e.currentTarget.src = FALLBACK_IMG;
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setBadgeKey((k) => k + 1);
    triggerToast(`Added "${product.name}" to cart`);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
    setBadgeKey((k) => k + 1);
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    setBadgeKey((k) => k + 1);
  };

  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingCost = customer.shippingMethod === "express" ? 9 : 0;
  const grandTotal = subtotal + shippingCost;

  const validateForm = () => {
    const nextErrors = {};
    if (!customer.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!customer.lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!customer.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      nextErrors.email = "Please enter a valid email";
    }
    if (!customer.phone.trim()) nextErrors.phone = "Phone number is required";
    if (!customer.address.trim()) nextErrors.address = "Address is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newOrder = {
      message: "Order Placed Successfully!",
      orderId: "ORD-0001",
      customerName: `${customer.firstName.trim()} ${customer.lastName.trim()}`,
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      shippingLabel:
        customer.shippingMethod === "express"
          ? "Express Shipping ($9.00)"
          : "Free Shipping ($0.00)",
      orderDate: new Date().toLocaleString(),
      items: cart.map((i) => ({ ...i })),
      subtotal,
      shippingCost,
      totalAmount: grandTotal,
      status: "Pending",
    };

    setOrder(newOrder);
    setCart([]);
    setPage("confirmation");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" onClick={() => setPage("products")}>
          <span>⚡</span>
          <span>TechStore</span>
        </div>

        <nav className="nav-group">
          <button
            className={`nav-btn ${page === "products" ? "active" : ""}`}
            onClick={() => setPage("products")}
          >
            Products
          </button>

          <button
            className={`nav-btn ${page === "cart" ? "active" : ""}`}
            onClick={() => setPage("cart")}
          >
            <span>Shopping Cart</span>
            <span key={badgeKey} className="count-pill badge-pop">
              {totalQty}
            </span>
          </button>

          {cart.length > 0 && (
            <button
              className={`nav-btn ${page === "checkout" ? "active" : ""}`}
              onClick={() => setPage("checkout")}
            >
              Checkout
            </button>
          )}
        </nav>
      </header>

      {/* 1. PRODUCTS LIST */}
      {page === "products" && (
        <main key="products" className="page-enter">
          <h1 className="section-title">Featured Products</h1>
          <div className="product-grid">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="product-card">
                <div>
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={handleImgError}
                    style={{
                      width: "100%",
                      height: 155,
                      objectFit: "cover",
                      borderRadius: 14,
                      marginBottom: 12,
                    }}
                  />
                  <div className="product-tag">{product.tag}</div>
                  <h2 className="product-name">{product.name}</h2>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* 2. SHOPPING CART */}
      {page === "cart" && (
        <main key="cart" className="page-enter">
          <h1 className="section-title">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="panel" style={{ textAlign: "center", padding: 36 }}>
              <p style={{ color: "var(--muted)", marginTop: 0 }}>
                Your shopping cart is currently empty.
              </p>
              <button
                className="btn-primary"
                style={{ width: "auto", padding: "11px 22px" }}
                onClick={() => setPage("products")}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="two-col">
              <div className="panel">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={handleImgError}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 12,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>
                          {item.name}
                        </div>
                        <div style={{ color: "var(--muted)", fontSize: 13.5 }}>
                          ${item.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>

                    <div className="qty-box">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span
                        style={{
                          minWidth: 20,
                          textAlign: "center",
                          fontWeight: 700,
                        }}
                      >
                        {item.qty}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div
                      style={{
                        fontWeight: 700,
                        minWidth: 75,
                        textAlign: "right",
                      }}
                    >
                      ${(item.price * item.qty).toFixed(2)}
                    </div>

                    <button
                      className="btn-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <aside className="panel">
                <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>Cart Summary</h2>
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-total">
                  <span>Grand Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <button
                  className="btn-primary"
                  style={{ marginTop: 18 }}
                  onClick={() => setPage("checkout")}
                >
                  Proceed to Checkout
                </button>
              </aside>
            </div>
          )}
        </main>
      )}

      {/* 3. CHECKOUT FORM */}
      {page === "checkout" && (
        <main key="checkout" className="page-enter">
          <h1 className="section-title">Checkout</h1>

          {cart.length === 0 ? (
            <div className="panel">
              <p style={{ marginTop: 0 }}>Your cart is empty.</p>
              <button
                className="btn-primary"
                style={{ width: "auto" }}
                onClick={() => setPage("products")}
              >
                Back to Products
              </button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="two-col" noValidate>
              <div className="panel">
                <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>
                  Customer Information
                </h2>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="e.g. Mouy Chheng"
                      value={customer.firstName}
                      onChange={(e) =>
                        setCustomer({ ...customer, firstName: e.target.value })
                      }
                    />
                    {errors.firstName && (
                      <span className="error-msg">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="e.g. Sot"
                      value={customer.lastName}
                      onChange={(e) =>
                        setCustomer({ ...customer, lastName: e.target.value })
                      }
                    />
                    {errors.lastName && (
                      <span className="error-msg">{errors.lastName}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={customer.email}
                      onChange={(e) =>
                        setCustomer({ ...customer, email: e.target.value })
                      }
                    />
                    {errors.email && (
                      <span className="error-msg">{errors.email}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="097........../096..........."
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                    />
                    {errors.phone && (
                      <span className="error-msg">{errors.phone}</span>
                    )}
                  </div>

                  <div className="field full">
                    <label htmlFor="address">Address *</label>
                    <textarea
                      id="address"
                      rows={3}
                      placeholder="Enter your delivery address..."
                      value={customer.address}
                      onChange={(e) =>
                        setCustomer({ ...customer, address: e.target.value })
                      }
                    />
                    {errors.address && (
                      <span className="error-msg">{errors.address}</span>
                    )}
                  </div>
                </div>

                <h3 style={{ margin: "20px 0 8px", fontSize: 16 }}>
                  Shipping Method
                </h3>
                <div className="shipping-options">
                  <label
                    className={`shipping-card ${
                      customer.shippingMethod === "free" ? "selected" : ""
                    }`}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="free"
                        checked={customer.shippingMethod === "free"}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            shippingMethod: e.target.value,
                          })
                        }
                      />
                      <strong>Free Shipping</strong>
                    </span>
                    <strong>$0.00</strong>
                  </label>

                  <label
                    className={`shipping-card ${
                      customer.shippingMethod === "express" ? "selected" : ""
                    }`}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={customer.shippingMethod === "express"}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            shippingMethod: e.target.value,
                          })
                        }
                      />
                      <strong>Express Shipping</strong>
                    </span>
                    <strong>$9.00</strong>
                  </label>
                </div>
              </div>

              <aside className="panel">
                <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>
                  Order Summary
                </h2>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="summary-line"
                    style={{ alignItems: "center", gap: 10 }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={handleImgError}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          objectFit: "cover",
                        }}
                      />
                      <span>
                        {item.name} × {item.qty}
                      </span>
                    </span>
                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="summary-total">
                  <span>Grand Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ marginTop: 18 }}
                >
                  Place Order
                </button>
              </aside>
            </form>
          )}
        </main>
      )}

      {/* 4. ORDER CONFIRMATION */}
      {page === "confirmation" && order && (
        <main key="confirmation" className="page-enter">
          <div className="panel">
            <div className="success-banner">{order.message}</div>

            <div className="form-grid" style={{ marginBottom: 18 }}>
              <div>
                <strong>Order ID:</strong> {order.orderId}
              </div>
              <div>
                <strong>Order Status:</strong> {order.status}
              </div>
              <div>
                <strong>Customer Name:</strong> {order.customerName}
              </div>
              <div>
                <strong>Order Date:</strong> {order.orderDate}
              </div>
            </div>

            <h3 style={{ margin: "12px 0 8px", fontSize: 16 }}>
              Ordered Products
            </h3>
            <ul
              style={{
                listStyle: "none",
                margin: "0 0 18px",
                padding: 0,
                display: "grid",
                gap: 10,
              }}
            >
              {order.items.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    lineHeight: 1.6,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={handleImgError}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      objectFit: "cover",
                    }}
                  />
                  <span>
                    {item.name} — Qty: {item.qty} — Subtotal: $
                    {(item.price * item.qty).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="summary-total" style={{ marginBottom: 20 }}>
              <span>Total Amount</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>

            <button
              className="btn-primary"
              style={{ width: "auto", padding: "11px 22px" }}
              onClick={() => setPage("products")}
            >
              Continue Shopping
            </button>
          </div>
        </main>
      )}

      {toast && <div className="toast-box">{toast}</div>}
    </div>
  );
}