import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Truck,
  XCircle,
  RotateCcw,
  FileText,
  ShoppingBag,
  Star,
  Clock,
} from "lucide-react";

// ✅ ডামি ডেটা (তোমার বন্ধুর PostgreSQL Schema অনুযায়ী)
const DUMMY_ORDERS = [
  {
    order_id: "550e8400-e29b-41d4-a716-446655440000",
    clerk_user_id: "user_2abc123xyz",
    total_amount: 3499.0,
    order_status: "simulated_delivered",
    created_at: "2026-11-15T10:30:00Z",
    items: [
      {
        item_id: 1,
        product_id: "prod_elec_01",
        quantity: 1,
        unit_price: 2499.0,
        product: {
          display_name: "Wireless Noise Cancelling Over-Ear Headphones",
          image_url:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
          category_en: "electronics",
        },
      },
      {
        item_id: 2,
        product_id: "prod_acc_02",
        quantity: 2,
        unit_price: 500.0,
        product: {
          display_name: "Braided USB-C 65W Fast Charging Cable (2m)",
          image_url:
            "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300",
          category_en: "electronics",
        },
      },
    ],
  },
  {
    order_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    clerk_user_id: "user_2abc123xyz",
    total_amount: 1850.0,
    order_status: "processing",
    created_at: "2026-11-18T14:20:00Z",
    items: [
      {
        item_id: 3,
        product_id: "prod_watch_09",
        quantity: 1,
        unit_price: 1850.0,
        product: {
          display_name: "Minimalist Analog Brown Leather Strap Watch",
          image_url:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
          category_en: "watches_gifts",
        },
      },
    ],
  },
  {
    order_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    clerk_user_id: "user_2abc123xyz",
    total_amount: 1299.0,
    order_status: "cancelled",
    created_at: "2026-11-10T09:15:00Z",
    items: [
      {
        item_id: 4,
        product_id: "prod_shoe_12",
        quantity: 1,
        unit_price: 1299.0,
        product: {
          display_name: "Lightweight Mesh Running Sneakers - Black",
          image_url:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
          category_en: "fashion_shoes",
        },
      },
    ],
  },
];

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 🔌 ব্যাকএন্ড API রেডি হলে এখানে fetch / axios বসাবে:
    /*
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders/${clerkUserId}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    */

    setTimeout(() => {
      setOrders(DUMMY_ORDERS);
      setLoading(false);
    }, 300);
  }, []);

  const getNormalizedStatus = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "simulated_delivered" || s === "delivered") return "delivered";
    if (s === "cancelled") return "cancelled";
    return "processing";
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch =
      activeTab === "all" ||
      getNormalizedStatus(order.order_status) === activeTab;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return statusMatch;

    const idMatch = order.order_id.toLowerCase().includes(query);
    const productMatch = order.items?.some((item) =>
      item.product?.display_name?.toLowerCase().includes(query)
    );

    return statusMatch && (idMatch || productMatch);
  });

  const renderStatusBadge = (status, dateStr) => {
    const type = getNormalizedStatus(status);
    const formattedDate = new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (type === "delivered") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1 fw-semibold">
          <CheckCircle2 size={15} /> Delivered on {formattedDate}
        </span>
      );
    }
    if (type === "cancelled") {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1 fw-semibold">
          <XCircle size={15} /> Order Cancelled
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1 fw-semibold">
        <Truck size={15} /> In Transit / Processing
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted fw-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Header & Search Row */}
        <div className="row align-items-center justify-content-between mb-4 g-3">
          <div className="col-md-7">
            <h2 className="fw-bold text-dark mb-1">Your Orders</h2>
            <p className="text-muted mb-0 small">
              Track your recent purchases, download invoices, or buy items again.
            </p>
          </div>

          <div className="col-md-5">
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by product or Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <ul className="nav nav-pills mb-4 gap-2">
          {[
            { id: "all", label: "All Orders" },
            { id: "processing", label: "Processing" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <li className="nav-item" key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`nav-link rounded-pill px-4 fw-semibold ${
                  activeTab === tab.id
                    ? "active bg-dark text-white shadow-sm"
                    : "bg-white text-secondary border"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 text-center py-5">
            <div className="card-body">
              <ShoppingBag size={48} className="text-secondary opacity-50 mb-3" />
              <h5 className="fw-bold text-dark">No orders found</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "Try searching with a different product name or Order ID."
                  : "You haven't placed any orders in this category yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {filteredOrders.map((order) => {
              const statusType = getNormalizedStatus(order.order_status);

              return (
                <div
                  key={order.order_id}
                  className="card border-0 shadow-sm rounded-4 overflow-hidden"
                >
                  {/* Order Top Meta Bar */}
                  <div className="card-header bg-white border-bottom py-3 px-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                      <div className="d-flex flex-wrap gap-4 gap-md-5">
                        <div>
                          <div
                            className="text-uppercase text-muted fw-bold"
                            style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                          >
                            Order Placed
                          </div>
                          <div className="fw-semibold text-dark small">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </div>

                        <div>
                          <div
                            className="text-uppercase text-muted fw-bold"
                            style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                          >
                            Total Amount
                          </div>
                          <div className="fw-bold text-dark small">
                            ₹
                            {Number(order.total_amount).toLocaleString(
                              "en-IN",
                              { minimumFractionDigits: 2 }
                            )}
                          </div>
                        </div>

                        <div>
                          <div
                            className="text-uppercase text-muted fw-bold"
                            style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                          >
                            Order ID
                          </div>
                          <div
                            className="font-monospace text-secondary small fw-semibold"
                            title={order.order_id}
                          >
                            #{order.order_id.slice(0, 8).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          alert(
                            `Downloading invoice for #${order.order_id
                              .slice(0, 8)
                              .toUpperCase()}`
                          )
                        }
                        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1 rounded-3 fw-semibold"
                      >
                        <FileText size={14} /> Invoice
                      </button>
                    </div>
                  </div>

                  {/* Status Strip */}
                  <div className="px-4 pt-3 pb-2 bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                    {renderStatusBadge(order.order_status, order.created_at)}
                    {statusType === "processing" && (
                      <span className="text-muted small d-inline-flex align-items-center gap-1">
                        <Clock size={14} /> Arriving soon
                      </span>
                    )}
                  </div>

                  {/* Order Line Items */}
                  <div className="list-group list-group-flush">
                    {order.items?.map((item) => (
                      <div
                        key={item.item_id}
                        className="list-group-item px-4 py-3 border-light"
                      >
                        <div className="row align-items-center g-3">
                          {/* Product Image + Details */}
                          <div className="col-md-8 d-flex align-items-start gap-3">
                            <img
                              src={
                                item.product?.image_url ||
                                "https://via.placeholder.com/100"
                              }
                              alt={item.product?.display_name}
                              className="rounded-3 border flex-shrink-0"
                              style={{
                                width: "84px",
                                height: "84px",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <h6 className="fw-bold text-dark mb-1">
                                {item.product?.display_name || item.product_id}
                              </h6>
                              <span className="badge bg-light text-secondary border text-capitalize mb-2">
                                {item.product?.category_en?.replace("_", " ")}
                              </span>
                              <div className="d-flex align-items-center gap-3 small">
                                <span className="text-muted">
                                  Qty:{" "}
                                  <strong className="text-dark">
                                    {item.quantity}
                                  </strong>
                                </span>
                                <span className="text-muted">•</span>
                                <span className="fw-bold text-dark">
                                  ₹
                                  {(
                                    item.quantity * Number(item.unit_price)
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="col-md-4 d-flex flex-row flex-md-column gap-2 justify-content-md-end align-items-md-end">
                            {statusType === "processing" ? (
                              <button
                                onClick={() =>
                                  alert("Tracking details coming soon!")
                                }
                                className="btn btn-primary btn-sm rounded-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 w-100"
                                style={{ maxWidth: "160px" }}
                              >
                                <Truck size={14} /> Track Package
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  alert(
                                    `Added "${item.product?.display_name}" to cart!`
                                  )
                                }
                                className="btn btn-dark btn-sm rounded-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 w-100"
                                style={{ maxWidth: "160px" }}
                              >
                                <RotateCcw size={14} /> Buy Again
                              </button>
                            )}

                            {statusType === "delivered" && (
                              <button
                                onClick={() =>
                                  alert("Review modal coming soon!")
                                }
                                className="btn btn-outline-secondary btn-sm rounded-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 w-100"
                                style={{ maxWidth: "160px" }}
                              >
                                <Star size={14} className="text-warning" />{" "}
                                Write Review
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;