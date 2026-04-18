import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ethiopian destination images for slideshow
  const slideshowImages = [
    {
      url: "https://i.pinimg.com/736x/78/6e/9d/786e9d7d60aae752b95af9ba4a80f955.jpg",
      name: "Lalibela Rock Churches",
      location: "Amhara"
    },
    {
      url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1920&h=1080&fit=crop",
      name: "Simien Mountains",
      location: "Amhara"
    },
    {
      url: "https://plus.unsplash.com/premium_photo-1695297515151-b2af3a60008d?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Abro Meblat",
      location: "Ethiopia"
    },
    {
      url: "https://i.pinimg.com/736x/a5/d3/2b/a5d32b05367498fbbcc4a72c5c61802e.jpg",
      name: "Sof Omer Cave",
      location: "Ethiopia"
    },
     {
      url: "https://i.pinimg.com/736x/0a/54/b3/0a54b3f0a73580f8b6f89bb631078df6.jpg",
      name: "Danakil Depression",
      location: "Afar"
    },
    {
      url: "https://i.pinimg.com/736x/83/3a/ba/833aba3c380ab10bc6bc2910889b84d2.jpg",
      name: "Axum Obelisks",
      location: "Tigray"
    },
    {
      url: "https://i.pinimg.com/736x/94/8b/a9/948ba9cd2d293e7f84f2b8651a7008af.jpg",
      name: "Lake Tana",
      location: "Amhara"
    },
    {
      url: "https://i.pinimg.com/736x/7f/24/f4/7f24f48288aa816630447c47824d8b05.jpg",
      name: "Tis Abay",
      location: "Ethiopia"
    }
  ];

  // Preload images to prevent empty gaps
  useEffect(() => {
    slideshowImages.forEach(image => {
      const img = new Image();
      img.src = image.url;
    });
  }, []);

  // Auto-rotate images every 3 seconds (faster)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === slideshowImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Changed from 5000 to 3000ms

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="welcome-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading your experience...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentImage = slideshowImages[currentImageIndex];

  return (
    <div className="welcome-page">
      {/* Background Slideshow */}
      <div className="slideshow-container">
        {slideshowImages.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentImageIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image.url})` }}
          />
        ))}
        <div className="slideshow-overlay"></div>
        
        {/* Image Caption */}
        <div className="slide-caption">
          <h2>{currentImage.name}</h2>
          <p>{currentImage.location}, Ethiopia</p>
        </div>
        
        {/* Slide Indicators */}
        <div className="slide-indicators">
          {slideshowImages.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Top Bar - Transparent (no background) */}
      <div className="top-bar">
        <div className="logo-section">
          <span className="logo-icon">🇪🇹</span>
          <span className="logo-text">Ethiopia Travel Guide</span>
        </div>
        <div className="user-section">
          <span className="welcome-greeting">{greeting},</span>
          <span className="user-name">{user?.name || user?.username}</span>
          <button onClick={logout} className="logout-button" title="Logout">
            🚪
          </button>
        </div>
      </div>

      {/* Center Content */}
      <div className="center-content">
        <h1 className="main-title">Discover the Land of Origins</h1>
        <p className="main-subtitle">Explore ancient history, stunning landscapes, and vibrant cultures</p>
        <button 
          onClick={() => navigate('/tourist')} 
          className="view-destinations-btn"
        >
          ✨ View Destinations ✨
        </button>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .welcome-page {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Poppins', system-ui, sans-serif;
        }

        /* Slideshow Styles */
        .slideshow-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 0.8s ease-in-out; /* Faster transition */
        }

        .slide.active {
          opacity: 1;
        }

        .slideshow-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.5) 100%);
          z-index: 1;
        }

        /* Slide Caption */
        .slide-caption {
          position: absolute;
          bottom: 100px;
          left: 0;
          right: 0;
          text-align: center;
          color: white;
          z-index: 2;
          animation: fadeInUp 0.5s ease;
        }

        .slide-caption h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 5px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slide-caption p {
          font-size: 14px;
          opacity: 0.9;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        /* Slide Indicators */
        .slide-indicators {
          position: absolute;
          bottom: 30px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 12px;
          z-index: 2;
        }

        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }

        .indicator.active {
          background: white;
          width: 24px;
          border-radius: 10px;
        }

        .indicator:hover {
          background: white;
          transform: scale(1.2);
        }

        /* Top Bar - Completely Transparent */
        .top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: transparent; /* No background */
          z-index: 10;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(135deg, #fff, #a8b2ff, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.3); /* Slight dark for readability */
          padding: 8px 20px;
          border-radius: 50px;
          backdrop-filter: blur(5px);
        }

        .welcome-greeting {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .user-name {
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .logout-button {
          background: rgba(244, 67, 54, 0.8);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
          margin-left: 5px;
        }

        .logout-button:hover {
          background: #f44336;
          transform: scale(1.05);
        }

        /* Center Content */
        .center-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 10;
          width: 100%;
          max-width: 800px;
          padding: 0 20px;
          animation: fadeInUp 0.8s ease;
        }

        .main-title {
          font-size: 56px;
          font-weight: 800;
          color: white;
          margin-bottom: 16px;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
          letter-spacing: -0.02em;
        }

        .main-subtitle {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 40px;
          text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
        }

        .view-destinations-btn {
          padding: 16px 48px;
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 50px;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .view-destinations-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        /* Loading State */
        .welcome-loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #0a0a2a, #1a1a3a);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-container {
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
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
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .top-bar {
            padding: 15px 20px;
          }

          .logo-text {
            font-size: 14px;
          }

          .user-section {
            padding: 6px 15px;
          }

          .welcome-greeting,
          .user-name {
            font-size: 12px;
          }

          .main-title {
            font-size: 32px;
          }

          .main-subtitle {
            font-size: 16px;
          }

          .view-destinations-btn {
            padding: 12px 32px;
            font-size: 16px;
          }

          .slide-caption h2 {
            font-size: 18px;
          }

          .slide-caption p {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 24px;
          }

          .main-subtitle {
            font-size: 14px;
          }

          .user-section {
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}