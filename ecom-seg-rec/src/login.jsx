import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error on typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let validationErrors = {};
    
    if (!formData.email) validationErrors.email = "Email is required";
    if (!formData.password) validationErrors.password = "Password is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      console.log("Login Data:", formData);
      // বন্ধু এখানে Supabase login লজিক বসাবে
      // সফল হলে navigate('/') করে হোমপেজে পাঠাবে
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-sm p-4 border-0" style={{ maxWidth: '400px', width: '100%', borderRadius: '12px' }}>
        <h3 className="text-center fw-bold mb-4">Welcome Back</h3>
        <form onSubmit={handleSubmit} noValidate>
          
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input 
              type="email" 
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input 
              type="password" 
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
              placeholder="Enter your password" 
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mb-3">
            Login
          </button>
        </form>

        <p className="text-center mt-3 mb-0 text-secondary">
          Don't have an account? <Link to="/registration" className="text-decoration-none fw-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
}