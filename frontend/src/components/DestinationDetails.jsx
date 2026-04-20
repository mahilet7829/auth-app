import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destination, setDestination] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Synced destination data
  const destinations = [
    {
      id: 1, name: "Lalibela", region: "Amhara", category: "historical",
      images: ["https://i.pinimg.com/736x/e6/c6/6d/e6c66dd3d26469e205da54776ef0259c.jpg", "https://i.pinimg.com/736x/78/6e/9d/786e9d7d60aae752b95af9ba4a80f955.jpg"],
      description: "Lalibela is home to 11 medieval rock-hewn churches, carved from solid volcanic rock in the 12th-13th centuries. Often called the 'Eighth Wonder of the World', these churches are still active pilgrimage sites and showcase incredible architectural achievement.",
      bestTime: "October to March (Dry season)", duration: "2-3 days", price: "5,000 - 8,000 ETB", rating: 4.9,
      activities: ["Visit 11 Rock Churches", "Asheton Maryam Hike", "Coffee Ceremony", "Saturday Market"]
    },
    {
      id: 2, name: "Simien Mountains", region: "Amhara", category: "nature",
      images: ["https://i.pinimg.com/736x/6a/c5/f1/6ac5f1d7ecf370937e54471d782e004a.jpg", "https://i.pinimg.com/736x/c3/91/90/c39190e216c8639c0f427f3d50702a64.jpg"],
      description: "UNESCO World Heritage site featuring dramatic escarpments, deep valleys, and peaks reaching over 4,000 meters. Home to unique wildlife including Gelada baboons and Ethiopian wolves.",
      bestTime: "September to November", duration: "4-5 days", price: "3,500 - 6,000 ETB", rating: 4.8,
      activities: ["Trekking", "Wildlife Viewing", "Camping", "Photography"]
    },
    {
      id: 3, name: "Danakil Depression", region: "Afar", category: "adventure",
      images: ["https://i.pinimg.com/736x/0a/81/cb/0a81cb3d310ecd663445645aabe17e5f.jpg", "https://i.pinimg.com/736x/02/d9/80/02d980d6d02a3d859157081760557b1e.jpg"],
      description: "One of the hottest and most unique places on Earth, featuring colorful sulfur springs, vast salt flats, and the active Erta Ale volcano with its permanent lava lake.",
      bestTime: "November to February", duration: "3-4 days", price: "8,000 - 12,000 ETB", rating: 4.7,
      activities: ["Erta Ale Volcano Hike", "Salt Flats Tour", "Dallol Springs", "Camping under stars"]
    },
    {
      id: 4, name: "Axum", region: "Tigray", category: "historical",
      images: ["https://i.pinimg.com/736x/3b/46/0a/3b460a263b366ead68b42d67a6f592f7.jpg", "https://i.pinimg.com/736x/40/14/08/401408575f587831b32d044482f72c0d.jpg"],
      description: "Ancient city known for its towering obelisks, royal tombs, and the legendary Ark of the Covenant.",
      bestTime: "October to April", duration: "2 days", price: "2,500 - 4,500 ETB", rating: 4.6,
      activities: ["Historical Tour", "Museum Visit", "Stelae Field", "Archaeological Sites"]
    },
    {
      id: 5, name: "Lake Tana", region: "Amhara", category: "nature",
      images: ["https://i.pinimg.com/736x/66/fb/07/66fb07f7b360b6bc3606c8151b15a338.jpg", "https://i.pinimg.com/736x/de/09/71/de0971289ba12c3b1b2c91d452d06d40.jpg"],
      description: "Ethiopia's largest lake with ancient island monasteries dating back to the 14th century.",
      bestTime: "October to June", duration: "2 days", price: "2,000 - 3,500 ETB", rating: 4.5,
      activities: ["Boat Tour", "Monastery Visit", "Bird Watching", "Fishing"]
    },
    {
      id: 6, name: "Gondar", region: "Amhara", category: "historical",
      images: ["https://i.pinimg.com/736x/b7/91/25/b79125130fdbaa410b279bd3a2b6966c.jpg", "https://i.pinimg.com/736x/01/74/f8/0174f8cf48afeb54706e9b593b8a8b18.jpg"],
      description: "Known as the 'Camelot of Africa' with its magnificent royal castles and churches.",
      bestTime: "October to March", duration: "2 days", price: "2,000 - 4,000 ETB", rating: 4.7,
      activities: ["Castle Tour", "Historical Sites", "Pool of David", "Church of Debre Berhan Selassie"]
    },
    {
      id: 7, name: "Bale Mountains", region: "Oromia", category: "nature",
      images: ["https://i.pinimg.com/736x/ff/6f/18/ff6f18ec5e574131cb41eb26be9361d8.jpg", "https://i.pinimg.com/736x/ad/47/e4/ad47e459aa8a5a64ac0bc2172f152ba2.jpg"],
      description: "Home to rare Ethiopian wolves and stunning alpine scenery with Africa's largest alpine plateau.",
      bestTime: "November to February", duration: "3-4 days", price: "3,000 - 5,500 ETB", rating: 4.8,
      activities: ["Trekking", "Wildlife Safari", "Bird Watching", "Camping"]
    },
    {
      id: 8, name: "Harar", region: "Harari", category: "cultural",
      images: ["https://i.pinimg.com/736x/ed/fd/9c/edfd9c9210856a3445f955172a52e3b4.jpg", "https://i.pinimg.com/736x/ed/fd/9c/edfd9c9210856a3445f955172a52e3b4.jpg"],
      description: "Ancient walled city known for its unique culture, colorful markets, and nightly hyena feeding tradition.",
      bestTime: "October to April", duration: "2 days", price: "1,500 - 3,000 ETB", rating: 4.6,
      activities: ["City Tour", "Hyena Feeding", "Market Visit", "Museum Tour"]
    },
    {
      id: 9, name: "Omo Valley", region: "South Omo", category: "cultural",
      images: ["https://i.pinimg.com/736x/02/ca/31/02ca31e7bfabc822630118d9d7db4e78.jpg", "https://i.pinimg.com/736x/24/c3/b0/24c3b07d39efc073b56ca0f10a675f6e.jpg"],
      description: "Home to diverse indigenous tribes with unique traditions, body art, and ancient customs.",
      bestTime: "June to September", duration: "5-7 days", price: "6,000 - 10,000 ETB", rating: 4.9,
      activities: ["Cultural Tours", "Village Visits", "Tribal Ceremonies", "Photography"]
    }
  ];

  useEffect(() => {
    const dest = destinations.find(d => d.id === parseInt(id));
    if (dest) {
      setDestination(dest);
    } else {
      navigate('/');
    }
    window.scrollTo(0, 0); // Ensure page starts at the top
  }, [id, navigate]);

  const addToWishlist = () => {
    if (!user) {
      toast.error("Please login to save to wishlist");
      navigate('/login');
      return;
    }
    toast.success(`${destination.name} added to wishlist!`, {
      style: { background: '#B8860B', color: '#120E0D', borderRadius: '50px' },
      iconTheme: { primary: '#120E0D', secondary: '#B8860B' }
    });
    setIsInWishlist(!isInWishlist);
  };

  if (!destination) return <div className="loading">Loading...</div>;

  return (
    <div className="details-page">
      {/* Navbar matching the home page */}
      <nav className="floating-nav">
        <div className="logo cursor-pointer" onClick={() => navigate('/')}>
          ETHIOPIA<span className="accent">TRAVEL</span>
        </div>
        <div className="nav-actions">
          <Link to="/" className="btn-text">Back to Explore</Link>
          {user && <Link to="/dashboard" className="btn-primary">Dashboard</Link>}
        </div>
      </nav>

      {/* Immersive Hero Image */}
      <div className="hero-container">
        <img src={destination.images[0]} alt={destination.name} className="hero-bg" />
        <div className="hero-gradient"></div>
        <div className="hero-content">
          <span className="region-tag">{destination.region}, Ethiopia</span>
          <h1>{destination.name}</h1>
          <div className="rating">⭐ {destination.rating} / 5.0</div>
        </div>
      </div>

      {/* Split Content Section */}
      <main className="content-wrapper">
        
        {/* Left Side: Story & Details */}
        <div className="main-details">
          <section className="about-section">
            <h2>The Experience</h2>
            <p className="description">{destination.description}</p>
          </section>

          {/* Mini Image Gallery (Bento Style) */}
          <section className="gallery-bento">
            <img src={destination.images[0]} alt="View 1" className="main-img" />
            <img src={destination.images[1]} alt="View 2" className="sub-img" />
          </section>

          <section className="activities-section">
            <h2>Key Activities</h2>
            <div className="activities-grid">
              {destination.activities.map((act, index) => (
                <div key={index} className="activity-pill">
                  <span className="check">✦</span> {act}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Sticky Booking Card */}
        <div className="sidebar">
          <div className="sticky-card">
            <div className="card-header">
              <p className="price-label">Estimated Cost</p>
              <h3>{destination.price}</h3>
            </div>
            
            <div className="quick-facts">
              <div className="fact">
                <span className="fact-icon">🗓️</span>
                <div>
                  <strong>Best Time</strong>
                  <p>{destination.bestTime}</p>
                </div>
              </div>
              <div className="fact">
                <span className="fact-icon">⏱️</span>
                <div>
                  <strong>Duration</strong>
                  <p>{destination.duration}</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className={`btn-wishlist ${isInWishlist ? 'active' : ''}`} 
                onClick={addToWishlist}
              >
                {isInWishlist ? '♥ Saved to Wishlist' : '♡ Save for Later'}
              </button>
              
              <Link to={`/bookings/${destination.id}`} className="btn-book">
                Book This Adventure
              </Link>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .details-page { background: #120E0D; min-height: 100vh; color: #EADBC8; font-family: 'Inter', sans-serif; padding-bottom: 100px; }

        /* Floating Nav */
        .floating-nav { 
          position: absolute; top: 20px; left: 50%; transform: translateX(-50%); 
          width: 90%; max-width: 1100px;
          background: rgba(18, 14, 13, 0.4); backdrop-filter: blur(15px);
          border: 1px solid rgba(184, 134, 11, 0.2);
          padding: 15px 35px; display: flex; justify-content: space-between; align-items: center; 
          border-radius: 60px; z-index: 1000; 
        }
        .logo { font-size: 1.2rem; font-weight: 800; letter-spacing: 3px; cursor: pointer; }
        .accent { color: #B8860B; }
        .btn-text { text-decoration: none; color: #EADBC8; margin-right: 20px; font-weight: 500; transition: 0.3s; }
        .btn-text:hover { color: #B8860B; }
        .btn-primary { 
          background: #B8860B; color: #120E0D; text-decoration: none; padding: 10px 25px; 
          border-radius: 50px; font-weight: 600; transition: all 0.3s ease; display: inline-block;
        }
        .btn-primary:hover { background: #D4AF37; }

        /* Hero Section */
        .hero-container { position: relative; height: 75vh; width: 100%; overflow: hidden; }
        .hero-bg { width: 100%; height: 100%; object-fit: cover; }
        .hero-gradient { 
          position: absolute; inset: 0; 
          background: linear-gradient(to bottom, rgba(18,14,13,0.1) 0%, rgba(18,14,13,0.6) 60%, #120E0D 100%);
        }
        .hero-content { 
          position: absolute; bottom: 10%; left: 8%; z-index: 2; max-width: 800px;
        }
        .region-tag { 
          background: rgba(184, 134, 11, 0.2); border: 1px solid #B8860B; color: #D4AF37;
          padding: 8px 20px; border-radius: 50px; font-weight: 600; font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase;
        }
        .hero-content h1 { font-size: 5rem; font-weight: 800; color: #FFF; margin: 20px 0 10px; line-height: 1.1; }
        .rating { font-size: 1.2rem; font-weight: 600; color: #EADBC8; display: flex; align-items: center; gap: 8px; }

        /* Split Content Layout */
        .content-wrapper { 
          display: grid; grid-template-columns: 1.5fr 1fr; gap: 60px; 
          padding: 0 8%; max-width: 1400px; margin: 0 auto; margin-top: -30px; position: relative; z-index: 10;
        }

        /* Left Column Details */
        .main-details h2 { font-size: 2rem; color: #B8860B; margin-bottom: 25px; font-weight: 700; }
        .description { font-size: 1.2rem; line-height: 1.8; color: #A69688; margin-bottom: 50px; }
        
        .gallery-bento { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 50px; height: 300px; }
        .gallery-bento img { width: 100%; height: 100%; object-fit: cover; border-radius: 20px; border: 1px solid #3E2F29; }
        
        .activities-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .activity-pill { 
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); 
          padding: 16px 20px; border-radius: 15px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: 0.3s;
        }
        .activity-pill:hover { background: rgba(184, 134, 11, 0.1); border-color: #B8860B; }
        .check { color: #B8860B; }

        /* Right Column Sticky Sidebar */
        .sidebar { position: relative; }
        .sticky-card { 
          position: sticky; top: 120px; background: rgba(26, 21, 20, 0.6); backdrop-filter: blur(20px);
          border: 1px solid rgba(184, 134, 11, 0.3); border-radius: 30px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .card-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 25px; margin-bottom: 25px; }
        .price-label { color: #A69688; font-size: 1rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
        .card-header h3 { font-size: 2.5rem; color: #FFF; margin: 0; font-weight: 700; }

        .quick-facts { display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px; }
        .fact { display: flex; align-items: flex-start; gap: 15px; }
        .fact-icon { font-size: 1.5rem; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; }
        .fact strong { display: block; color: #EADBC8; font-size: 1.1rem; margin-bottom: 4px; }
        .fact p { color: #A69688; margin: 0; font-size: 0.95rem; }

        .action-buttons { display: flex; flex-direction: column; gap: 15px; }
        .btn-wishlist { 
          width: 100%; padding: 18px; background: transparent; border: 1px solid #EADBC8; color: #EADBC8;
          border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: 0.3s;
        }
        .btn-wishlist:hover { border-color: #B8860B; color: #B8860B; }
        .btn-wishlist.active { background: rgba(184, 134, 11, 0.1); border-color: #B8860B; color: #B8860B; }
        
        .btn-book { 
          width: 100%; padding: 18px; background: #B8860B; color: #120E0D; text-align: center; text-decoration: none;
          border-radius: 50px; font-size: 1.1rem; font-weight: 700; transition: 0.3s; box-shadow: 0 10px 20px rgba(184, 134, 11, 0.2);
        }
        .btn-book:hover { background: #D4AF37; transform: translateY(-3px); box-shadow: 0 15px 25px rgba(184, 134, 11, 0.4); }

        /* Responsive */
        @media (max-width: 1024px) {
          .content-wrapper { grid-template-columns: 1fr; gap: 40px; }
          .hero-content h1 { font-size: 3.5rem; }
          .gallery-bento { height: 250px; }
          .sticky-card { position: relative; top: 0; }
        }
        @media (max-width: 768px) {
          .hero-content h1 { font-size: 2.5rem; }
          .gallery-bento { grid-template-columns: 1fr; grid-template-rows: 200px 200px; height: auto; }
        }
      `}</style>
    </div>
  );
}