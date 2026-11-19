import { Link } from "react-router-dom";
import { Show, UserButton, useAuth } from "@clerk/react";
import { useEffect, useState } from "react";

export default function Navbar({
  searchTerm,
  setSearchTerm,
  setSelectedCategory,
  cart = [],
}) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [segmentName, setSegmentName] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      setSegmentName("");
      return;
    }

    const controller = new AbortController();

    const fetchSegment = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

        const response = await fetch(
          `${apiBase}/api/user/${encodeURIComponent(userId)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`User profile request failed (${response.status})`);
        }

        const profile = await response.json();

        const segmentMapping = {
          "Loyal Repeat Buyers": "Platinum Shopper",
          "Dormant / At-Risk Buyers": "Diamond Shopper",
          "High-Value Recent Buyers": "Gold Shopper",
          "Recent Budget Shoppers": "Silver Shopper",
        };

        setSegmentName(segmentMapping[profile.segment_name] || "");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load customer segment:", error);
          setSegmentName("");
        }
      }
    };

    fetchSegment();

    return () => controller.abort();
  }, [isLoaded, isSignedIn, userId]);

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top shadow-sm"
      style={{ backgroundColor: "#2874f0" }}
    >
      <div className="container">
        {/* Brand + Mobile Toggle */}
        <Link
          to="/"
          className="navbar-brand fw-bold text-white fs-3 text-decoration-none"
          onClick={() => setSelectedCategory("All")}
        >
          ShopHub
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span
            className="navbar-toggler-icon"
            style={{ filter: "invert(1)" }}
          />
        </button>

        {/* All Navigation Content */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          {/* Search */}
          <form
            className="d-flex flex-grow-1 mx-lg-4 my-3 my-lg-0"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="form-control px-3 border-0 shadow-none"
              type="search"
              placeholder="Search products, brands and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: "4px" }}
            />
          </form>

          {/* Navigation Actions */}
          <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 gap-lg-3 pb-3 pb-lg-0">
            <Link
              to="/allproducts"
              onClick={() => setSelectedCategory("All")}
              className="btn btn-outline-light btn-sm fw-semibold text-nowrap"
            >
              All Products
            </Link>

            <Show when="signed-out">
              <div className="d-flex flex-column flex-lg-row gap-2">
                <Link
                  to="/signin"
                  className="btn btn-light btn-sm fw-semibold text-nowrap"
                >
                  Sign in
                </Link>

                <Link
                  to="/signup"
                  className="btn btn-outline-light btn-sm fw-semibold text-nowrap"
                >
                  Sign up
                </Link>
              </div>
            </Show>

            <Show when="signed-in">
              <Link
                to="/orders"
                className="btn btn-outline-light btn-sm fw-semibold text-nowrap"
              >
                My Orders
              </Link>

              <div className="d-flex align-items-center py-1">
                <UserButton />
              </div>
            </Show>

            {segmentName && (
              <span
                className="badge bg-warning text-dark fw-semibold px-3 py-2 text-nowrap align-self-start align-self-lg-center"
                title="Customer segment"
              >
                {segmentName}
              </span>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="text-white text-decoration-none fw-semibold d-flex align-items-center py-2 py-lg-0"
            >
              🛒 Cart
              {cart.length > 0 && (
                <span className="badge bg-warning text-dark ms-2 rounded-circle px-2 py-1 shadow-sm">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
