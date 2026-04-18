import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../App.css';

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
    
    // Get destination by ID
    const dest = destinations.find(d => d.id === parseInt(id));
    if (dest) {
      setDestination(dest);
      // Check if in wishlist
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsInWishlist(wishlist.some(item => item.id === dest.id));
    }
  }, [id, navigate]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % destination.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + destination.images.length) % destination.images.length);
  };

  const addToWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!isInWishlist) {
      wishlist.push(destination);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
      alert('Added to wishlist!');
    } else {
      const newWishlist = wishlist.filter(item => item.id !== destination.id);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setIsInWishlist(false);
      alert('Removed from wishlist!');
    }
  };

  if (!destination) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="details-container">
      <nav className="tourist-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🇪🇹</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/welcome" className="nav-link">Dashboard</Link>
          <Link to="/tourist" className="nav-link">Destinations</Link>
          <Link to="/wishlist" className="nav-link">❤️ Wishlist</Link>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }} className="logout-nav-btn">Logout</button>
        </div>
      </nav>

      <div className="details-content">
        {/* Image Gallery */}
        <div className="details-gallery">
          <div className="main-image">
            <img src={destination.images[currentImageIndex]} alt={destination.name} />
            {destination.images.length > 1 && (
              <>
                <button className="slider-btn prev-btn" onClick={prevImage}>❮</button>
                <button className="slider-btn next-btn" onClick={nextImage}>❯</button>
              </>
            )}
          </div>
          <div className="thumbnail-gallery">
            {destination.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${destination.name} ${idx + 1}`}
                className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(idx)}
              />
            ))}
          </div>
        </div>

        {/* Destination Info */}
        <div className="details-info">
          <h1 className="details-title">{destination.name}</h1>
          <p className="details-region">📍 {destination.region}, Ethiopia</p>
          
          <div className="details-rating">
            <span>⭐</span> {destination.rating} / 5.0
          </div>

          <button 
            className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
            onClick={addToWishlist}
          >
            {isInWishlist ? '❤️ Saved to Wishlist' : '🤍 Save to Wishlist'}
          </button>

          <div className="description-section">
            <h2>About {destination.name}</h2>
            <p>{destination.description}</p>
          </div>

          {/* Estimated Budget Section */}
          <div className="budget-section">
            <h2>💰 Estimated Budget</h2>
            <div className="budget-grid">
              <div className="budget-item">
                <span>💰 Price Range:</span>
                <strong>{destination.price}</strong>
              </div>
              <div className="budget-item">
                <span>⏱️ Recommended Stay:</span>
                <strong>{destination.duration}</strong>
              </div>
              <div className="budget-item">
                <span>📅 Best Time:</span>
                <strong>{destination.bestTime}</strong>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="activities-section">
            <h2>🎯 Top Activities</h2>
            <div className="activities-list">
              {destination.activities.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <span>✓</span> {activity}
                </div>
              ))}
            </div>
          </div>

          {/* Travel Tips */}
          <div className="tips-section">
            <h2>💡 Travel Tips</h2>
            <ul>
              <li>🏨 Book accommodation in advance during peak season</li>
              <li>📱 Download offline maps before arrival</li>
              <li>💵 Carry cash as cards may not be accepted</li>
              <li>🧥 Pack layers - weather can change quickly</li>
              <li>📷 Ask permission before taking photos of locals</li>
            </ul>
          </div>
        </div>
      </div>
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