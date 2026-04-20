import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [user, navigate]);

  const loadWishlist = () => {
    setLoading(true);
    // Try API first, fallback to localStorage
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(savedWishlist);
    setLoading(false);
  };

  const removeFromWishlist = (destinationId) => {
    const newWishlist = wishlist.filter(item => (item._id || item.id) !== destinationId);
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    toast.success('Removed from wishlist');
  };

  const calculateTotalBudget = () => {
    let total = 0;
    wishlist.forEach(item => {
      const priceStr = item.price || '';
      const numbers = priceStr.match(/\d+/g);
      if (numbers) {
        total += parseInt(numbers[0]) || 0;
      }
    });
    return total.toLocaleString();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div>Loading your wishlist...</div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {/* Top Navigation - Consistent with TouristPage */}
      <nav className="top-nav">
        <div className="logo">
          <span className="flag">🇪🇹</span>
          <span className="brand">Ethiopia Travel</span>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Destinations</Link>
          <Link to="/wishlist" className="nav-link active">Wishlist</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/translator" className="nav-link">Translator</Link>
          <Link to="/currency" className="nav-link">Currency</Link>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="wishlist-hero">
        <h1>My Wishlist</h1>
        <p>{wishlist.length} saved destinations • Dream trips waiting to happen</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h2>Your wishlist is empty</h2>
          <p>Start exploring and save destinations you love</p>
          <Link to="/" className="explore-btn">Browse Destinations</Link>
        </div>
      ) : (
        <>
          <div className="budget-summary">
            <div className="budget-box">
              <span className="budget-label">Estimated Total Budget</span>
              <span className="budget-amount">{calculateTotalBudget()} ETB</span>
              <span className="budget-note">* Rough estimate for all destinations</span>
            </div>
          </div>

          <div className="wishlist-grid">
            {wishlist.map((dest) => {
              const destId = dest._id || dest.id;
              const image = dest.images?.[0] || dest.imageUrl || "https://i.pinimg.com/736x/e6/c6/6d/e6c66dd3d26469e205da54776ef0259c.jpg";

              return (
                <div key={destId} className="wishlist-card">
                  <div className="card-image">
                    <img src={image} alt={dest.name} />
                    <div className="rating">⭐ {dest.rating || 4.7}</div>
                  </div>

                  <div className="card-content">
                    <h3>{dest.name}</h3>
                    <p className="location">📍 {dest.region || dest.location}</p>
                    <p className="price">{dest.price}</p>
                    <p className="description">
                      {(dest.description || '').substring(0, 110)}...
                    </p>

                    <div className="card-actions">
                      <Link to={`/destination/${destId}`} className="btn-view">
                        View Details
                      </Link>
                      <Link to={`/bookings/${destId}`} className="btn-book">
                        Book Now
                      </Link>
                      <button 
                        onClick={() => removeFromWishlist(destId)} 
                        className="btn-remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style jsx>{`
        .wishlist-page {
          background: #0a1729;
          min-height: 100vh;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        }

        .top-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          padding: 20px 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(250, 204, 21, 0.2);
        }

        .logo { display: flex; align-items: center; gap: 12px; font-size: 28px; font-weight: 700; }
        .brand { background: linear-gradient(90deg, #facc15, #eab308); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .nav-links { display: flex; gap: 24px; align-items: center; }
        .nav-link { color: #e2e8f0; text-decoration: none; font-weight: 500; }
        .nav-link.active { color: #facc15; border-bottom: 2px solid #facc15; }
        .logout-btn {
          padding: 10px 24px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
        }

        .wishlist-hero {
          text-align: center;
          padding: 80px 20px 40px;
        }
        .wishlist-hero h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 12px;
          color: #facc15;
        }
        .wishlist-hero p {
          font-size: 1.3rem;
          color: #cbd5e1;
        }

        .budget-summary {
          max-width: 600px;
          margin: 0 auto 40px;
          padding: 0 20px;
        }
        .budget-box {
          background: rgba(250, 204, 21, 0.1);
          border: 1px solid #facc15;
          border-radius: 20px;
          padding: 24px;
          text-align: center;
        }
        .budget-label { display: block; font-size: 1.1rem; color: #cbd5e1; margin-bottom: 8px; }
        .budget-amount {
          font-size: 2.2rem;
          font-weight: 700;
          color: #facc15;
        }
        .budget-note { font-size: 0.9rem; color: #94a3b8; margin-top: 8px; display: block; }

        .wishlist-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 5%;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 28px;
        }

        .wishlist-card {
          background: rgba(255,255,255,0.06);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .wishlist-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .card-image {
          position: relative;
          height: 240px;
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .rating {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0,0,0,0.75);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.95rem;
        }

        .card-content {
          padding: 24px;
        }
        .card-content h3 {
          font-size: 1.6rem;
          margin-bottom: 6px;
        }
        .location {
          color: #94a3b8;
          margin-bottom: 12px;
        }
        .price {
          color: #facc15;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 16px;
        }
        .description {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .card-actions {
          display: flex;
          gap: 12px;
        }
        .btn-view, .btn-book, .btn-remove {
          flex: 1;
          padding: 14px;
          border-radius: 9999px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          text-decoration: none;
        }
        .btn-view {
          background: transparent;
          border: 2px solid #facc15;
          color: #facc15;
        }
        .btn-book {
          background: #10b981;
          color: white;
        }
        .btn-remove {
          background: #ef4444;
          color: white;
          border: none;
        }

        .empty-state {
          text-align: center;
          padding: 120px 20px;
        }
        .empty-icon {
          font-size: 90px;
          margin-bottom: 24px;
        }
        .empty-state h2 {
          font-size: 2.2rem;
          margin-bottom: 12px;
        }
        .explore-btn {
          display: inline-block;
          margin-top: 30px;
          padding: 16px 40px;
          background: #facc15;
          color: #1e2937;
          font-weight: 700;
          border-radius: 9999px;
          text-decoration: none;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .wishlist-grid {
            grid-template-columns: 1fr;
            padding: 0 20px;
          }
          .wishlist-hero h1 {
            font-size: 2.8rem;
          }
        }
      `}</style>
    </div>
  );
}