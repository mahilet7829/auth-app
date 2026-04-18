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

      <div className="destinations-container">
        <div className="destinations-grid">
          {filteredDestinations.map(destination => {
            const destId = destination._id || destination.id;
            const images = destination.images || (destination.imageUrl ? [destination.imageUrl] : [destination.image]);
            const validImages = images.filter(img => img && img.startsWith('http'));
            const defaultImage = "https://images.unsplash.com/photo-1544829648-ff0419b3ce0d?w=400&h=300&fit=crop";
            const displayImages = validImages.length > 0 ? validImages : [defaultImage];
            const currentIndex = currentImageIndex[destId] || 0;
            const currentImage = displayImages[currentIndex];
            const totalImages = displayImages.length;

            return (
              <div key={destId} className="destination-card">
                <div className="card-image">
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
                <div className="card-content">
                  <h3 className="dest-name">{destination.name}</h3>
                  <p className="dest-location">📍 {destination.location || destination.region}</p>
                  <p className="dest-description">{destination.description?.substring(0, 80)}...</p>
                  <div className="dest-details">
                    <span>⏱️ {destination.duration || "2-3 days"}</span>
                    <span className={getPriceColor(destination.priceLevel)}>{destination.price || "Contact"}</span>
                  </div>
                  <div className="card-buttons">
                    <button className={`wishlist-btn ${isInWishlist(destId) ? 'active' : ''}`} onClick={() => addToWishlist(destination)}>
                      {isInWishlist(destId) ? '❤️ Saved' : '🤍 Save'}
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }
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
        .destinations-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 20px 60px;
        }
        .destinations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }
        .destination-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .destination-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }
        .card-image {
          position: relative;
          height: 220px;
          overflow: hidden;
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .destination-card:hover .card-image img {
          transform: scale(1.05);
        }
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
        }
        .destination-card:hover .slider-btn {
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
        }
        .card-content {
          padding: 18px;
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
          justify-content: space-between;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }
        .price-budget { color: #4caf50; }
        .price-mid { color: #ff9800; }
        .price-premium { color: #ff6b6b; }
        .card-buttons {
          display: flex;
          gap: 12px;
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
        .wishlist-btn:hover, .book-btn:hover {
          transform: translateY(-2px);
        }
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
          .destinations-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Local destinations data
const localDestinations = [
  {
    id: 1,
    name: "Lalibela",
    region: "Amhara",
    location: "Amhara",
    category: "historical",
    images: [
      "https://i.pinimg.com/736x/e6/c6/6d/e6c66dd3d26469e205da54776ef0259c.jpg",
      "https://i.pinimg.com/736x/78/6e/9d/786e9d7d60aae752b95af9ba4a80f955.jpg"
    ],
    description: "Famous for its 11 rock-hewn churches, often called the 'Eighth Wonder of the World'.",
    bestTime: "October to March",
    duration: "2-3 days",
    price: "5,000 - 8,000 ETB",
    priceLevel: "$$$",
    rating: 4.9,
    activities: ["Church Tour", "Hiking", "Coffee Ceremony"]
  },
  {
    id: 2,
    name: "Simien Mountains",
    region: "Amhara",
    location: "Amhara",
    category: "nature",
    images: [
      "https://i.pinimg.com/736x/65/97/de/6597debe2e191b470276cbe0171a9410.jpg",
      "https://i.pinimg.com/736x/6a/c5/f1/6ac5f1d7ecf370937e54471d782e004a.jpg"
    ],
    description: "UNESCO World Heritage site with stunning landscapes.",
    bestTime: "September to November",
    duration: "4-5 days",
    price: "3,500 - 6,000 ETB",
    priceLevel: "$$",
    rating: 4.8,
    activities: ["Trekking", "Wildlife Viewing", "Camping"]
  },
  {
    id: 3,
    name: "Danakil Depression",
    region: "Afar",
    location: "Afar",
    category: "adventure",
    images: [
      "https://i.pinimg.com/736x/03/e3/ac/03e3acfe27a68e8f12f356bbeb9a9d8c.jpg",
      "https://i.pinimg.com/736x/0a/81/cb/0a81cb3d310ecd663445645aabe17e5f.jpg"
    ],
    description: "One of the hottest places on Earth with colorful sulfur springs.",
    bestTime: "November to February",
    duration: "3-4 days",
    price: "8,000 - 12,000 ETB",
    priceLevel: "$$$",
    rating: 4.7,
    activities: ["Volcano Hiking", "Salt Flats Tour", "Photography"]
  }
];