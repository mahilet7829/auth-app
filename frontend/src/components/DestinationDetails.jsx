import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    const dest = destinations.find(d => d.id === parseInt(id));
    if (dest) {
      setDestination(dest);
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsInWishlist(wishlist.some(item => item.id === dest.id));
    } else {
      navigate('/tourist');
    }
  }, [id, navigate]);

  const nextImage = () => {
    if (destination?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % destination.images.length);
    }
  };

  const prevImage = () => {
    if (destination?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + destination.images.length) % destination.images.length);
    }
  };

  const addToWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!isInWishlist) {
      wishlist.push(destination);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
      toast.success(`${destination.name} added to wishlist!`);
    } else {
      const newWishlist = wishlist.filter(item => item.id !== destination.id);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setIsInWishlist(false);
      toast.success(`${destination.name} removed from wishlist!`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!destination) {
    return (
      <div className="details-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading destination...</div>
      </div>
    );
  }

  return (
    <div className="details-page">
      {/* Navbar */}
      <nav className="details-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🇪🇹</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/welcome" className="nav-link">Dashboard</Link>
          <Link to="/tourist" className="nav-link">Destinations</Link>
          <Link to="/wishlist" className="nav-link">❤️ Wishlist</Link>
          <Link to="/translator" className="nav-link">🗣️ Translator</Link>
          <Link to="/currency" className="nav-link">💰 Currency</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Hero Section with Image */}
      <div className="details-hero">
        <div className="hero-image-container">
          <img src={destination.images[currentImageIndex]} alt={destination.name} />
          {destination.images.length > 1 && (
            <>
              <button className="hero-slider-btn prev" onClick={prevImage}>❮</button>
              <button className="hero-slider-btn next" onClick={nextImage}>❯</button>
            </>
          )}
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">{destination.name}</h1>
            <p className="hero-location">📍 {destination.region}, Ethiopia</p>
            <div className="hero-rating">⭐ {destination.rating} / 5.0</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="details-main">
        <div className="details-container">
          {/* Wishlist Button */}
          <div className="wishlist-section">
            <button 
              className={`wishlist-btn-large ${isInWishlist ? 'active' : ''}`}
              onClick={addToWishlist}
            >
              {isInWishlist ? '❤️ Saved to Wishlist' : '🤍 Save to Wishlist'}
            </button>
          </div>

          {/* Description */}
          <div className="info-card">
            <h2>📖 About {destination.name}</h2>
            <p>{destination.description}</p>
          </div>

          {/* Quick Info Grid */}
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">💰</div>
              <h3>Price Range</h3>
              <p className="info-value">{destination.price}</p>
              <span className={`price-badge ${destination.priceLevel === '$' ? 'budget' : destination.priceLevel === '$$' ? 'mid' : 'premium'}`}>
                {destination.priceLevel === '$' ? 'Budget Friendly' : destination.priceLevel === '$$' ? 'Mid Range' : 'Premium'}
              </span>
            </div>
            <div className="info-card">
              <div className="info-icon">⏱️</div>
              <h3>Recommended Stay</h3>
              <p className="info-value">{destination.duration}</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📅</div>
              <h3>Best Time to Visit</h3>
              <p className="info-value">{destination.bestTime}</p>
            </div>
          </div>

          {/* Activities */}
          <div className="info-card">
            <h2>🎯 Top Activities</h2>
            <div className="activities-grid">
              {destination.activities.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <span className="activity-check">✓</span>
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Tips */}
          <div className="info-card tips-card">
            <h2>💡 Travel Tips</h2>
            <div className="tips-grid">
              <div className="tip-item">🏨 Book accommodation in advance during peak season</div>
              <div className="tip-item">📱 Download offline maps before arrival</div>
              <div className="tip-item">💵 Carry cash as cards may not be accepted</div>
              <div className="tip-item">🧥 Pack layers - weather can change quickly</div>
              <div className="tip-item">📷 Ask permission before taking photos of locals</div>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {destination.images.length > 1 && (
            <div className="thumbnail-section">
              <h2>📸 Image Gallery</h2>
              <div className="thumbnail-grid">
                {destination.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img src={img} alt={`${destination.name} ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Book Now Button */}
          <div className="book-section">
            <Link to={`/bookings/${destination.id}`} className="book-now-btn">
              ✈️ Book This Adventure Now
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .details-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        /* Navbar */
        .details-navbar {
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
        .details-hero {
          position: relative;
          height: 60vh;
          min-height: 500px;
          overflow: hidden;
        }

        .hero-image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hero-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
        }

        .hero-slider-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 10;
        }

        .hero-slider-btn.prev { left: 20px; }
        .hero-slider-btn.next { right: 20px; }
        .hero-slider-btn:hover {
          background: rgba(102, 126, 234, 0.8);
          transform: translateY(-50%) scale(1.1);
        }

        .hero-content {
          position: absolute;
          bottom: 60px;
          left: 0;
          right: 0;
          text-align: center;
          color: white;
          z-index: 10;
          animation: fadeInUp 0.8s ease;
        }

        .hero-title {
          font-size: 56px;
          font-weight: 800;
          margin-bottom: 10px;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
        }

        .hero-location {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 10px;
        }

        .hero-rating {
          font-size: 16px;
          color: #ffd700;
        }

        /* Main Content */
        .details-main {
          max-width: 1200px;
          margin: -50px auto 0;
          padding: 0 20px 60px;
          position: relative;
          z-index: 20;
        }

        .details-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Wishlist Button */
        .wishlist-section {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .wishlist-btn-large {
          padding: 14px 40px;
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 50px;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
        }

        .wishlist-btn-large.active {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .wishlist-btn-large:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        /* Info Cards */
        .info-card {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 25px;
          margin-bottom: 25px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s;
        }

        .info-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-3px);
        }

        .info-card h2 {
          color: white;
          font-size: 24px;
          margin-bottom: 15px;
        }

        .info-card p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .info-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .info-card h3 {
          color: white;
          font-size: 18px;
          margin-bottom: 10px;
        }

        .info-value {
          font-size: 22px;
          font-weight: 700;
          color: #667eea;
        }

        .price-badge {
          display: inline-block;
          margin-top: 10px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
        }

        .price-badge.budget { background: #4caf50; color: white; }
        .price-badge.mid { background: #ff9800; color: white; }
        .price-badge.premium { background: #ff6b6b; color: white; }

        /* Activities Grid */
        .activities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s;
        }

        .activity-item:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateX(5px);
        }

        .activity-check {
          color: #4caf50;
          font-weight: bold;
          font-size: 18px;
        }

        /* Tips Card */
        .tips-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .tip-item {
          padding: 10px 0;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Thumbnail Gallery */
        .thumbnail-section {
          margin: 30px 0;
        }

        .thumbnail-section h2 {
          color: white;
          font-size: 24px;
          margin-bottom: 20px;
        }

        .thumbnail-grid {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .thumbnail {
          width: 100px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }

        .thumbnail.active {
          opacity: 1;
          border-color: #667eea;
          transform: scale(1.05);
        }

        /* Book Now Button */
        .book-section {
          text-align: center;
          margin-top: 30px;
        }

        .book-now-btn {
          display: inline-block;
          padding: 16px 48px;
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 50px;
          color: white;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .book-now-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
        }

        /* Loading */
        .details-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0a0a2a, #1a1a3a);
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

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .details-navbar {
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

          .hero-location {
            font-size: 14px;
          }

          .details-container {
            padding: 25px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .hero-slider-btn {
            width: 35px;
            height: 35px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

// Destination data
const destinations = [
  {
    id: 1,
    name: "Lalibela",
    region: "Amhara",
    category: "historical",
    images: [
      "https://i.pinimg.com/736x/e6/c6/6d/e6c66dd3d26469e205da54776ef0259c.jpg",
      "https://i.pinimg.com/736x/78/6e/9d/786e9d7d60aae752b95af9ba4a80f955.jpg"
    ],
    description: "Lalibela is home to 11 medieval rock-hewn churches, carved from solid volcanic rock in the 12th-13th centuries. Often called the 'Eighth Wonder of the World', these churches are still active pilgrimage sites and showcase incredible architectural achievement.",
    bestTime: "October to March (Dry season)",
    duration: "2-3 days",
    price: "5,000 - 8,000 ETB",
    priceLevel: "$$$",
    rating: 4.9,
    activities: ["Visit 11 Rock Churches", "Asheton Maryam Hike", "Coffee Ceremony", "Saturday Market"]
  },
  {
    id: 2,
    name: "Simien Mountains",
    region: "Amhara",
    category: "nature",
    images: [
      "https://i.pinimg.com/736x/6a/c5/f1/6ac5f1d7ecf370937e54471d782e004a.jpg",
      "https://i.pinimg.com/736x/c3/91/90/c39190e216c8639c0f427f3d50702a64.jpg"
    ],
    description: "UNESCO World Heritage site featuring dramatic escarpments, deep valleys, and peaks reaching over 4,000 meters. Home to unique wildlife including Gelada baboons and Ethiopian wolves.",
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
    category: "adventure",
    images: [
      "https://i.pinimg.com/736x/0a/81/cb/0a81cb3d310ecd663445645aabe17e5f.jpg",
      "https://i.pinimg.com/736x/02/d9/80/02d980d6d02a3d859157081760557b1e.jpg"
    ],
    description: "One of the hottest and most unique places on Earth, featuring colorful sulfur springs, vast salt flats, and the active Erta Ale volcano with its permanent lava lake.",
    bestTime: "November to February",
    duration: "3-4 days",
    price: "8,000 - 12,000 ETB",
    priceLevel: "$$$",
    rating: 4.7,
    activities: ["Erta Ale Volcano Hike", "Salt Flats Tour", "Dallol Springs", "Camping under stars"]
  },
  {
    id: 4,
    name: "Axum",
    region: "Tigray",
    category: "historical",
    images: [
      "https://i.pinimg.com/736x/3b/46/0a/3b460a263b366ead68b42d67a6f592f7.jpg",
      "https://i.pinimg.com/736x/40/14/08/401408575f587831b32d044482f72c0d.jpg"
    ],
    description: "Ancient city known for its towering obelisks, royal tombs, and the legendary Ark of the Covenant.",
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
    category: "nature",
    images: [
      "https://i.pinimg.com/736x/66/fb/07/66fb07f7b360b6bc3606c8151b15a338.jpg",
      "https://i.pinimg.com/736x/de/09/71/de0971289ba12c3b1b2c91d452d06d40.jpg"
    ],
    description: "Ethiopia's largest lake with ancient island monasteries dating back to the 14th century.",
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
    category: "historical",
    images: [
      "https://i.pinimg.com/736x/b7/91/25/b79125130fdbaa410b279bd3a2b6966c.jpg",
      "https://i.pinimg.com/736x/01/74/f8/0174f8cf48afeb54706e9b593b8a8b18.jpg"
    ],
    description: "Known as the 'Camelot of Africa' with its magnificent royal castles and churches.",
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
    category: "nature",
    images: [
      "https://i.pinimg.com/736x/ff/6f/18/ff6f18ec5e574131cb41eb26be9361d8.jpg",
      "https://i.pinimg.com/736x/ad/47/e4/ad47e459aa8a5a64ac0bc2172f152ba2.jpg"
    ],
    description: "Home to rare Ethiopian wolves and stunning alpine scenery with Africa's largest alpine plateau.",
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
    category: "cultural",
    images: [
      "https://i.pinimg.com/736x/ed/fd/9c/edfd9c9210856a3445f955172a52e3b4.jpg",
      "https://i.pinimg.com/736x/ed/fd/9c/edfd9c9210856a3445f955172a52e3b4.jpg"
    ],
    description: "Ancient walled city known for its unique culture, colorful markets, and nightly hyena feeding tradition.",
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
    category: "cultural",
    images: [
      "https://i.pinimg.com/736x/02/ca/31/02ca31e7bfabc822630118d9d7db4e78.jpg",
      "https://i.pinimg.com/736x/24/c3/b0/24c3b07d39efc073b56ca0f10a675f6e.jpg"
    ],
    description: "Home to diverse indigenous tribes with unique traditions, body art, and ancient customs.",
    bestTime: "June to September",
    duration: "5-7 days",
    price: "6,000 - 10,000 ETB",
    priceLevel: "$$$",
    rating: 4.9,
    activities: ["Cultural Tours", "Village Visits", "Tribal Ceremonies", "Photography"]
  }
];