import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AnimatedGraphics from './AnimatedGraphics';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalSpent: 0,
    tripsCompleted: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [bookingsRes, favoritesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/bookings/my-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const bookingsData = bookingsRes.data.data || [];
      const favoritesData = favoritesRes.data.data || [];
      setBookings(bookingsData);
      setFavorites(favoritesData);
      
      const totalSpent = bookingsData.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      const tripsCompleted = bookingsData.filter(b => b.status === 'completed').length;
      setUserStats({ totalSpent, tripsCompleted });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Booking cancelled successfully');
      fetchUserData();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const removeFavorite = async (destinationId) => {
    try {
      await axios.delete(`http://localhost:5000/api/favorites/${destinationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Removed from favorites');
      fetchUserData();
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <AnimatedGraphics />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    const name = user?.name || user?.fullname || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  const profileColors = ['#667eea', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
  const profileColor = profileColors[(user?.username?.length || 0) % profileColors.length];

  return (
    <div className="dashboard-page">
      <AnimatedGraphics />
      
      <nav className="dashboard-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🇪🇹</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/tourist" className="nav-link">🏔️ Destinations</Link>
          <Link to="/wishlist" className="nav-link">❤️ Wishlist</Link>
          <Link to="/translator" className="nav-link">🗣️ Translator</Link>
          <Link to="/currency" className="nav-link">💰 Currency</Link>
          <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar" style={{ background: profileColor }}>
              <span className="avatar-initials">{getInitials()}</span>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user?.name || user?.fullname || user?.username}</h1>
              <p className="profile-username">@{user?.username}</p>
              <div className="profile-details">
                <div className="profile-detail">
                  <span className="detail-icon">📧</span>
                  <span>{user?.email}</span>
                </div>
                {user?.location && (
                  <div className="profile-detail">
                    <span className="detail-icon">📍</span>
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="profile-detail">
                  <span className="detail-icon">📅</span>
                  <span>Member since 2024</span>
                </div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="stat-number">{bookings.length}</div>
                <div className="stat-label">Trips</div>
              </div>
              <div className="profile-stat">
                <div className="stat-number">{favorites.length}</div>
                <div className="stat-label">Wishlist</div>
              </div>
              <div className="profile-stat">
                <div className="stat-number">{userStats.tripsCompleted}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">✈️</div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-value">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">{userStats.totalSpent.toLocaleString()} ETB</div>
            <div className="stat-label">Total Spent</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">4.8</div>
            <div className="stat-label">Rating</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            ✈️ My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          >
            ❤️ Favorites ({favorites.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="section-card">
              <h3 className="section-title">Quick Actions</h3>
              <div className="quick-actions-grid">
                <Link to="/tourist" className="action-card">
                  <div className="action-icon">🏔️</div>
                  <div className="action-title">Explore Destinations</div>
                  <div className="action-desc">Discover Ethiopia's hidden gems</div>
                </Link>
                <Link to="/wishlist" className="action-card">
                  <div className="action-icon">❤️</div>
                  <div className="action-title">My Wishlist</div>
                  <div className="action-desc">View your saved places</div>
                </Link>
                <Link to="/translator" className="action-card">
                  <div className="action-icon">🗣️</div>
                  <div className="action-title">Language Translator</div>
                  <div className="action-desc">Learn Amharic phrases</div>
                </Link>
                <Link to="/currency" className="action-card">
                  <div className="action-icon">💰</div>
                  <div className="action-title">Currency Converter</div>
                  <div className="action-desc">Convert to Ethiopian Birr</div>
                </Link>
              </div>
            </div>

            {bookings.length > 0 && (
              <div className="section-card">
                <h3 className="section-title">Recent Bookings</h3>
                <div className="recent-list">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="recent-item">
                      <div className="recent-image">
                        <img src={booking.destination?.images?.[0] || 'https://via.placeholder.com/60'} alt={booking.destination?.name} />
                      </div>
                      <div className="recent-info">
                        <h4>{booking.destination?.name}</h4>
                        <p>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                      </div>
                      <div className="recent-status">
                        <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="quote-card">
              <div className="quote-icon">🌟</div>
              <p className="quote-text">"Ethiopia is not just a destination, it's a feeling. The land of origins awaits you."</p>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="tab-content">
            {bookings.length === 0 ? (
              <div className="empty-state-large">
                <div className="empty-icon">✈️</div>
                <h3>No bookings yet</h3>
                <p>Start exploring and book your first adventure!</p>
                <Link to="/tourist" className="empty-action-btn">Explore Destinations →</Link>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-image">
                      <img src={booking.destination?.images?.[0] || 'https://via.placeholder.com/120'} alt={booking.destination?.name} />
                    </div>
                    <div className="booking-content">
                      <div className="booking-header">
                        <h3>{booking.destination?.name}</h3>
                        <span className={`booking-status ${booking.status}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="booking-location">📍 {booking.destination?.location}</p>
                      <div className="booking-details">
                        <div className="booking-detail">
                          <span>📅 Check-in</span>
                          <strong>{new Date(booking.checkInDate).toLocaleDateString()}</strong>
                        </div>
                        <div className="booking-detail">
                          <span>📅 Check-out</span>
                          <strong>{new Date(booking.checkOutDate).toLocaleDateString()}</strong>
                        </div>
                        <div className="booking-detail">
                          <span>👥 Travelers</span>
                          <strong>{booking.numberOfTravelers}</strong>
                        </div>
                        <div className="booking-detail">
                          <span>💰 Total</span>
                          <strong>{booking.totalPrice.toLocaleString()} ETB</strong>
                        </div>
                      </div>
                      {booking.status !== 'cancelled' && (
                        <button onClick={() => cancelBooking(booking._id)} className="cancel-btn">
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="tab-content">
            {favorites.length === 0 ? (
              <div className="empty-state-large">
                <div className="empty-icon">❤️</div>
                <h3>No favorites yet</h3>
                <p>Save destinations you love to your wishlist!</p>
                <Link to="/tourist" className="empty-action-btn">Browse Destinations →</Link>
              </div>
            ) : (
              <div className="favorites-grid">
                {favorites.map((dest) => (
                  <div key={dest._id} className="favorite-card">
                    <div className="favorite-image">
                      <img src={dest.imageUrl || dest.images?.[0] || 'https://via.placeholder.com/300'} alt={dest.name} />
                      <div className="favorite-rating">⭐ {dest.rating || 4.5}</div>
                    </div>
                    <div className="favorite-content">
                      <h3>{dest.name}</h3>
                      <p className="favorite-location">📍 {dest.location || dest.region}</p>
                      <p className="favorite-description">{dest.description?.substring(0, 80)}...</p>
                      <div className="favorite-price">{dest.price}</div>
                      <div className="favorite-actions">
                        <Link to={`/destination/${dest._id}`} className="view-btn">View Details →</Link>
                        <button onClick={() => removeFavorite(dest._id)} className="remove-favorite-btn">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .dashboard-navbar {
          background: rgba(255, 255, 255, 0.1);
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

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          position: relative;
          z-index: 10;
        }

        .profile-section {
          margin-bottom: 40px;
        }

        .profile-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 30px;
          flex-wrap: wrap;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .avatar-initials {
          font-size: 48px;
          font-weight: 700;
          color: white;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 5px;
        }

        .profile-username {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin-bottom: 15px;
        }

        .profile-details {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        .profile-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .detail-icon {
          font-size: 16px;
        }

        .profile-stats {
          display: flex;
          gap: 30px;
          padding-left: 30px;
          border-left: 1px solid rgba(255, 255, 255, 0.2);
        }

        .profile-stat {
          text-align: center;
        }

        .profile-stat .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: white;
        }

        .profile-stat .stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 25px;
          text-align: center;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.1);
        }

        .stat-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 5px;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }

        .tabs-container {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
        }

        .tab-btn {
          padding: 12px 28px;
          background: transparent;
          border: none;
          border-radius: 50px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tab-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .tab-content {
          animation: fadeIn 0.4s ease;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 30px;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .action-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(102, 126, 234, 0.5);
        }

        .action-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .action-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 5px;
        }

        .action-desc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 16px;
        }

        .recent-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .recent-image {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          overflow: hidden;
        }

        .recent-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .recent-info {
          flex: 1;
        }

        .recent-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 5px;
        }

        .recent-info p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-badge.confirmed {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .status-badge.cancelled {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .quote-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
          border-radius: 24px;
          padding: 30px;
          text-align: center;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .quote-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .quote-text {
          font-size: 18px;
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .booking-card {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .booking-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .booking-image {
          width: 120px;
          flex-shrink: 0;
        }

        .booking-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .booking-content {
          flex: 1;
          padding: 20px;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .booking-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: white;
        }

        .booking-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .booking-status.confirmed {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .booking-status.pending {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .booking-status.cancelled {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .booking-location {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          margin-bottom: 15px;
        }

        .booking-details {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 15px;
          padding: 12px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .booking-detail {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .booking-detail span {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }

        .booking-detail strong {
          font-size: 14px;
          color: white;
        }

        .cancel-btn {
          padding: 8px 20px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #ef4444;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cancel-btn:hover {
          background: #ef4444;
          color: white;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
        }

        .favorite-card {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .favorite-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.1);
        }

        .favorite-image {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .favorite-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .favorite-card:hover .favorite-image img {
          transform: scale(1.05);
        }

        .favorite-rating {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.7);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          color: #ffd700;
        }

        .favorite-content {
          padding: 18px;
        }

        .favorite-content h3 {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 5px;
        }

        .favorite-location {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 10px;
        }

        .favorite-description {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .favorite-price {
          font-size: 14px;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 12px;
        }

        .favorite-actions {
          display: flex;
          gap: 10px;
        }

        .view-btn {
          flex: 1;
          text-align: center;
          padding: 8px;
          background: rgba(102, 126, 234, 0.2);
          border-radius: 8px;
          color: #667eea;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .view-btn:hover {
          background: #667eea;
          color: white;
        }

        .remove-favorite-btn {
          flex: 1;
          padding: 8px;
          background: rgba(239, 68, 68, 0.2);
          border: none;
          border-radius: 8px;
          color: #ef4444;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .remove-favorite-btn:hover {
          background: #ef4444;
          color: white;
        }

        .empty-state-large {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 24px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .empty-state-large h3 {
          font-size: 22px;
          color: white;
          margin-bottom: 10px;
        }

        .empty-state-large p {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 20px;
        }

        .empty-action-btn {
          display: inline-block;
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50px;
          color: white;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .empty-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
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

        .loading-text {
          color: white;
          font-size: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .favorites-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .booking-details {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-navbar {
            flex-direction: column;
            padding: 15px 20px;
            gap: 15px;
          }
          .nav-links {
            justify-content: center;
          }
          .profile-card {
            flex-direction: column;
            text-align: center;
          }
          .profile-details {
            justify-content: center;
          }
          .profile-stats {
            border-left: none;
            padding-left: 0;
            justify-content: center;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
          .favorites-grid {
            grid-template-columns: 1fr;
          }
          .booking-card {
            flex-direction: column;
          }
          .booking-image {
            width: 100%;
            height: 150px;
          }
          .booking-details {
            grid-template-columns: 1fr;
          }
          .tabs-container {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}