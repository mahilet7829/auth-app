import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AnimatedGraphics from './AnimatedGraphics';

export default function Wishlist() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [user, navigate]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data.length > 0) {
        setWishlist(response.data.data);
      } else {
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlist(savedWishlist);
      }
    } catch (error) {
      console.log('Using localStorage wishlist');
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(savedWishlist);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (destinationId) => {
    try {
      await axios.delete(`http://localhost:5000/api/favorites/${destinationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Removed from wishlist');
      loadWishlist();
    } catch (error) {
      const newWishlist = wishlist.filter(item => (item._id || item.id) !== destinationId);
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      toast.success('Removed from wishlist');
    }
  };

  const calculateTotalBudget = () => {
    let min = 0;
    let max = 0;
    wishlist.forEach(item => {
      let priceStr = item.price || '';
      if (priceStr.includes(' - ')) {
        const parts = priceStr.split(' - ');
        min += parseInt(parts[0].replace(/[^0-9]/g, '')) || 0;
        max += parseInt(parts[1].replace(/[^0-9]/g, '')) || 0;
      } else {
        const num = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
        min += num;
        max += num;
      }
    });
    return { min: min.toLocaleString(), max: max.toLocaleString() };
  };

  const getPriceColor = (priceLevel) => {
    if (priceLevel === '$') return 'price-budget';
    if (priceLevel === '$$') return 'price-mid';
    return 'price-premium';
  };

  const total = calculateTotalBudget();

  if (loading) {
    return (
      <div className="wishlist-page">
        <AnimatedGraphics />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading your wishlist...</div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <AnimatedGraphics />
        
        <nav className="wishlist-navbar">
          <div className="nav-brand">
            <span className="brand-icon">❤️</span>
            <span className="brand-name">Ethiopia Travel Guide</span>
          </div>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/tourist" className="nav-link">Destinations</Link>
            <Link to="/translator" className="nav-link">🗣️ Translator</Link>
            <Link to="/currency" className="nav-link">💰 Currency</Link>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </nav>

        <div className="empty-wishlist">
          <div className="empty-icon">❤️</div>
          <h2>Your Wishlist is Empty</h2>
          <p>Start adding destinations you want to visit!</p>
          <Link to="/tourist" className="explore-btn">Explore Destinations</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <AnimatedGraphics />
      
      <nav className="wishlist-navbar">
        <div className="nav-brand">
          <span className="brand-icon">❤️</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/tourist" className="nav-link">Destinations</Link>
          <Link to="/translator" className="nav-link">🗣️ Translator</Link>
          <Link to="/currency" className="nav-link">💰 Currency</Link>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Hero Section - Scrollable like Tourist Page */}
      <div className="wishlist-hero">
        <h1 className="hero-title">My Wishlist</h1>
        <p className="hero-subtitle">Your saved destinations ({wishlist.length} places)</p>
      </div>

      {/* Main Content - Scrollable */}
      <div className="wishlist-content">
        {/* Budget Summary */}
        <div className="budget-card">
          <div className="budget-icon">💰</div>
          <div className="budget-info">
            <h3>Estimated Total Budget</h3>
            <div className="budget-amount">{total.min} - {total.max} ETB</div>
            <p>*Estimated total for visiting all destinations in your wishlist</p>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="wishlist-grid">
          {wishlist.map(destination => {
            const destId = destination._id || destination.id;
            const images = destination.images || (destination.imageUrl ? [destination.imageUrl] : []);
            const displayImage = images.length > 0 && images[0].startsWith('http') 
              ? images[0] 
              : "https://images.unsplash.com/photo-1544829648-ff0419b3ce0d?w=400&h=300&fit=crop";
            
            return (
              <div key={destId} className="wishlist-card">
                <div className="card-image">
                  <img src={displayImage} alt={destination.name} />
                  <div className="card-rating">⭐ {destination.rating || 4.5}</div>
                </div>
                
                <div className="card-content">
                  <div className="card-header">
                    <h3>{destination.name}</h3>
                    <span className="card-region">{destination.location || destination.region}</span>
                  </div>
                  
                  <p className="card-description">
                    {(destination.description || '').substring(0, 120)}...
                  </p>
                  
                  <div className="card-details">
                    <div className="detail">
                      <span>📅</span>
                      <span>{destination.bestTime || "All year round"}</span>
                    </div>
                    <div className="detail">
                      <span>⏱️</span>
                      <span>{destination.duration || "2-3 days"}</span>
                    </div>
                    <div className="detail">
                      <span>💰</span>
                      <span className={getPriceColor(destination.priceLevel)}>
                        {destination.price || "Contact for price"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-activities">
                    {(destination.activities || ["Sightseeing", "Culture"]).slice(0, 4).map((activity, idx) => (
                      <span key={idx} className="activity-tag">{activity}</span>
                    ))}
                  </div>
                  
                  <div className="card-buttons">
                    <Link to={`/destination/${destId}`} className="view-btn">
                      View Details →
                    </Link>
                    <Link to={`/bookings/${destId}`} className="book-btn">
                      ✈️ Book Now
                    </Link>
                    <button onClick={() => removeFromWishlist(destId)} className="remove-btn">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .wishlist-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        /* Navbar */
        .wishlist-navbar {
          background: rgba(255, 255, 255, 0.08);
          padding: 15px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 600;
          color: white;
        }

        .brand-icon { font-size: 28px; }
        .brand-name {
          background: linear-gradient(135deg, #fff, #a8b2ff, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }

        .nav-link {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.15);
        }

        .logout-btn {
          padding: 8px 20px;
          background: rgba(244, 67, 54, 0.8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: #f44336;
          transform: translateY(-2px);
        }

        /* Hero Section */
        .wishlist-hero {
          text-align: center;
          padding: 60px 20px 40px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #a8b2ff, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
        }

        .hero-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Main Content - Scrollable */
        .wishlist-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 20px 60px;
          position: relative;
          z-index: 10;
        }

        /* Budget Card */
        .budget-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
          border-radius: 24px;
          padding: 25px 30px;
          margin: 20px auto 40px;
          max-width: 550px;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .budget-icon {
          font-size: 48px;
        }

        .budget-info h3 {
          color: white;
          margin-bottom: 8px;
          font-size: 18px;
          font-weight: 600;
        }

        .budget-amount {
          font-size: 28px;
          font-weight: 800;
          color: #4caf50;
          margin-bottom: 5px;
        }

        .budget-info p {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Wishlist Grid */
        .wishlist-grid {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        /* Wishlist Card */
        .wishlist-card {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s;
        }

        .wishlist-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.1);
        }

        .card-image {
          position: relative;
          width: 280px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .wishlist-card:hover .card-image img {
          transform: scale(1.05);
        }

        .card-rating {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.75);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #ffd700;
        }

        .card-content {
          flex: 1;
          padding: 25px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .card-header h3 {
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .card-region {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .card-description {
          color: rgba(255, 255, 255, 0.75);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 15px;
        }

        .card-details {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .price-budget { color: #4caf50; }
        .price-mid { color: #ff9800; }
        .price-premium { color: #ff6b6b; }

        .card-activities {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .activity-tag {
          background: rgba(102, 126, 234, 0.3);
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          color: white;
          transition: all 0.2s;
        }

        .activity-tag:hover {
          background: rgba(102, 126, 234, 0.5);
        }

        .card-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .view-btn {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 12px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .view-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          gap: 10px;
        }

        .book-btn {
          padding: 10px 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 12px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .book-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
          gap: 10px;
        }

        .remove-btn {
          padding: 10px 24px;
          background: rgba(244, 67, 54, 0.8);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .remove-btn:hover {
          background: #f44336;
          transform: translateY(-2px);
        }

        /* Empty State */
        .empty-wishlist {
          text-align: center;
          padding: 100px 20px;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .empty-wishlist h2 {
          font-size: 32px;
          color: white;
          margin-bottom: 10px;
        }

        .empty-wishlist p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 30px;
        }

        .explore-btn {
          display: inline-block;
          padding: 14px 35px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .explore-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        /* Loading */
        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          color: white;
          font-size: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .wishlist-card {
            flex-direction: column;
          }
          
          .card-image {
            width: 100%;
            height: 220px;
          }
          
          .hero-title {
            font-size: 36px;
          }
        }

        @media (max-width: 768px) {
          .wishlist-navbar {
            flex-direction: column;
            padding: 15px 20px;
            gap: 15px;
          }
          
          .nav-links {
            justify-content: center;
          }
          
          .hero-title {
            font-size: 32px;
          }
          
          .budget-card {
            flex-direction: column;
            text-align: center;
            margin: 20px;
          }
          
          .card-header {
            flex-direction: column;
            gap: 8px;
          }
          
          .card-buttons {
            flex-direction: column;
          }
          
          .budget-amount {
            font-size: 24px;
          }
          
          .card-details {
            gap: 10px;
          }
          
          .detail {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}