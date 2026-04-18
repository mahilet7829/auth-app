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
      // Try to fetch from backend API first
      const response = await axios.get('http://localhost:5000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data.length > 0) {
        setWishlist(response.data.data);
      } else {
        // Fallback to localStorage
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
      // Try to remove from backend API
      await axios.delete(`http://localhost:5000/api/favorites/${destinationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Removed from wishlist');
      loadWishlist();
    } catch (error) {
      // Fallback to localStorage
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
      <div className="wishlist-page-modern">
        <AnimatedGraphics />
        <div className="flex justify-center items-center h-screen">
          <div className="text-white text-xl">Loading your wishlist...</div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page-modern">
        <AnimatedGraphics />
        
        <nav className="glass-navbar">
          <div className="nav-brand">
            <span className="brand-icon">❤️</span>
            <span className="brand-name">Ethiopia Travel Guide</span>
          </div>
          <div className="nav-links">
            <Link to="/welcome" className="nav-link">Dashboard</Link>
            <Link to="/tourist" className="nav-link">Destinations</Link>
            <Link to="/translator" className="nav-link">🗣️ Translator</Link>
            <Link to="/currency" className="nav-link">💰 Currency</Link>
            <button onClick={logout} className="logout-nav-btn">Logout</button>
          </div>
        </nav>

        <div className="empty-wishlist-modern">
          <div className="empty-wishlist-icon">❤️</div>
          <h2>Your Wishlist is Empty</h2>
          <p>Start adding destinations you want to visit!</p>
          <Link to="/tourist" className="explore-btn-modern">Explore Destinations</Link>
        </div>

        <style jsx>{`
          .wishlist-page-modern {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
            position: relative;
          }
          .glass-navbar {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
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
            font-weight: bold;
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
            gap: 20px;
            align-items: center;
            flex-wrap: wrap;
          }
          .nav-link {
            text-decoration: none;
            color: rgba(255, 255, 255, 0.8);
            font-weight: 500;
            transition: color 0.3s;
            padding: 8px 16px;
            border-radius: 8px;
          }
          .nav-link:hover {
            color: white;
            background: rgba(255, 255, 255, 0.1);
          }
          .logout-nav-btn {
            padding: 8px 20px;
            background: rgba(244, 67, 54, 0.8);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
          }
          .logout-nav-btn:hover {
            background: #f44336;
            transform: translateY(-2px);
          }
          .empty-wishlist-modern {
            text-align: center;
            padding: 100px 20px;
            position: relative;
            z-index: 10;
          }
          .empty-wishlist-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          .empty-wishlist-modern h2 {
            font-size: 32px;
            color: white;
            margin-bottom: 10px;
          }
          .empty-wishlist-modern p {
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 30px;
          }
          .explore-btn-modern {
            display: inline-block;
            padding: 14px 35px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50px;
            color: white;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
          }
          .explore-btn-modern:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          }
          @media (max-width: 768px) {
            .glass-navbar {
              flex-direction: column;
              padding: 15px 20px;
            }
            .nav-links {
              justify-content: center;
            }
            .empty-wishlist-modern h2 {
              font-size: 24px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="wishlist-page-modern">
      <AnimatedGraphics />
      
      <nav className="glass-navbar">
        <div className="nav-brand">
          <span className="brand-icon">❤️</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/welcome" className="nav-link">Dashboard</Link>
          <Link to="/tourist" className="nav-link">Destinations</Link>
          <Link to="/translator" className="nav-link">🗣️ Translator</Link>
          <Link to="/currency" className="nav-link">💰 Currency</Link>
          <button onClick={logout} className="logout-nav-btn">Logout</button>
        </div>
      </nav>

      <div className="wishlist-hero-modern">
        <h1 className="wishlist-hero-title">My Wishlist</h1>
        <p className="wishlist-hero-subtitle">Your saved destinations ({wishlist.length} places)</p>
      </div>

      <div className="wishlist-content-modern">
        {/* Budget Summary */}
        <div className="wishlist-budget-card">
          <div className="budget-icon">💰</div>
          <div className="budget-info">
            <h3>Estimated Total Budget</h3>
            <div className="budget-amount-modern">{total.min} - {total.max} ETB</div>
            <p>*Estimated total for visiting all destinations in your wishlist</p>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="wishlist-items-grid">
          {wishlist.map(destination => {
            const destId = destination._id || destination.id;
            const images = destination.images || (destination.imageUrl ? [destination.imageUrl] : []);
            const displayImage = images.length > 0 && images[0].startsWith('http') 
              ? images[0] 
              : "https://images.unsplash.com/photo-1544829648-ff0419b3ce0d?w=400&h=300&fit=crop";
            
            return (
              <div key={destId} className="wishlist-item-modern">
                <div className="wishlist-item-image">
                  <img src={displayImage} alt={destination.name} />
                  <div className="wishlist-item-rating">⭐ {destination.rating || 4.5}</div>
                </div>
                
                <div className="wishlist-item-content">
                  <div className="wishlist-item-header">
                    <h3 className="wishlist-item-name">{destination.name}</h3>
                    <span className="wishlist-item-region">{destination.location || destination.region}</span>
                  </div>
                  
                  <p className="wishlist-item-description">
                    {(destination.description || '').substring(0, 120)}...
                  </p>
                  
                  <div className="wishlist-item-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{destination.bestTime || "All year round"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">⏱️</span>
                      <span>{destination.duration || "2-3 days"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">💰</span>
                      <span className={getPriceColor(destination.priceLevel)}>
                        {destination.price || "Contact for price"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="wishlist-item-activities">
                    <div className="activity-tags-modern">
                      {(destination.activities || ["Sightseeing", "Culture"]).slice(0, 4).map((activity, idx) => (
                        <span key={idx} className="activity-tag-modern">{activity}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="wishlist-item-buttons">
                    <Link to={`/destination/${destId}`} className="view-details-btn-modern">
                      View Details →
                    </Link>
                    <Link to={`/bookings/${destId}`} className="book-now-wishlist-btn">
                      ✈️ Book Now
                    </Link>
                    <button onClick={() => removeFromWishlist(destId)} className="remove-btn-modern">
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
        .wishlist-page-modern {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          position: relative;
        }
        
        .glass-navbar {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
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
          font-weight: bold;
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
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .nav-link {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          transition: color 0.3s;
          padding: 8px 16px;
          border-radius: 8px;
        }
        
        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .logout-nav-btn {
          padding: 8px 20px;
          background: rgba(244, 67, 54, 0.8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .logout-nav-btn:hover {
          background: #f44336;
          transform: translateY(-2px);
        }
        
        .wishlist-hero-modern {
          text-align: center;
          padding: 60px 20px 30px;
          position: relative;
          z-index: 10;
        }
        
        .wishlist-hero-title {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #a8b2ff, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 15px;
        }
        
        .wishlist-hero-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .wishlist-content-modern {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 60px;
        }
        
        .wishlist-budget-card {
          background: linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2));
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 25px 30px;
          margin: 20px auto 40px;
          max-width: 550px;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 1px solid rgba(255, 255, 255, 0.15);
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
        
        .budget-amount-modern {
          font-size: 32px;
          font-weight: 800;
          color: #4caf50;
          margin-bottom: 5px;
        }
        
        .budget-info p {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .wishlist-items-grid {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        
        .wishlist-item-modern {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
        }
        
        .wishlist-item-modern:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }
        
        .wishlist-item-image {
          position: relative;
          width: 280px;
          flex-shrink: 0;
          overflow: hidden;
        }
        
        .wishlist-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .wishlist-item-modern:hover .wishlist-item-image img {
          transform: scale(1.05);
        }
        
        .wishlist-item-rating {
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
        
        .wishlist-item-content {
          flex: 1;
          padding: 25px;
        }
        
        .wishlist-item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        
        .wishlist-item-name {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin: 0;
        }
        
        .wishlist-item-region {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
        }
        
        .wishlist-item-description {
          color: rgba(255, 255, 255, 0.75);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 15px;
        }
        
        .wishlist-item-details {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .detail-icon {
          font-size: 14px;
        }
        
        .price-budget { color: #4caf50; }
        .price-mid { color: #ff9800; }
        .price-premium { color: #ff6b6b; }
        
        .wishlist-item-activities {
          margin-bottom: 20px;
        }
        
        .activity-tags-modern {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .activity-tag-modern {
          background: rgba(102, 126, 234, 0.3);
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          color: white;
          transition: all 0.2s;
        }
        
        .activity-tag-modern:hover {
          background: rgba(102, 126, 234, 0.5);
        }
        
        .wishlist-item-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .view-details-btn-modern {
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
        
        .view-details-btn-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          gap: 10px;
        }
        
        .book-now-wishlist-btn {
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
        
        .book-now-wishlist-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
          gap: 10px;
        }
        
        .remove-btn-modern {
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
        
        .remove-btn-modern:hover {
          background: #f44336;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .glass-navbar {
            flex-direction: column;
            padding: 15px 20px;
          }
          
          .nav-links {
            justify-content: center;
          }
          
          .wishlist-item-modern {
            flex-direction: column;
          }
          
          .wishlist-item-image {
            width: 100%;
            height: 200px;
          }
          
          .wishlist-hero-title {
            font-size: 32px;
          }
          
          .wishlist-budget-card {
            flex-direction: column;
            text-align: center;
            margin: 20px;
          }
          
          .wishlist-item-header {
            flex-direction: column;
            gap: 8px;
          }
          
          .wishlist-item-buttons {
            flex-direction: column;
          }
          
          .budget-amount-modern {
            font-size: 24px;
          }
          
          .wishlist-item-details {
            gap: 10px;
          }
          
          .detail-item {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}