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

function AppContent() {
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // কার্টের জন্য নতুন গ্লোবাল স্টেট
  const [cart, setCart] = useState([]);

  const hideNavbar =
    location.pathname === "/signin" || location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && (
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSelectedCategory={setSelectedCategory}
          cart={cart} // ন্যাভবারে কার্ট ডেটা পাঠানো হচ্ছে
        />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route
          path="/catalogue"
          element={
            <ProductCatalogue
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              cart={cart}
              setCart={setCart} // ক্যাটালগে কার্ট ডেটা পাঠানো হচ্ছে
            />
          }
        />

        {/* কার্ট পেজের রাউট */}
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
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
