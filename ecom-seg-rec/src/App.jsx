import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// import Registration from "./signup";
import ProductCatalogue from "./pages/ProductCatalogue";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart"; // নতুন কার্ট ইম্পোর্ট
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import OrderHistory from "./pages/OrderHistory";
import AllProducts from "./pages/AllProducts";
import { useCart } from "./contexts/CartContext.jsx";

function AppContent() {
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { cart } = useCart();

  const hideNavbar =
    location.pathname === "/signin" || location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && (
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSelectedCategory={setSelectedCategory}
          cart={cart}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <ProductCatalogue
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          }
        />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* কার্ট পেজের রাউট */}
        <Route path="/cart" element={<Cart />} />
        {/* ✅ অর্ডার হিস্ট্রি পেজের রাউট */}
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/allproducts" element={<AllProducts />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
