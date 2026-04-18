import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function TouristPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDestinations();
    loadWishlist();
  }, [user, navigate]);

  const loadDestinations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/destinations');
      if (response.data.success && response.data.data.length > 0) {
        setDestinations(response.data.data);
      } else {
        setDestinations(localDestinations);
      }
    } catch (error) {
      console.log('Using local destinations data');
      setDestinations(localDestinations);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data.data || []);
    } catch (error) {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(savedWishlist);
    }
  };

  const addToWishlist = async (destination) => {
    try {
      await axios.post(`http://localhost:5000/api/favorites/${destination._id || destination.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${destination.name} added to wishlist!`);
      loadWishlist();
    } catch (error) {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const exists = savedWishlist.some(item => (item._id || item.id) === (destination._id || destination.id));
      if (!exists) {
        savedWishlist.push(destination);
        localStorage.setItem('wishlist', JSON.stringify(savedWishlist));
        toast.success(`${destination.name} added to wishlist!`);
        setWishlist(savedWishlist);
      } else {
        toast.error(`${destination.name} is already in your wishlist!`);
      }
    }
  };

  const bookNow = (destinationId) => {
    navigate(`/bookings/${destinationId}`);
  };

  const nextImage = (destId, currentIndex, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [destId]: (currentIndex + 1) % totalImages
    }));
  };

  const prevImage = (destId, currentIndex, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [destId]: (currentIndex - 1 + totalImages) % totalImages
    }));
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🌍' },
    { id: 'historical', name: 'Historical', icon: '🏰' },
    { id: 'nature', name: 'Nature', icon: '🌲' },
    { id: 'adventure', name: 'Adventure', icon: '⛰️' },
    { id: 'cultural', name: 'Cultural', icon: '🎭' }
  ];

  const filteredDestinations = destinations.filter(dest => {
    const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory;
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dest.location || dest.region || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isInWishlist = (destId) => {
    return wishlist.some(item => (item._id || item.id) === destId);
  };

  const getPriceColor = (priceLevel) => {
    if (priceLevel === '$') return 'price-budget';
    if (priceLevel === '$$') return 'price-mid';
    return 'price-premium';
  };

  // Alternate layout pattern: every 3rd card is horizontal (full-width)
  const getCardLayout = (index) => {
    if (index % 5 === 2) return 'horizontal'; // Every 5th card starting at position 2
    return 'vertical';
  };

  if (loading) {
    return (
      <div className="tourist-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading amazing destinations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tourist-page">
      {/* Navbar */}
      <nav className="tourist-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🇪🇹</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/welcome" className="nav-link">Dashboard</Link>
          <Link to="/wishlist" className="nav-link">❤️ Wishlist</Link>
          <Link to="/translator" className="nav-link">🗣️ Translator</Link>
          <Link to="/currency" className="nav-link">💰 Currency</Link>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="tourist-hero">
        <h1 className="hero-title">Explore Ethiopia</h1>
        <p className="hero-subtitle">Discover ancient history, stunning landscapes, and vibrant cultures</p>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="category-chips">
          {categories.map(category => (
            <button
              key={category.id}
              className={`chip ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid - Mixed Layout */}
      <div className="destinations-container">
        <div className="destinations-grid">
          {filteredDestinations.map((destination, idx) => {
            const layout = getCardLayout(idx);
            const destId = destination._id || destination.id;
            const images = destination.images || (destination.imageUrl ? [destination.imageUrl] : [destination.image]);
            const validImages = images.filter(img => img && img.startsWith('http'));
            const defaultImage = "https://images.unsplash.com/photo-1544829648-ff0419b3ce0d?w=800&h=600&fit=crop";
            const displayImages = validImages.length > 0 ? validImages : [defaultImage];
            const currentIndex = currentImageIndex[destId] || 0;
            const currentImage = displayImages[currentIndex];
            const totalImages = displayImages.length;

            if (layout === 'horizontal') {
              // Horizontal (landscape) card - full width
              return (
                <div key={destId} className="destination-card-horizontal">
                  <div className="card-image-horizontal">
                    <img src={currentImage} alt={destination.name} />
                    {totalImages > 1 && (
                      <>
                        <button className="slider-btn prev" onClick={(e) => {
                          e.stopPropagation();
                          prevImage(destId, currentIndex, totalImages);
                        }}>❮</button>
                        <button className="slider-btn next" onClick={(e) => {
                          e.stopPropagation();
                          nextImage(destId, currentIndex, totalImages);
                        }}>❯</button>
                      </>
                    )}
                    <div className="image-counter">{currentIndex + 1}/{totalImages}</div>
                    <div className="card-rating">⭐ {destination.rating || 4.5}</div>
                  </div>
                  <div className="card-content-horizontal">
                    <h3 className="dest-name">{destination.name}</h3>
                    <p className="dest-location">📍 {destination.location || destination.region}</p>
                    <p className="dest-description">{destination.description?.substring(0, 120)}...</p>
                    <div className="dest-details">
                      <span>📅 {destination.bestTime || "All year"}</span>
                      <span>⏱️ {destination.duration || "2-3 days"}</span>
                      <span className={getPriceColor(destination.priceLevel)}>💰 {destination.price || "Contact"}</span>
                    </div>
                    <div className="activity-tags">
                      {(destination.activities || ["Sightseeing", "Culture"]).slice(0, 4).map((activity, idx) => (
                        <span key={idx} className="tag">{activity}</span>
                      ))}
                    </div>
                    <div className="card-buttons">
                      <button className={`wishlist-btn ${isInWishlist(destId) ? 'active' : ''}`} onClick={() => addToWishlist(destination)}>
                        {isInWishlist(destId) ? '❤️ Saved' : '🤍 Save'}
                      </button>
                      <button className="book-btn" onClick={() => bookNow(destId)}>✈️ Book Now</button>
                    </div>
                  </div>
                </div>
              );
            }

            // Vertical (portrait) card
            return (
              <div key={destId} className="destination-card-vertical">
                <div className="card-image-vertical">
                  <img src={currentImage} alt={destination.name} />
                  {totalImages > 1 && (
                    <>
                      <button className="slider-btn prev" onClick={(e) => {
                        e.stopPropagation();
                        prevImage(destId, currentIndex, totalImages);
                      }}>❮</button>
                      <button className="slider-btn next" onClick={(e) => {
                        e.stopPropagation();
                        nextImage(destId, currentIndex, totalImages);
                      }}>❯</button>
                    </>
                  )}
                  <div className="image-counter">{currentIndex + 1}/{totalImages}</div>
                  <div className="card-rating">⭐ {destination.rating || 4.5}</div>
                </div>
                <div className="card-content-vertical">
                  <h3 className="dest-name">{destination.name}</h3>
                  <p className="dest-location">📍 {destination.location || destination.region}</p>
                  <p className="dest-description">{destination.description?.substring(0, 80)}...</p>
                  <div className="dest-details">
                    <span>⏱️ {destination.duration || "2-3 days"}</span>
                    <span className={getPriceColor(destination.priceLevel)}>{destination.price || "Contact"}</span>
                  </div>
                  <div className="card-buttons">
                    <button className={`wishlist-btn ${isInWishlist(destId) ? 'active' : ''}`} onClick={() => addToWishlist(destination)}>
                      {isInWishlist(destId) ? '❤️' : '🤍'}
                    </button>
                    <button className="book-btn" onClick={() => bookNow(destId)}>✈️ Book</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No destinations found</h3>
            <p>Try a different search or category</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .tourist-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
        }

        /* Navbar */
        .tourist-navbar {
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
          gap: 20px;
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
          background: rgba(255, 255, 255, 0.1);
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
        .tourist-hero {
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
          margin-bottom: 30px;
        }

        .search-container {
          max-width: 500px;
          margin: 0 auto 30px;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 14px 50px 14px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: white;
          font-size: 16px;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .search-icon {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
        }

        .category-chips {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .chip {
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .chip:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .chip.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: transparent;
        }

        /* Destinations Grid */
        .destinations-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 20px 60px;
        }

        .destinations-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        /* Vertical Cards (Portrait) - 3 per row */
        .destinations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }

        /* Override for horizontal cards to span full width */
        .destination-card-horizontal {
          grid-column: 1 / -1;
        }

        .destination-card-vertical {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .destination-card-vertical:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .card-image-vertical {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .card-image-vertical img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }

        .destination-card-vertical:hover .card-image-vertical img {
          transform: scale(1.05);
        }

        /* Horizontal Cards */
        .destination-card-horizontal {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: row;
        }

        .destination-card-horizontal:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .card-image-horizontal {
          position: relative;
          width: 40%;
          height: 280px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .card-image-horizontal img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }

        .destination-card-horizontal:hover .card-image-horizontal img {
          transform: scale(1.05);
        }

        .card-content-horizontal {
          flex: 1;
          padding: 25px;
          display: flex;
          flex-direction: column;
        }

        /* Shared Styles */
        .slider-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s;
          z-index: 5;
        }

        .destination-card-vertical:hover .slider-btn,
        .destination-card-horizontal:hover .slider-btn {
          opacity: 1;
        }

        .slider-btn.prev { left: 10px; }
        .slider-btn.next { right: 10px; }
        .slider-btn:hover { background: #667eea; }

        .image-counter {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.6);
          padding: 3px 8px;
          border-radius: 20px;
          font-size: 11px;
          color: white;
          z-index: 5;
        }

        .card-rating {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.7);
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: #ffd700;
          z-index: 5;
        }

        .dest-name {
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin-bottom: 6px;
        }

        .dest-location {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          margin-bottom: 12px;
        }

        .dest-description {
          color: rgba(255, 255, 255, 0.75);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 15px;
        }

        .dest-details {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .price-budget { color: #4caf50; }
        .price-mid { color: #ff9800; }
        .price-premium { color: #ff6b6b; }

        .activity-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .tag {
          background: rgba(102, 126, 234, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          color: white;
        }

        .card-buttons {
          display: flex;
          gap: 12px;
          margin-top: auto;
        }

        .wishlist-btn {
          flex: 1;
          padding: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .wishlist-btn.active {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .wishlist-btn:hover, .book-btn:hover {
          transform: translateY(-2px);
        }

        .book-btn {
          flex: 1;
          padding: 10px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .card-content-vertical {
          padding: 18px;
        }

        .card-content-vertical .dest-details {
          justify-content: space-between;
        }

        .card-content-vertical .card-buttons {
          flex-direction: column;
          gap: 8px;
        }

        /* No Results */
        .no-results {
          text-align: center;
          padding: 80px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 24px;
        }

        .no-results-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .no-results h3 {
          color: white;
          font-size: 24px;
          margin-bottom: 10px;
        }

        .no-results p {
          color: rgba(255, 255, 255, 0.6);
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
        @media (max-width: 768px) {
          .tourist-navbar {
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

          .hero-subtitle {
            font-size: 14px;
          }

          .destination-card-horizontal {
            flex-direction: column;
          }

          .card-image-horizontal {
            width: 100%;
            height: 220px;
          }

          .chip span:last-child {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// Your localDestinations array remains exactly the same (I'm not including it here to save space, but keep yours!)
const localDestinations = [ import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function TouristPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDestinations();
    loadWishlist();
  }, [user, navigate]);

  const loadDestinations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/destinations');
      if (response.data.success && response.data.data.length > 0) {
        setDestinations(response.data.data);
      } else {
        setDestinations(localDestinations);
      }
    } catch (error) {
      console.log('Using local destinations data');
      setDestinations(localDestinations);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data.data || []);
    } catch (error) {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(savedWishlist);
    }
  };

  const addToWishlist = async (destination) => {
    try {
      await axios.post(`http://localhost:5000/api/favorites/${destination._id || destination.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${destination.name} added to wishlist!`);
      loadWishlist();
    } catch (error) {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const exists = savedWishlist.some(item => (item._id || item.id) === (destination._id || destination.id));
      if (!exists) {
        savedWishlist.push(destination);
        localStorage.setItem('wishlist', JSON.stringify(savedWishlist));
        toast.success(`${destination.name} added to wishlist!`);
        setWishlist(savedWishlist);
      } else {
        toast.error(`${destination.name} is already in your wishlist!`);
      }
    }
  };

  const bookNow = (destinationId) => {
    navigate(`/bookings/${destinationId}`);
  };

  const nextImage = (destId, currentIndex, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [destId]: (currentIndex + 1) % totalImages
    }));
  };

  const prevImage = (destId, currentIndex, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [destId]: (currentIndex - 1 + totalImages) % totalImages
    }));
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🌍' },
    { id: 'historical', name: 'Historical', icon: '🏰' },
    { id: 'nature', name: 'Nature', icon: '🌲' },
    { id: 'adventure', name: 'Adventure', icon: '⛰️' },
    { id: 'cultural', name: 'Cultural', icon: '🎭' }
  ];

  const filteredDestinations = destinations.filter(dest => {
    const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory;
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dest.location || dest.region || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isInWishlist = (destId) => {
    return wishlist.some(item => (item._id || item.id) === destId);
  };

  const getPriceColor = (priceLevel) => {
    if (priceLevel === '$') return 'price-budget';
    if (priceLevel === '$$') return 'price-mid';
    return 'price-premium';
  };

  // Alternate layout pattern: every 3rd card is horizontal (full-width)
  const getCardLayout = (index) => {
    if (index % 5 === 2) return 'horizontal'; // Every 5th card starting at position 2
    return 'vertical';
  };

  if (loading) {
    return (
      <div className="tourist-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading amazing destinations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tourist-page">
      {/* Navbar */}
      <nav className="tourist-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🇪🇹</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/welcome" className="nav-link">Dashboard</Link>
          <Link to="/wishlist" className="nav-link">❤️ Wishlist</Link>
          <Link to="/translator" className="nav-link">🗣️ Translator</Link>
          <Link to="/currency" className="nav-link">💰 Currency</Link>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="tourist-hero">
        <h1 className="hero-title">Explore Ethiopia</h1>
        <p className="hero-subtitle">Discover ancient history, stunning landscapes, and vibrant cultures</p>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="category-chips">
          {categories.map(category => (
            <button
              key={category.id}
              className={`chip ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid - Mixed Layout */}
      <div className="destinations-container">
        <div className="destinations-grid">
          {filteredDestinations.map((destination, idx) => {
            const layout = getCardLayout(idx);
            const destId = destination._id || destination.id;
            const images = destination.images || (destination.imageUrl ? [destination.imageUrl] : [destination.image]);
            const validImages = images.filter(img => img && img.startsWith('http'));
            const defaultImage = "https://images.unsplash.com/photo-1544829648-ff0419b3ce0d?w=800&h=600&fit=crop";
            const displayImages = validImages.length > 0 ? validImages : [defaultImage];
            const currentIndex = currentImageIndex[destId] || 0;
            const currentImage = displayImages[currentIndex];
            const totalImages = displayImages.length;

            if (layout === 'horizontal') {
              // Horizontal (landscape) card - full width
              return (
                <div key={destId} className="destination-card-horizontal">
                  <div className="card-image-horizontal">
                    <img src={currentImage} alt={destination.name} />
                    {totalImages > 1 && (
                      <>
                        <button className="slider-btn prev" onClick={(e) => {
                          e.stopPropagation();
                          prevImage(destId, currentIndex, totalImages);
                        }}>❮</button>
                        <button className="slider-btn next" onClick={(e) => {
                          e.stopPropagation();
                          nextImage(destId, currentIndex, totalImages);
                        }}>❯</button>
                      </>
                    )}
                    <div className="image-counter">{currentIndex + 1}/{totalImages}</div>
                    <div className="card-rating">⭐ {destination.rating || 4.5}</div>
                  </div>
                  <div className="card-content-horizontal">
                    <h3 className="dest-name">{destination.name}</h3>
                    <p className="dest-location">📍 {destination.location || destination.region}</p>
                    <p className="dest-description">{destination.description?.substring(0, 120)}...</p>
                    <div className="dest-details">
                      <span>📅 {destination.bestTime || "All year"}</span>
                      <span>⏱️ {destination.duration || "2-3 days"}</span>
                      <span className={getPriceColor(destination.priceLevel)}>💰 {destination.price || "Contact"}</span>
                    </div>
                    <div className="activity-tags">
                      {(destination.activities || ["Sightseeing", "Culture"]).slice(0, 4).map((activity, idx) => (
                        <span key={idx} className="tag">{activity}</span>
                      ))}
                    </div>
                    <div className="card-buttons">
                      <button className={`wishlist-btn ${isInWishlist(destId) ? 'active' : ''}`} onClick={() => addToWishlist(destination)}>
                        {isInWishlist(destId) ? '❤️ Saved' : '🤍 Save'}
                      </button>
                      <button className="book-btn" onClick={() => bookNow(destId)}>✈️ Book Now</button>
                    </div>
                  </div>
                </div>
              );
            }

            // Vertical (portrait) card
            return (
              <div key={destId} className="destination-card-vertical">
                <div className="card-image-vertical">
                  <img src={currentImage} alt={destination.name} />
                  {totalImages > 1 && (
                    <>
                      <button className="slider-btn prev" onClick={(e) => {
                        e.stopPropagation();
                        prevImage(destId, currentIndex, totalImages);
                      }}>❮</button>
                      <button className="slider-btn next" onClick={(e) => {
                        e.stopPropagation();
                        nextImage(destId, currentIndex, totalImages);
                      }}>❯</button>
                    </>
                  )}
                  <div className="image-counter">{currentIndex + 1}/{totalImages}</div>
                  <div className="card-rating">⭐ {destination.rating || 4.5}</div>
                </div>
                <div className="card-content-vertical">
                  <h3 className="dest-name">{destination.name}</h3>
                  <p className="dest-location">📍 {destination.location || destination.region}</p>
                  <p className="dest-description">{destination.description?.substring(0, 80)}...</p>
                  <div className="dest-details">
                    <span>⏱️ {destination.duration || "2-3 days"}</span>
                    <span className={getPriceColor(destination.priceLevel)}>{destination.price || "Contact"}</span>
                  </div>
                  <div className="card-buttons">
                    <button className={`wishlist-btn ${isInWishlist(destId) ? 'active' : ''}`} onClick={() => addToWishlist(destination)}>
                      {isInWishlist(destId) ? '❤️' : '🤍'}
                    </button>
                    <button className="book-btn" onClick={() => bookNow(destId)}>✈️ Book</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No destinations found</h3>
            <p>Try a different search or category</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .tourist-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
        }

        /* Navbar */
        .tourist-navbar {
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
          gap: 20px;
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
          background: rgba(255, 255, 255, 0.1);
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
        .tourist-hero {
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
          margin-bottom: 30px;
        }

        .search-container {
          max-width: 500px;
          margin: 0 auto 30px;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 14px 50px 14px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: white;
          font-size: 16px;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .search-icon {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
        }

        .category-chips {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .chip {
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .chip:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .chip.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: transparent;
        }

        /* Destinations Grid */
        .destinations-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 20px 60px;
        }

        .destinations-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        /* Vertical Cards (Portrait) - 3 per row */
        .destinations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }

        /* Override for horizontal cards to span full width */
        .destination-card-horizontal {
          grid-column: 1 / -1;
        }

        .destination-card-vertical {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .destination-card-vertical:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .card-image-vertical {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .card-image-vertical img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }

        .destination-card-vertical:hover .card-image-vertical img {
          transform: scale(1.05);
        }

        /* Horizontal Cards */
        .destination-card-horizontal {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: row;
        }

        .destination-card-horizontal:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .card-image-horizontal {
          position: relative;
          width: 40%;
          height: 280px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .card-image-horizontal img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }

        .destination-card-horizontal:hover .card-image-horizontal img {
          transform: scale(1.05);
        }

        .card-content-horizontal {
          flex: 1;
          padding: 25px;
          display: flex;
          flex-direction: column;
        }

        /* Shared Styles */
        .slider-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s;
          z-index: 5;
        }

        .destination-card-vertical:hover .slider-btn,
        .destination-card-horizontal:hover .slider-btn {
          opacity: 1;
        }

        .slider-btn.prev { left: 10px; }
        .slider-btn.next { right: 10px; }
        .slider-btn:hover { background: #667eea; }

        .image-counter {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.6);
          padding: 3px 8px;
          border-radius: 20px;
          font-size: 11px;
          color: white;
          z-index: 5;
        }

        .card-rating {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.7);
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: #ffd700;
          z-index: 5;
        }

        .dest-name {
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin-bottom: 6px;
        }

        .dest-location {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          margin-bottom: 12px;
        }

        .dest-description {
          color: rgba(255, 255, 255, 0.75);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 15px;
        }

        .dest-details {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .price-budget { color: #4caf50; }
        .price-mid { color: #ff9800; }
        .price-premium { color: #ff6b6b; }

        .activity-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .tag {
          background: rgba(102, 126, 234, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          color: white;
        }

        .card-buttons {
          display: flex;
          gap: 12px;
          margin-top: auto;
        }

        .wishlist-btn {
          flex: 1;
          padding: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .wishlist-btn.active {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .wishlist-btn:hover, .book-btn:hover {
          transform: translateY(-2px);
        }

        .book-btn {
          flex: 1;
          padding: 10px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .card-content-vertical {
          padding: 18px;
        }

        .card-content-vertical .dest-details {
          justify-content: space-between;
        }

        .card-content-vertical .card-buttons {
          flex-direction: column;
          gap: 8px;
        }

        /* No Results */
        .no-results {
          text-align: center;
          padding: 80px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 24px;
        }

        .no-results-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .no-results h3 {
          color: white;
          font-size: 24px;
          margin-bottom: 10px;
        }

        .no-results p {
          color: rgba(255, 255, 255, 0.6);
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
        @media (max-width: 768px) {
          .tourist-navbar {
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

          .hero-subtitle {
            font-size: 14px;
          }

          .destination-card-horizontal {
            flex-direction: column;
          }

          .card-image-horizontal {
            width: 100%;
            height: 220px;
          }

          .chip span:last-child {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

const localDestinations = [  id: 1,
    name: "Lalibela",
    region: "Amhara",
    location: "Amhara",
    category: "historical",
    images: [
      "https://i.pinimg.com/736x/e6/c6/6d/e6c66dd3d26469e205da54776ef0259c.jpg",
      "https://i.pinimg.com/736x/78/6e/9d/786e9d7d60aae752b95af9ba4a80f955.jpg",
      "https://i.pinimg.com/736x/27/a1/f4/27a1f496d9001b47cfeb1e2178103ace.jpg",
      "https://i.pinimg.com/736x/5b/6c/d5/5b6cd5422d2a93eef2c7ae73aaadfc50.jpg"
    ],
    description: "Famous for its 11 rock-hewn churches, often called the 'Eighth Wonder of the World'. These medieval monolithic churches were carved from solid volcanic rock in the 12th-13th centuries.",
    bestTime: "October to March",
    duration: "2-3 days",
    price: "5,000 - 8,000 ETB",
    priceLevel: "$$$",
    rating: 4.9,
    activities: ["Church Tour", "Hiking", "Coffee Ceremony", "Saturday Market"]
  },
  {
    id: 2,
    name: "Simien Mountains",
    region: "Amhara",
    location: "Amhara",
    category: "nature",
    images: [
      "https://i.pinimg.com/736x/65/97/de/6597debe2e191b470276cbe0171a9410.jpg",
      "https://i.pinimg.com/736x/6a/c5/f1/6ac5f1d7ecf370937e54471d782e004a.jpg",
      "https://i.pinimg.com/736x/c3/91/90/c39190e216c8639c0f427f3d50702a64.jpg",
      "https://i.pinimg.com/736x/bc/95/52/bc9552f481cd1f17ccf1b370cc26362c.jpg"
    ],
    description: "UNESCO World Heritage site with stunning landscapes, dramatic escarpments, deep valleys, and peaks reaching over 4,000 meters. Home to unique wildlife including Gelada baboons.",
    bestTime: "September to November",
    duration: "4-5 days",
    price: "3,500 - 6,000 ETB",
    priceLevel: "$$",
    rating: 4.8,
    activities: ["Trekking", "Wildlife Viewing", "Camping", "Photography"]
  },
  {
    id: 3,
    name: "Danakil Depression",
    region: "Afar",
    location: "Afar",
    category: "adventure",
    images: [
      "https://i.pinimg.com/736x/03/e3/ac/03e3acfe27a68e8f12f356bbeb9a9d8c.jpg",
      "https://i.pinimg.com/736x/0a/54/b3/0a54b3f0a73580f8b6f89bb631078df6.jpg",
      "https://i.pinimg.com/736x/0a/81/cb/0a81cb3d310ecd663445645aabe17e5f.jpg",
      "https://i.pinimg.com/736x/02/d9/80/02d980d6d02a3d859157081760557b1e.jpg"
    ],
    description: "One of the hottest places on Earth with colorful sulfur springs, vast salt flats, and the active Erta Ale volcano with its permanent lava lake.",
    bestTime: "November to February",
    duration: "3-4 days",
    price: "8,000 - 12,000 ETB",
    priceLevel: "$$$",
    rating: 4.7,
    activities: ["Volcano Hiking", "Salt Flats Tour", "Photography", "Camping"]
  },
  {
    id: 4,
    name: "Axum",
    region: "Tigray",
    location: "Tigray",
    category: "historical",
    images: [
      "https://i.pinimg.com/736x/d9/d7/32/d9d7320f916ea17d513369e885a91a1e.jpg",
      "https://i.pinimg.com/736x/f0/e4/ff/f0e4ffc4fff1931d077159b25f6c8559.jpg",
      "https://i.pinimg.com/736x/3b/46/0a/3b460a263b366ead68b42d67a6f592f7.jpg",
      "https://i.pinimg.com/736x/40/14/08/401408575f587831b32d044482f72c0d.jpg"
    ],
    description: "Ancient city known for its towering obelisks, royal tombs, and the legendary Ark of the Covenant. A UNESCO World Heritage site.",
    bestTime: "October to April",
    duration: "2 days",
    price: "2,500 - 4,500 ETB",
    priceLevel: "$$",
    rating: 4.6,
    activities: ["Historical Tour", "Museum Visit", "Stelae Field", "Archaeological Sites"]
  },
  {
    id: 5,
    name: "Lake Tana",
    region: "Amhara",
    location: "Amhara",
    category: "nature",
    images: [
      "https://i.pinimg.com/736x/94/8b/a9/948ba9cd2d293e7f84f2b8651a7008af.jpg",
      "https://i.pinimg.com/736x/66/fb/07/66fb07f7b360b6bc3606c8151b15a338.jpg",
      "https://i.pinimg.com/736x/de/09/71/de0971289ba12c3b1b2c91d452d06d40.jpg",
      "https://i.pinimg.com/736x/fb/2f/5f/fb2f5feea9e3c723b13553fa184970c3.jpg"
    ],
    description: "Ethiopia's largest lake with ancient island monasteries dating back to the 14th century. Source of the Blue Nile.",
    bestTime: "October to June",
    duration: "2 days",
    price: "2,000 - 3,500 ETB",
    priceLevel: "$$",
    rating: 4.5,
    activities: ["Boat Tour", "Monastery Visit", "Bird Watching", "Fishing"]
  },
  {
    id: 6,
    name: "Gondar",
    region: "Amhara",
    location: "Amhara",
    category: "historical",
    images: [
      "https://i.pinimg.com/736x/b7/91/25/b79125130fdbaa410b279bd3a2b6966c.jpg",
      "https://i.pinimg.com/736x/01/74/f8/0174f8cf48afeb54706e9b593b8a8b18.jpg",
      "https://i.pinimg.com/736x/26/01/b5/2601b5259d58eecbe007276ffff35dbf.jpg",
      "https://i.pinimg.com/736x/14/21/2a/14212a68b3981f2fb051021b945aee6f.jpg"
    ],
    description: "Known as the 'Camelot of Africa' with its magnificent royal castles and churches. Features the famous Fasil Ghebbi fortress-city.",
    bestTime: "October to March",
    duration: "2 days",
    price: "2,000 - 4,000 ETB",
    priceLevel: "$$",
    rating: 4.7,
    activities: ["Castle Tour", "Historical Sites", "Pool of David", "Church of Debre Berhan Selassie"]
  },
  {
    id: 7,
    name: "Bale Mountains",
    region: "Oromia",
    location: "Oromia",
    category: "nature",
    images: [
      "https://i.pinimg.com/736x/ff/6f/18/ff6f18ec5e574131cb41eb26be9361d8.jpg",
      "https://i.pinimg.com/736x/ad/47/e4/ad47e459aa8a5a64ac0bc2172f152ba2.jpg",
      "https://i.pinimg.com/736x/d4/54/43/d4544300387dc77dd45bc970007623ef.jpg",
      "https://i.pinimg.com/736x/93/b9/5e/93b95ebf2f92479ee0da385c9c75570a.jpg"
    ],
    description: "Home to rare Ethiopian wolves and stunning alpine scenery with Africa's largest alpine plateau. Perfect for trekking.",
    bestTime: "November to February",
    duration: "3-4 days",
    price: "3,000 - 5,500 ETB",
    priceLevel: "$$",
    rating: 4.8,
    activities: ["Trekking", "Wildlife Safari", "Bird Watching", "Camping"]
  },
  {
    id: 8,
    name: "Harar",
    region: "Harari",
    location: "Harari",
    category: "cultural",
    images: [
      "https://i.pinimg.com/736x/18/d7/3c/18d73cdfdcb7f331f331932ddae12e29.jpg",
      "https://i.pinimg.com/736x/ed/fd/9c/edfd9c9210856a3445f955172a52e3b4.jpg",
      "https://i.pinimg.com/736x/ed/fd/9c/edfd9c9210856a3445f955172a52e3b4.jpg",
      "https://i.pinimg.com/736x/73/d3/92/73d392ddedcfdd5ec15ca1e730c4d02a.jpg"
    ],
    description: "Ancient walled city known for its unique culture, colorful markets, and nightly hyena feeding tradition. A UNESCO World Heritage site.",
    bestTime: "October to April",
    duration: "2 days",
    price: "1,500 - 3,000 ETB",
    priceLevel: "$",
    rating: 4.6,
    activities: ["City Tour", "Hyena Feeding", "Market Visit", "Museum Tour"]
  },
  {
    id: 9,
    name: "Omo Valley",
    region: "South Omo",
    location: "South Omo",
    category: "cultural",
    images: [
      "https://i.pinimg.com/736x/15/20/5b/15205bbc67eee5a4eb3631dcdbec33fb.jpg",
      "https://i.pinimg.com/736x/80/f1/49/80f14988f465c1429c54b19655157877.jpg",
      "https://i.pinimg.com/736x/02/ca/31/02ca31e7bfabc822630118d9d7db4e78.jpg",
      "https://i.pinimg.com/736x/24/c3/b0/24c3b07d39efc073b56ca0f10a675f6e.jpg"
    ],
    description: "Home to diverse indigenous tribes with unique traditions, body art, and ancient customs. A cultural treasure trove.",
    bestTime: "June to September",
    duration: "5-7 days",
    price: "6,000 - 10,000 ETB",
    priceLevel: "$$$",
    rating: 4.9,
    activities: ["Cultural Tours", "Village Visits", "Tribal Ceremonies", "Photography"]
  },
  {
    id: 10,
    name: "Entoto Park",
    region: "Addis Ababa",
    location: "Addis Ababa",
    category: "nature",
    images: [
      "https://i.pinimg.com/736x/bf/16/21/bf162179d786e71a2da0d7a9b3447a09.jpg",
      "https://i.pinimg.com/736x/b8/1c/81/b81c81a1281eee691b44a82be8ccc8cc.jpg",
      "https://i.pinimg.com/736x/4c/51/36/4c513624d0804af3256a2c6d5e789769.jpg"
    ],
    description: "Beautiful park on the Entoto Mountains offering panoramic views of Addis Ababa. Features hiking trails, eucalyptus forests, and the historic Entoto Maryam Church.",
    bestTime: "September to May",
    duration: "1 day",
    price: "200 - 500 ETB",
    priceLevel: "$",
    rating: 4.5,
    activities: ["Hiking", "Picnic", "Museum Visit", "Panoramic Views", "Mountain Biking"]
  },
  {
    id: 11,
    name: "Unity Park",
    region: "Addis Ababa",
    location: "Addis Ababa",
    category: "historical",
    images: [
      "https://i.pinimg.com/736x/46/5b/ab/465bab10ab8c1fed32420a6124fa071e.jpg",
      "https://i.pinimg.com/736x/bc/4f/a2/bc4fa2bebe58779274db951da1404c64.jpg"
    ],
    description: "A magnificent park in the heart of Addis Ababa featuring the newly renovated Imperial Palace grounds, zoo, botanical garden, and Ethiopian history museum.",
    bestTime: "October to May",
    duration: "1 day",
    price: "500 - 1,000 ETB",
    priceLevel: "$$",
    rating: 4.7,
    activities: ["Palace Tour", "Zoo Visit", "Botanical Garden", "History Museum", "Ethiopian Art Exhibition"]
  },
  {
    id: 12,
    name: "Ethiopian National Museum",
    region: "Addis Ababa",
    location: "Addis Ababa",
    category: "historical",
    images: [
      "https://i.pinimg.com/736x/71/65/db/7165db09c010c19df6a6a425259e2d73.jpg",
      "https://i.pinimg.com/736x/b0/79/d4/b079d48bf8eedbdeacc58ada18f50153.jpg"
    ],
    description: "Home to the famous fossil 'Lucy' (Australopithecus afarensis). Features extensive collections of Ethiopian art, archaeological finds, and historical artifacts.",
    bestTime: "All year round",
    duration: "3-4 hours",
    price: "100 - 200 ETB",
    priceLevel: "$",
    rating: 4.6,
    activities: ["Lucy Fossil Viewing", "Archaeological Exhibits", "Ethiopian Art", "Historical Artifacts"]
  }
]; // Keep your existing localDestinations array ]; // Keep your existing localDestinations array