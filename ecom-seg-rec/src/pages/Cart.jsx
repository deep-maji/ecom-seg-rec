import React from 'react';
import { Link } from 'react-router-dom';

export default function Cart({ cart, setCart }) {
  // কার্টের মোট দাম হিসাব করা
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // প্রোডাক্ট রিমুভ ফাংশন
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // সিমুলেটেড চেকআউট ফাংশন
  const handleCheckout = () => {
    alert("Simulated Checkout Successful! 🎉\n\nThis is an academic prototype. No real payment was processed.");
    setCart([]); // চেকআউটের পর কার্ট খালি করে দেওয়া হলো
  };

  return (
    <div style={{ backgroundColor: '#f1f3f6', minHeight: '100vh' }} className="py-4">
      <div className="container">
        <h3 className="fw-bold mb-4">Shopping Cart</h3>

        <div className="row">
          {/* কার্ট আইটেম লিস্ট */}
          <div className="col-md-8">
            {cart.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-1 p-5 text-center">
                <h4 className="text-muted mb-3">Your cart is empty!</h4>
                <p>Explore our wide range of products and add them to your cart.</p>
                <Link to="/catalogue" className="btn btn-primary fw-bold mt-2 mx-auto" style={{ width: '200px' }}>
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-1 mb-3">
                <div className="card-body p-0">
                  {cart.map((item, index) => (
                    <div key={index} className="d-flex align-items-center p-3 border-bottom">
                      <img src={item.img} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'contain' }} className="me-4" />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                        <p className="text-muted small mb-2">Category: {item.category}</p>
                        <h5 className="fw-bold mb-0">₹{item.price.toLocaleString('en-IN')} <span className="text-muted fs-6">x {item.quantity}</span></h5>
                      </div>
                      <button className="btn btn-outline-danger fw-bold rounded-1" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* অর্ডার সামারি (ডানদিকে) */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-1 p-4 sticky-top" style={{ top: '80px' }}>
              <h5 className="fw-bold text-secondary mb-4 pb-2 border-bottom">PRICE DETAILS</h5>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Price ({cart.length} items)</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 text-success">
                <span>Delivery Charges</span>
                <span>FREE</span>
              </div>
              
              <div className="d-flex justify-content-between mb-4 pb-3 border-bottom fw-bold fs-5">
                <span>Total Amount</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>

              {/* সিমুলেটেড চেকআউট বাটন */}
              <button 
                className="btn btn-warning w-100 fw-bold py-2 mb-2" 
                style={{ backgroundColor: '#fb641b', color: 'white', border: 'none', borderRadius: '2px' }}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                PLACE ORDER (SIMULATED)
              </button>
              <small className="text-muted text-center d-block" style={{ fontSize: '11px' }}>
                *This is a simulation. No real payments are processed.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}