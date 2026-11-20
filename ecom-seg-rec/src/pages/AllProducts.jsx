import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Star } from "lucide-react";
import { useCart } from "../contexts/CartContext.jsx";
import { formatBrl, formatInr } from "./priceUtils.js";

export default function AllProducts() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${apiBase}/api/products`);
        if (!response.ok) {
          throw new Error(`Products request failed (${response.status})`);
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (fetchError) {
        console.error("Unable to load products:", fetchError);
        setError("We couldn't load the products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category_en).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category_en === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.display_name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    if (!isSignedIn) {
      navigate("/signin");
      return;
    }

    addToCart({
      product_id: product.product_id,
      display_name: product.display_name,
      image_url: product.image_url,
      category_en: product.category_en,
      price: Number(product.price),
    });
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted fw-medium">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "1200px" }}>
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">All Products</h2>
            <p className="text-muted mb-0">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          <div className="input-group shadow-sm" style={{ maxWidth: "360px" }}>
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} />
            </span>
            <input
              type="search"
              className="form-control border-start-0"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`btn btn-sm rounded-pill px-3 ${
                selectedCategory === category
                  ? "btn-dark"
                  : "btn-white border bg-white"
              }`}
            >
              {category.replaceAll("_", " ")}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-danger rounded-3" role="alert">
            {error}
          </div>
        )}

        {filteredProducts.length === 0 && !error ? (
          <div className="card border-0 shadow-sm rounded-4 text-center py-5">
            <div className="card-body">
              <ShoppingCart size={48} className="text-secondary opacity-50 mb-3" />
              <h5 className="fw-bold">No products found</h5>
              <p className="text-muted mb-0">Try a different search or category.</p>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {filteredProducts.map((product) => (
              <div className="col" key={product.product_id}>
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <img
                    src={product.image_url || "https://via.placeholder.com/600"}
                    alt={product.display_name}
                    className="card-img-top"
                    style={{ height: "220px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column p-3">
                    <span className="badge bg-light text-secondary border align-self-start text-capitalize mb-2">
                      {product.category_en?.replaceAll("_", " ")}
                    </span>
                    <h6 className="fw-bold text-dark mb-2">
                      {product.display_name}
                    </h6>
                    <p
                      className="text-muted small mb-3"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.description}
                    </p>

                    <div className="d-flex align-items-center justify-content-between mt-auto mb-3">
                      <strong className="text-dark fs-5">
                        {formatBrl(product.price)}{" "}
                        <span className="text-muted fs-6">
                          ({formatInr(product.price)})
                        </span>
                      </strong>
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        <Star size={13} fill="currentColor" className="me-1" />
                        {Number(product.avg_rating).toFixed(1)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-dark w-100 d-inline-flex align-items-center justify-content-center gap-2 fw-semibold"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
