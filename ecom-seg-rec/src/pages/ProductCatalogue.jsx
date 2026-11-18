import { useAuth } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// ডামি প্রোডাক্ট ডেটা
// 50+ Realistic Dummy Products for Ecommerce Prototype
const dummyProducts = [
  // Electronics (15 Items)
  { id: 1, name: 'Sony Noise Cancelling Headphones', category: 'Electronics', price: 12500, rating: 4.8, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
  { id: 2, name: 'Apple Watch Series 8', category: 'Electronics', price: 42000, rating: 4.9, img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80' },
  { id: 3, name: 'MacBook Pro M2 14-inch', category: 'Electronics', price: 195000, rating: 4.9, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80' },
  { id: 4, name: 'iPhone 14 Pro Max', category: 'Electronics', price: 139900, rating: 4.8, img: 'https://images.unsplash.com/photo-1530319067432-f2a729c02175?w=500&q=80' },
  { id: 5, name: 'Samsung Galaxy S23 Ultra', category: 'Electronics', price: 124999, rating: 4.7, img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80' },
  { id: 6, name: 'Dell XPS 13 Laptop', category: 'Electronics', price: 115000, rating: 4.6, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80' },
  { id: 7, name: 'AirPods Pro (2nd Gen)', category: 'Electronics', price: 24900, rating: 4.8, img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80' },
  { id: 8, name: 'Canon EOS R5 Camera', category: 'Electronics', price: 310000, rating: 4.9, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80' },
  { id: 9, name: 'Nintendo Switch OLED', category: 'Electronics', price: 34990, rating: 4.7, img: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&q=80' },
  { id: 10, name: 'LG 55" OLED 4K Smart TV', category: 'Electronics', price: 112000, rating: 4.8, img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80' },
  { id: 11, name: 'GoPro HERO11 Black', category: 'Electronics', price: 44990, rating: 4.6, img: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=500&q=80' },
  { id: 12, name: 'Asus ROG Gaming Monitor', category: 'Electronics', price: 32000, rating: 4.7, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80' },
  { id: 13, name: 'Logitech MX Master 3S Mouse', category: 'Electronics', price: 9500, rating: 4.8, img: 'https://images.unsplash.com/photo-1527814050087-379381547946?w=500&q=80' },
  { id: 14, name: 'Amazon Echo Dot (5th Gen)', category: 'Electronics', price: 4499, rating: 4.4, img: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&q=80' },
  { id: 15, name: 'DJI Mini 3 Pro Drone', category: 'Electronics', price: 82000, rating: 4.9, img: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=500&q=80' },

  // Fashion (15 Items)
  { id: 16, name: 'Men\'s Casual Sneakers', category: 'Fashion', price: 2200, rating: 4.5, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' },
  { id: 17, name: 'Premium Leather Jacket', category: 'Fashion', price: 5500, rating: 4.7, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80' },
  { id: 18, name: 'Men\'s Classic White T-Shirt', category: 'Fashion', price: 699, rating: 4.3, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80' },
  { id: 19, name: 'Levi\'s 511 Slim Fit Jeans', category: 'Fashion', price: 2599, rating: 4.6, img: 'https://images.unsplash.com/photo-1542272604-780c823d53bb?w=500&q=80' },
  { id: 20, name: 'Nike Air Max 270', category: 'Fashion', price: 12995, rating: 4.8, img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=500&q=80' },
  { id: 21, name: 'Women\'s Floral Summer Dress', category: 'Fashion', price: 1899, rating: 4.4, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80' },
  { id: 22, name: 'Adidas Ultraboost Running Shoes', category: 'Fashion', price: 14500, rating: 4.9, img: 'https://images.unsplash.com/photo-1584735174965-48c48d40299e?w=500&q=80' },
  { id: 23, name: 'Men\'s Formal Oxford Shoes', category: 'Fashion', price: 3499, rating: 4.5, img: 'https://images.unsplash.com/photo-1614252235316-846576136223?w=500&q=80' },
  { id: 24, name: 'Puma Sports Trackpants', category: 'Fashion', price: 1499, rating: 4.3, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80' },
  { id: 25, name: 'H&M Oversized Hoodie', category: 'Fashion', price: 2299, rating: 4.6, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80' },
  { id: 26, name: 'Zara Plaid Checkered Shirt', category: 'Fashion', price: 1990, rating: 4.4, img: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80' },
  { id: 27, name: 'Women\'s High-Waist Trousers', category: 'Fashion', price: 1799, rating: 4.5, img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80' },
  { id: 28, name: 'Tommy Hilfiger Polo Shirt', category: 'Fashion', price: 3200, rating: 4.7, img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80' },
  { id: 29, name: 'Winter Puffer Jacket', category: 'Fashion', price: 4500, rating: 4.6, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80' },
  { id: 30, name: 'Classic Denim Jacket', category: 'Fashion', price: 2899, rating: 4.5, img: 'https://images.unsplash.com/photo-1576871337644-24a408f5bf94?w=500&q=80' },

  // Home & Kitchen (10 Items)
  { id: 31, name: 'Smart Espresso Maker', category: 'Home', price: 8500, rating: 4.6, img: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=500&q=80' },
  { id: 32, name: 'Minimalist Desk Lamp', category: 'Home', price: 1200, rating: 4.4, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80' },
  { id: 33, name: 'Ergonomic Office Chair', category: 'Home', price: 6500, rating: 4.5, img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80' },
  { id: 34, name: 'Wooden Study Desk', category: 'Home', price: 5500, rating: 4.6, img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80' },
  { id: 35, name: 'Cotton Bed Sheet Set', category: 'Home', price: 1299, rating: 4.3, img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80' },
  { id: 36, name: 'Dyson V15 Vacuum Cleaner', category: 'Home', price: 54900, rating: 4.9, img: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&q=80' },
  { id: 37, name: 'Philips Air Fryer XL', category: 'Home', price: 9999, rating: 4.7, img: 'https://images.unsplash.com/photo-1626200419189-39c8c871576b?w=500&q=80' },
  { id: 38, name: 'Indoor Potted Plant', category: 'Home', price: 850, rating: 4.8, img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80' },
  { id: 39, name: 'Velvet Throw Pillows (Set of 2)', category: 'Home', price: 999, rating: 4.4, img: 'https://images.unsplash.com/photo-1583847268964-b28ce8f3009c?w=500&q=80' },
  { id: 40, name: 'Smart WiFi LED Bulb', category: 'Home', price: 699, rating: 4.5, img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&q=80' },

  // Accessories (10 Items)
  { id: 41, name: 'Polarized Aviator Sunglasses', category: 'Accessories', price: 1800, rating: 4.3, img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80' },
  { id: 42, name: 'Waterproof Travel Backpack', category: 'Accessories', price: 2100, rating: 4.8, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80' },
  { id: 43, name: 'Fossil Chronograph Watch', category: 'Accessories', price: 9500, rating: 4.7, img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80' },
  { id: 44, name: 'Casio G-Shock Matte Black', category: 'Accessories', price: 6995, rating: 4.8, img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80' },
  { id: 45, name: 'Genuine Leather Wallet', category: 'Accessories', price: 1250, rating: 4.6, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80' },
  { id: 46, name: 'Minimalist Silver Ring', category: 'Accessories', price: 899, rating: 4.4, img: 'https://images.unsplash.com/photo-1605100804763-247f67b6348e?w=500&q=80' },
  { id: 47, name: 'Canvas Tote Bag', category: 'Accessories', price: 499, rating: 4.2, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80' },
  { id: 48, name: 'Winter Beanie Hat', category: 'Accessories', price: 650, rating: 4.5, img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80' },
  { id: 49, name: 'Men\'s Reversible Leather Belt', category: 'Accessories', price: 1100, rating: 4.3, img: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&q=80' },
  { id: 50, name: 'Gym Duffel Bag', category: 'Accessories', price: 1599, rating: 4.6, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80' }
];

export default function ProductCatalogue({ searchTerm, selectedCategory, setSelectedCategory, cart, setCart }) {
  const { isSignedIn, userId } = useAuth();
  const navigate = useNavigate();

  console.log('User Signed In:', isSignedIn, 'User ID:', userId);
  const [recsProducts, setRecsProducts] = useState([]);
  const [segment, setSegment] = useState('');

  useEffect(() => {
    const clerkUserId = isSignedIn && userId ? userId : 'guest';
    const url = `http://127.0.0.1:8000/api/recommendations/${encodeURIComponent(clerkUserId)}?limit=24`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Recommendations request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
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
        setSegment(data.segment_name);
      })
      .catch((error) => {
        console.error('Unable to load recommendations:', error);
      });
  }, [isSignedIn, userId]);

  console.log('Recommendations:', recsProducts, 'Segment:', segment);
  
  // প্রোডাক্ট কার্টে অ্যাড করার ফাংশন
  const addToCart = (product) => {
    if (isSignedIn !== true) {
      navigate('/signin');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    alert(`${product.name} added to cart! 🛒`);
  };

  // সার্চ এবং ক্যাটাগরির ওপর ভিত্তি করে প্রোডাক্ট ফিল্টার
  const filteredProducts = recsProducts.filter(product => {
    const matchCategory =
      selectedCategory === 'All' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ backgroundColor: '#f1f3f6', minHeight: '100vh' }}>
      
      {/* Sliding Images (Carousel) */}
      {/* 2. Sliding Images (Carousel) - Auto Slide with 4 Images */}
      <div id="ecommerceSlider" className="carousel slide mb-4 shadow-sm" data-bs-ride="carousel" style={{ cursor: 'pointer' }}>
        
        {/* স্লাইডার ইন্ডিকেটর (৪টি বাটন) */}
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#ecommerceSlider" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#ecommerceSlider" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#ecommerceSlider" data-bs-slide-to="2"></button>
          <button type="button" data-bs-target="#ecommerceSlider" data-bs-slide-to="3"></button>
        </div>
        
        <div className="carousel-inner">
          {/* ব্যানার ১: Electronics */}
          <div className="carousel-item active" data-bs-interval="3000" onClick={() => setSelectedCategory('Electronics')}>
            <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=300&fit=crop" className="d-block w-100" alt="Electronics" style={{ height: '300px', objectFit: 'cover' }} />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-3 pb-2">
              <h3 className="fw-bold text-warning">Top Electronics Deals</h3>
              <p>Click here to explore Gadgets & Accessories</p>
            </div>
          </div>
          
          {/* ব্যানার ২: Fashion */}
          <div className="carousel-item" data-bs-interval="3000" onClick={() => setSelectedCategory('Fashion')}>
            <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=300&fit=crop" className="d-block w-100" alt="Fashion" style={{ height: '300px', objectFit: 'cover' }} />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-3 pb-2">
              <h3 className="fw-bold text-warning">Trendy Fashion Awaits</h3>
              <p>Click to discover the latest apparel trends</p>
            </div>
          </div>

          {/* ব্যানার ৩: Home */}
          <div className="carousel-item" data-bs-interval="3000" onClick={() => setSelectedCategory('Home')}>
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=300&fit=crop" className="d-block w-100" alt="Home" style={{ height: '300px', objectFit: 'cover' }} />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-3 pb-2">
              <h3 className="fw-bold text-warning">Home Decor & Appliances</h3>
              <p>Click to upgrade your living space</p>
            </div>
          </div>

          {/* ব্যানার ৪: Accessories (নতুন) */}
          <div className="carousel-item" data-bs-interval="3000" onClick={() => setSelectedCategory('Accessories')}>
            <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&h=300&fit=crop" className="d-block w-100" alt="Accessories" style={{ height: '300px', objectFit: 'cover' }} />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-3 pb-2">
              <h3 className="fw-bold text-warning">Must-Have Accessories</h3>
              <p>Click to find the perfect add-ons for your style</p>
            </div>
          </div>
        </div>
        
        {/* স্লাইডার কন্ট্রোল বাটন */}
        <button className="carousel-control-prev" type="button" data-bs-target="#ecommerceSlider" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#ecommerceSlider" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>

      {/* Product Section */}
      <div className="container pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold m-0">
            {selectedCategory === 'All' ? 'Best Sellers' : `${selectedCategory} Collection`}
          </h4>
          {selectedCategory !== 'All' && (
            <button className="btn btn-sm btn-outline-danger" onClick={() => setSelectedCategory('All')}>
              Clear Filter ✖
            </button>
          )}
        </div>

        {/* প্রোডাক্ট গ্রিড */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div className="col" key={product.id}>
                <div className="card h-100 border-0 rounded-1" style={{ transition: 'box-shadow 0.2s' }} onMouseOver={e => e.currentTarget.classList.add('shadow')} onMouseOut={e => e.currentTarget.classList.remove('shadow')}>
                  <div className="p-3 text-center">
                    <img src={product.img} className="card-img-top" alt={product.name} style={{ height: '180px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <div className="card-body pt-0 d-flex flex-column">
                    <h6 className="card-title text-truncate mb-1" style={{ fontSize: '15px', color: '#212121' }}>{product.name}</h6>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-success rounded-1" style={{ fontSize: '12px' }}>{product.rating} ★</span>
                      <span className="text-muted" style={{ fontSize: '12px' }}>({Math.floor(Math.random() * 500) + 50})</span>
                    </div>
                    <h5 className="fw-bold mb-3" style={{ color: '#212121' }}>₹{product.price.toLocaleString('en-IN')}</h5>
                    
                    {/* Add to Cart Button */}
                    <button 
                      className="btn btn-warning w-100 mt-auto fw-bold" 
                      style={{ borderRadius: '2px' }}
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 bg-white shadow-sm rounded-1">
              <h5 className="text-muted">No products found in this category.</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}