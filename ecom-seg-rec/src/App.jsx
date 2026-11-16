import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './login';
import Registration from './Registration';
import ProductCatalogue from './ProductCatalogue';
import Navbar from './Navbar';
import Cart from './Cart'; // নতুন কার্ট ইম্পোর্ট

function AppContent() {
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // কার্টের জন্য নতুন গ্লোবাল স্টেট
  const [cart, setCart] = useState([]);

  const hideNavbar = location.pathname === '/login' || location.pathname === '/registration';

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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        
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