import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useCart } from "../contexts/CartContext.jsx";
import BootstrapAlert from "../components/BootstrapAlert.jsx";
import { formatBrl, formatInr } from "./priceUtils.js";

export default function ProductCatalogue({
  searchTerm,
  selectedCategory,
  setSelectedCategory,
}) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use global CartContext

  console.log("User Signed In:", isSignedIn, "User ID:", userId);
  const [recsProducts, setRecsProducts] = useState([]);
  const [notice, setNotice] = useState(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    // Wait until Clerk finishes checking authentication
    if (!isLoaded) return;

    const clerkUserId = isSignedIn && userId ? userId : "guest";

    const controller = new AbortController();

    const fetchRecommendations = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const url = `${apiBase}/api/recommendations/${encodeURIComponent(clerkUserId)}?limit=100`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Recommendations request failed: ${response.status}`);
        }

        const data = await response.json();

        const products = (data.recommendations || []).map((product) => ({
          ...product,
          id: product.product_id,
          name: product.display_name,
          img: product.image_url,
          category: product.category_en,
          rating: product.avg_rating,
          price: Number(product.price),
        }));

        setRecsProducts(products);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load recommendations:", error);
        }
      }
    };

    fetchRecommendations();

    return () => controller.abort();
  }, [isLoaded, isSignedIn, userId]);

  // Add to Cart or Add to Bag.
  const handleAddToCart = (product) => {
    if (isSignedIn !== true) {
      navigate("/signin");
      return;
    }

    addToCart({
      product_id: product.id,
      display_name: product.name,
      image_url: product.img,
      category_en: product.category,
      price: product.price,
    });
    setNotice({
      type: "success",
      message: `${product.name} added to cart!`,
    });
  };

  // Product filtering based on search and category
  const filteredProducts = recsProducts.filter((product) => {
    const matchCategory =
      selectedCategory === "All" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ backgroundColor: "#f1f3f6", minHeight: "100vh" }}>
      <BootstrapAlert alert={notice} onClose={closeNotice} />
      {/* Sliding Images (Carousel) */}
      {/* 2. Sliding Images (Carousel) - Auto Slide with 4 Images */}
      <div
        id="ecommerceSlider"
        className="carousel slide mb-4 shadow-sm"
        data-bs-ride="carousel"
        style={{ cursor: "pointer" }}
      >
        {/* Slider indicator (4 buttons) */}
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#ecommerceSlider"
            data-bs-slide-to="0"
            className="active"
          ></button>
          <button
            type="button"
            data-bs-target="#ecommerceSlider"
            data-bs-slide-to="1"
          ></button>
          <button
            type="button"
            data-bs-target="#ecommerceSlider"
            data-bs-slide-to="2"
          ></button>
          <button
            type="button"
            data-bs-target="#ecommerceSlider"
            data-bs-slide-to="3"
          ></button>
        </div>

        <div className="carousel-inner">
          {/* ব্যানার ১: Electronics */}
          <div
            className="carousel-item active"
            data-bs-interval="3000"
            onClick={() => setSelectedCategory("Electronics")}
          >
            <img
              src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=300&fit=crop"
              className="d-block w-100"
              alt="Electronics"
              style={{ height: "300px", objectFit: "cover" }}
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-3 pb-2">
              <h3 className="fw-bold text-warning">Top Electronics Deals</h3>
              <p>Click here to explore Gadgets & Accessories</p>
            </div>
          </div>

          {/* ব্যানার ২: Fashion */}
          <div
            className="carousel-item"
            data-bs-interval="3000"
            onClick={() => setSelectedCategory("Fashion")}
          >
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=300&fit=crop"
              className="d-block w-100"
              alt="Fashion"
              style={{ height: "300px", objectFit: "cover" }}
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-3 pb-2">
              <h3 className="fw-bold text-warning">Trendy Fashion Awaits</h3>
              <p>Click to discover the latest apparel trends</p>
            </div>
          </div>

          {/* ব্যানার ৩: Home */}
          <div
            className="carousel-item"
            data-bs-interval="3000"
            onClick={() => setSelectedCategory("Home")}
          >
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=300&fit=crop"
              className="d-block w-100"
              alt="Home"
              style={{ height: "300px", objectFit: "cover" }}
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-3 pb-2">
              <h3 className="fw-bold text-warning">Home Decor & Appliances</h3>
              <p>Click to upgrade your living space</p>
            </div>
          </div>

          {/* ব্যানার ৪: Accessories (নতুন) */}
          <div
            className="carousel-item"
            data-bs-interval="3000"
            onClick={() => setSelectedCategory("Accessories")}
          >
            <img
              src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&h=300&fit=crop"
              className="d-block w-100"
              alt="Accessories"
              style={{ height: "300px", objectFit: "cover" }}
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-3 pb-2">
              <h3 className="fw-bold text-warning">Must-Have Accessories</h3>
              <p>Click to find the perfect add-ons for your style</p>
            </div>
          </div>
        </div>

        {/* স্লাইডার কন্ট্রোল বাটন */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#ecommerceSlider"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#ecommerceSlider"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
        </button>
      </div>

      {/* Product Section */}
      <div className="container pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold m-0">
            {selectedCategory === "All"
              ? "Recommended products for you"
              : `${selectedCategory} Collection`}
          </h4>
          {selectedCategory !== "All" && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => setSelectedCategory("All")}
            >
              Clear Filter ✖
            </button>
          )}
        </div>

        {/* প্রোডাক্ট গ্রিড */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div className="col" key={product.id}>
                <div
                  className="card h-100 border-0 rounded-1"
                  style={{ transition: "box-shadow 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.classList.add("shadow")}
                  onMouseOut={(e) => e.currentTarget.classList.remove("shadow")}
                >
                  <div className="p-3 text-center">
                    <img
                      src={product.img}
                      className="card-img-top"
                      alt={product.name}
                      style={{
                        height: "180px",
                        width: "auto",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div className="card-body pt-0 d-flex flex-column">
                    <h6
                      className="card-title text-truncate mb-1"
                      style={{ fontSize: "15px", color: "#212121" }}
                    >
                      {product.name}
                    </h6>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span
                        className="badge bg-success rounded-1"
                        style={{ fontSize: "12px" }}
                      >
                        {product.rating} ★
                      </span>
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        ({product.purchase_count})
                      </span>
                    </div>
                    <h5 className="fw-bold mb-3" style={{ color: "#212121" }}>
                      {formatBrl(product.price)}{" "}
                      <span className="text-muted fs-6">
                        ({formatInr(product.price)})
                      </span>
                    </h5>

                    {/* Add to Cart Button */}
                    <button
                      className="btn btn-warning w-100 mt-auto fw-bold"
                      style={{ borderRadius: "2px" }}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 bg-white shadow-sm rounded-1">
              <h5 className="text-muted">
                No products found in this category.
              </h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
