import React from "react";
import { Link } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

export default function Navbar({
  searchTerm,
  setSearchTerm,
  setSelectedCategory,
  cart = [],
}) {
  return (
    <nav
      className="navbar navbar-expand-lg sticky-top shadow-sm"
      style={{ backgroundColor: "#2874f0" }}
    >
      <div className="container">
        {/* লোগো - ক্লিক করলে ক্যাটালগ পেজে যাবে এবং ক্যাটাগরি রিসেট হবে */}
        <Link
          to="/catalogue"
          className="navbar-brand fw-bold text-white fs-3 text-decoration-none"
          onClick={() => setSelectedCategory("All")}
        >
          ShopHub
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSearch"
        >
          <span
            className="navbar-toggler-icon"
            style={{ filter: "invert(1)" }}
          ></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSearch">
          {/* সার্চ বার */}
          <form
            className="d-flex w-100 mx-lg-4 my-2 my-lg-0"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="form-control px-3 border-0 shadow-none"
              type="search"
              placeholder="Search for products, brands and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: "4px" }}
            />
          </form>

          {/* রাইট সাইড মেন্যু */}
          <div className="d-flex align-items-center gap-4 mt-3 mt-lg-0">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>

            {/* কার্ট বাটন ও আইটেম কাউন্টার */}
            <Link
              to="/cart"
              className="text-white text-decoration-none fw-semibold d-flex align-items-center"
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
