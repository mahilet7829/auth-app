import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TouristPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Your 9 destinations
  const destinations = [
    { 
      id: 1, 
      name: "Lalibela", 
      region: "Amhara", 
      category: "historical", 
      image: "https://i.pinimg.com/736x/e6/c6/6d/e6c66dd3d26469e205da54776ef0259c.jpg", 
      price: "5,000 ETB", 
      rating: 4.9 
    },
    { 
      id: 2, 
      name: "Simien Mountains", 
      region: "Amhara", 
      category: "nature", 
      image: "https://i.pinimg.com/736x/6a/c5/f1/6ac5f1d7ecf370937e54471d782e004a.jpg", 
      price: "3,500 ETB", 
      rating: 4.8 
    },
    { 
      id: 3, 
      name: "Danakil Depression", 
      region: "Afar", 
      category: "adventure", 
      image: "https://i.pinimg.com/736x/0a/81/cb/0a81cb3d310ecd663445645aabe17e5f.jpg", 
      price: "8,000 ETB", 
      rating: 4.7 
    },
    { 
      id: 4, 
      name: "Axum", 
      region: "Tigray", 
      category: "historical", 
      image: "https://i.pinimg.com/736x/3b/46/0a/3b460a263b366ead68b42d67a6f592f7.jpg", 
      price: "2,500 ETB", 
      rating: 4.6 
    },
    { 
      id: 5, 
      name: "Lake Tana", 
      region: "Amhara", 
      category: "nature", 
      image: "https://i.pinimg.com/736x/66/fb/07/66fb07f7b360b6bc3606c8151b15a338.jpg", 
      price: "2,000 ETB", 
      rating: 4.5 
    },
    { 
      id: 6, 
      name: "Gondar", 
      region: "Amhara", 
      category: "historical", 
      image: "https://i.pinimg.com/736x/b7/91/25/b79125130fdbaa410b279bd3a2b6966c.jpg", 
      price: "2,000 ETB", 
      rating: 4.7 
    },
    { 
      id: 7, 
      name: "Bale Mountains", 
      region: "Oromia", 
      category: "nature", 
      image: "https://i.pinimg.com/736x/ff/6f/18/ff6f18ec5e574131cb41eb26be9361d8.jpg", 
      price: "3,000 ETB", 
      rating: 4.8 
    },
    { 
      id: 8, 
      name: "Harar", 
      region: "Harari", 
      category: "cultural", 
      image: "https://i.pinimg.com/736x/ed/fd/9c/edfd9c9210856a3445f955172a52e3b4.jpg", 
      price: "1,500 ETB", 
      rating: 4.6 
    },
    { 
      id: 9, 
      name: "Omo Valley", 
      region: "South Omo", 
      category: "cultural", 
      image: "https://i.pinimg.com/736x/02/ca/31/02ca31e7bfabc822630118d9d7db4e78.jpg", 
      price: "6,000 ETB", 
      rating: 4.9 
    }
  ];

  const categories = ['all', 'historical', 'nature', 'adventure', 'cultural'];

  const filtered = destinations.filter(d => 
    (selectedCategory === 'all' || d.category === selectedCategory) &&
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="tourist-page">
      {/* Navbar */}
      <nav className="floating-nav">
        <div className="logo">ETHIOPIA<span className="accent">TRAVEL</span></div>
        <div className="nav-actions">
          {!user ? (
            <>
              <button className="btn-text" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-primary" onClick={() => navigate('/signup')}>Create Account</button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>The Land of Origins.</h1>
          <p>Embark on a journey through time, ancient landscapes, and unrivaled luxury in the heart of Africa.</p>
          <button 
            className="btn-hero" 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            Begin Exploring
          </button>
        </div>
      </header>

      {/* Bento Box Section */}
      <section className="features-bento">
        <div className="bento-header">
          <h2>Curated Experiences</h2>
          <p>Discover hand-picked adventures designed for the extraordinary.</p>
        </div>
        
        <div className="bento-grid">
          <div className="bento-item span-2x2">
            <img src="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80" alt="Nature" />
            <div className="bento-content">
              <h3>Epic Landscapes</h3>
              <p>Trek the roof of Africa in the Simien Mountains.</p>
            </div>
          </div>
          
          <div className="bento-item span-2x1">
            <img src="https://i.pinimg.com/736x/83/3a/ba/833aba3c380ab10bc6bc2910889b84d2.jpg" alt="Culture" />
            <div className="bento-content">
              <h3>Ancient Civilizations</h3>
              <p>Walk among the monolithic obelisks of Axum.</p>
            </div>
          </div>
          
          <div className="bento-item span-1x1 dark-bg">
            <div className="bento-content centered">
              <span className="icon">🌋</span>
              <h3>Active Volcanoes</h3>
            </div>
          </div>
          
          <div className="bento-item span-1x1 gold-bg">
            <div className="bento-content centered">
              <span className="icon">⭐</span>
              <h3 className="dark-text">5-Star Luxury</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="filter-wrapper">
        <div className="filter-header">
          <input 
            type="text" 
            placeholder="Search your next destination..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="chips">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <main className="destinations-grid">
        {filtered.map(dest => (
          <div key={dest.id} className="dest-card">
            <div className="img-container">
              <img src={dest.image} alt={dest.name} />
              <div className="gradient-overlay" />
              <div className="content-bottom">
                <h3>{dest.name}</h3>
                <p className="price">{dest.price}</p>
                
                {/* Fixed Explore Button - Goes to Destination Details */}
                <button 
                  className="btn-explore" 
                  onClick={() => navigate(`/destination/${dest.id}`)}
                >
                  Explore
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      <style jsx>{`
        .tourist-page { 
          background: #120E0D; 
          min-height: 100vh; 
          color: #EADBC8; 
          font-family: 'Inter', sans-serif; 
        }

        /* Floating Nav */
        .floating-nav { 
          position: absolute; 
          top: 20px; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 90%; 
          max-width: 1100px;
          background: rgba(30, 25, 23, 0.4); 
          backdrop-filter: blur(10px);
          border: 1px solid rgba(184, 134, 11, 0.2);
          padding: 15px 35px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border-radius: 60px; 
          z-index: 1000; 
        }
        .logo { font-size: 1.2rem; font-weight: 800; letter-spacing: 3px; }
        .accent { color: #B8860B; }
        .btn-text { background: none; border: none; color: #EADBC8; cursor: pointer; margin-right: 20px; font-weight: 500; }
        .btn-primary { 
          background: #B8860B; 
          color: #120E0D; 
          border: none; 
          padding: 10px 25px; 
          cursor: pointer; 
          border-radius: 50px; 
          font-weight: 600; 
          transition: all 0.3s ease; 
        }
        .btn-primary:hover { background: #D4AF37; transform: translateY(-2px); }

        /* Hero */
        .hero-section {
          position: relative; 
          height: 100vh; 
          background: url('https://images.unsplash.com/photo-1517429128955-67ff5c1e29da?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          text-align: center;
        }
        .hero-overlay {
          position: absolute; 
          inset: 0;
          background: linear-gradient(to bottom, rgba(18,14,13,0.3), #120E0D);
        }
        .hero-content {
          position: relative; 
          z-index: 2; 
          max-width: 800px; 
          padding: 0 20px;
        }
        .hero-content h1 {
          font-size: 5rem; 
          font-weight: 800; 
          margin-bottom: 20px; 
          color: #FFFFFF;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .hero-content p {
          font-size: 1.3rem; 
          color: #EADBC8; 
          margin-bottom: 40px; 
          line-height: 1.6;
        }
        .btn-hero {
          background: transparent; 
          color: #B8860B; 
          border: 2px solid #B8860B;
          padding: 16px 40px; 
          font-size: 1.1rem; 
          font-weight: 600; 
          border-radius: 50px;
          cursor: pointer; 
          transition: 0.3s;
        }
        .btn-hero:hover { 
          background: #B8860B; 
          color: #120E0D; 
        }

        /* Bento Box */
        .features-bento { 
          padding: 80px 8%; 
          max-width: 1400px; 
          margin: 0 auto; 
        }
        .bento-header { 
          text-align: center; 
          margin-bottom: 50px; 
        }
        .bento-header h2 { 
          font-size: 2.5rem; 
          color: #B8860B; 
          margin-bottom: 10px; 
        }
        .bento-header p { 
          color: #A69688; 
          font-size: 1.1rem; 
        }

        .bento-grid {
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          grid-template-rows: repeat(2, 300px); 
          gap: 20px;
        }
        .bento-item {
          position: relative; 
          border-radius: 30px; 
          overflow: hidden;
          border: 1px solid rgba(184, 134, 11, 0.15); 
          transition: 0.4s;
        }
        .bento-item:hover { 
          transform: translateY(-5px); 
          border-color: #B8860B; 
          box-shadow: 0 15px 30px rgba(0,0,0,0.4); 
        }
        .bento-item img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
        }
        
        .bento-content {
          position: absolute; 
          bottom: 0; 
          left: 0; 
          right: 0; 
          padding: 30px;
          background: linear-gradient(to top, rgba(18,14,13,0.95), transparent);
        }
        .bento-content.centered {
          position: relative; 
          height: 100%; 
          background: none;
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          text-align: center;
        }
        .bento-content h3 { 
          font-size: 1.8rem; 
          margin-bottom: 5px; 
        }
        .bento-content p { 
          color: #A69688; 
          font-size: 1rem; 
        }
        
        .icon { font-size: 3rem; margin-bottom: 15px; }
        .dark-bg { background: #1A1514; border: 1px solid #3E2F29; }
        .gold-bg { background: #B8860B; }
        .dark-text { color: #120E0D !important; }

        .span-2x2 { grid-column: span 2; grid-row: span 2; }
        .span-2x1 { grid-column: span 2; grid-row: span 1; }
        .span-1x1 { grid-column: span 1; grid-row: span 1; }

        /* Filter Bar */
        .filter-wrapper { 
          position: sticky; 
          top: 20px; 
          z-index: 99; 
          padding: 0 8%; 
          margin-bottom: 40px; 
        }
        .filter-header { 
          background: rgba(26, 21, 20, 0.85); 
          backdrop-filter: blur(15px); 
          border: 1px solid #3E2F29;
          padding: 20px; 
          border-radius: 40px; 
          text-align: center; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .search-input { 
          width: 100%; 
          max-width: 400px; 
          background: #120E0D; 
          border: 1px solid #3E2F29; 
          padding: 14px 24px; 
          color: #EADBC8; 
          border-radius: 50px; 
          outline: none; 
          margin-bottom: 20px;
          font-size: 1rem; 
        }
        .search-input:focus { 
          border-color: #B8860B; 
        }
        .chips { 
          display: flex; 
          justify-content: center; 
          gap: 10px; 
          flex-wrap: wrap; 
        }
        .chip { 
          padding: 10px 24px; 
          background: #120E0D; 
          border: 1px solid #3E2F29; 
          color: #A69688; 
          cursor: pointer; 
          border-radius: 50px; 
          transition: all 0.3s; 
          font-weight: 500; 
          font-size: 0.9rem;
        }
        .chip:hover { 
          border-color: #B8860B; 
          color: #EADBC8; 
        }
        .chip.active { 
          background: #B8860B; 
          color: #120E0D; 
          border-color: #B8860B; 
          font-weight: 700; 
        }

        /* Destinations Grid */
        .destinations-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
          gap: 30px; 
          padding: 0 8% 80px; 
          max-width: 1600px; 
          margin: 0 auto; 
        }
        .dest-card { 
          height: 420px; 
          border-radius: 30px; 
          overflow: hidden; 
          position: relative; 
          border: 1px solid rgba(255,255,255,0.05); 
          transition: all 0.4s ease;
        }
        .dest-card:hover { 
          transform: translateY(-8px); 
          border-color: #B8860B; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.5); 
        }
        .img-container { 
          width: 100%; 
          height: 100%; 
          position: relative; 
        }
        .img-container img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          transition: 0.8s; 
        }
        .dest-card:hover img { 
          transform: scale(1.08); 
        }
        .gradient-overlay { 
          position: absolute; 
          inset: 0; 
          background: linear-gradient(to top, rgba(18,14,13,0.95) 0%, rgba(18,14,13,0.4) 50%, transparent 100%); 
        }
        .content-bottom { 
          position: absolute; 
          bottom: 0; 
          left: 0; 
          right: 0; 
          padding: 30px; 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
        }
        .content-bottom h3 { 
          margin: 0; 
          font-size: 1.6rem; 
          font-weight: 700; 
        }
        .price { 
          color: #B8860B; 
          font-weight: 600; 
          font-size: 1rem; 
        }
        .btn-explore { 
          background: rgba(255,255,255,0.05); 
          backdrop-filter: blur(8px); 
          color: white; 
          border: 1px solid rgba(255,255,255,0.2); 
          padding: 12px; 
          border-radius: 50px; 
          cursor: pointer; 
          font-weight: 600; 
          margin-top: 10px; 
          width: 100%; 
          transition: 0.3s;
        }
        .btn-explore:hover { 
          background: #B8860B; 
          color: #120E0D; 
          border-color: #B8860B; 
        }

        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
          .span-2x2, .span-2x1 { grid-column: span 2; }
        }
        @media (max-width: 768px) {
          .bento-grid { grid-template-columns: 1fr; }
          .hero-content h1 { font-size: 3.2rem; }
        }
      `}</style>
    </div>
  );
}