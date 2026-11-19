import { useCallback, useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
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
import { useCart } from "../contexts/CartContext.jsx";
import BootstrapAlert from "../components/BootstrapAlert.jsx";

const OrderHistory = () => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(
          `${apiBase}/api/orders/${encodeURIComponent(userId)}`
        );
        if (!res.ok) {
          throw new Error(`Order request failed (${res.status})`);
        }
        const data = await res.json();
        setOrders(
          (data.orders || []).map((order) => ({
            ...order,
            items: (order.app_order_items || order.items || []).map((item) => ({
              ...item,
              product: item.products || item.product,
            })),
          }))
        );
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("We couldn't load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isLoaded, isSignedIn, userId]);

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

  if (!isLoaded || loading) {
    return (
      <div className="bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted fw-medium">Loading your orders...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="card border-0 shadow-sm rounded-4 text-center p-5">
          <ShoppingBag size={48} className="text-secondary opacity-50 mb-3" />
          <h5 className="fw-bold">Sign in to view your orders</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <BootstrapAlert alert={notice} onClose={closeNotice} />
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

        {error && (
          <div className="alert alert-danger rounded-3" role="alert">
            {error}
          </div>
        )}

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
                          setNotice({
                            type: "info",
                            message: `Invoice for #${order.order_id
                              .slice(0, 8)
                              .toUpperCase()} is not available yet.`,
                          })
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
                                  setNotice({
                                    type: "info",
                                    message: "Tracking details coming soon!",
                                  })
                                }
                                className="btn btn-primary btn-sm rounded-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 w-100"
                                style={{ maxWidth: "160px" }}
                              >
                                <Truck size={14} /> Track Package
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!item.product) return;
                                  addToCart({
                                    product_id: item.product_id,
                                    display_name: item.product.display_name,
                                    image_url: item.product.image_url,
                                    category_en: item.product.category_en,
                                    price: Number(item.unit_price),
                                  }, item.quantity);
                                }}
                                className="btn btn-dark btn-sm rounded-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 w-100"
                                style={{ maxWidth: "160px" }}
                              >
                                <RotateCcw size={14} /> Buy Again
                              </button>
                            )}

                            {statusType === "delivered" && (
                              <button
                                onClick={() =>
                              setNotice({
                                type: "info",
                                message: "Review modal coming soon!",
                              })
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