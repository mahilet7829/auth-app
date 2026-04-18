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
      setBookings(bookingsRes.data.data || []);
      setFavorites(favoritesRes.data.data || []);
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
      toast.success('Booking cancelled');
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
        <div className="flex justify-center items-center h-screen">
          <div className="text-white text-xl">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: "✈️", label: "Total Bookings", value: bookings.length, color: "from-blue-500 to-cyan-500" },
    { icon: "❤️", label: "Favorites", value: favorites.length, color: "from-pink-500 to-rose-500" },
    { icon: "⭐", label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).getFullYear() : "2024", color: "from-yellow-500 to-orange-500" },
    { icon: "🌍", label: "Destinations Visited", value: bookings.filter(b => b.status === 'completed').length, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="dashboard-page">
      <AnimatedGraphics />
      
      <nav className="dashboard-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🇪🇹</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/tourist" className="nav-link">Destinations</Link>
          <Link to="/wishlist" className="nav-link">Wishlist</Link>
          <Link to="/translator" className="nav-link">Translator</Link>
          <Link to="/currency" className="nav-link">Currency</Link>
          <button onClick={handleLogout} className="logout-nav-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="dashboard-header glass-effect-modern p-6 rounded-2xl mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                My Dashboard
              </h1>
              <p className="text-white/70">
                Welcome back, <span className="text-white font-semibold">{user?.name || user?.username}</span>
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid-modern grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="glass-effect rounded-xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className={`text-4xl mb-3 bg-gradient-to-r ${stat.color} inline-block p-3 rounded-full`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="glass-tabs-modern flex gap-4 mb-6 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white'}`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'bookings' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white'}`}
          >
            ✈️ My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'favorites' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white'}`}
          >
            ❤️ Favorites ({favorites.length})
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="glass-effect rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-xl text-white mb-2">No bookings yet</h3>
                <p className="text-white/60 mb-4">Start exploring and book your first adventure!</p>
                <Link to="/tourist" className="inline-block px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition">
                  Explore Destinations
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="glass-effect rounded-xl p-6 hover:transform hover:translate-y-[-2px] transition-all">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{booking.destination?.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mb-3">{booking.destination?.location}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-white/50">Check-in:</span>
                          <p className="text-white">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-white/50">Check-out:</span>
                          <p className="text-white">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-white/50">Travelers:</span>
                          <p className="text-white">{booking.numberOfTravelers}</p>
                        </div>
                        <div>
                          <span className="text-white/50">Total Price:</span>
                          <p className="text-white font-semibold">{booking.totalPrice} ETB</p>
                        </div>
                      </div>
                    </div>
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition h-fit"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.length === 0 ? (
              <div className="col-span-full glass-effect rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-xl text-white mb-2">No favorites yet</h3>
                <p className="text-white/60 mb-4">Save destinations you love to your wishlist!</p>
                <Link to="/tourist" className="inline-block px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition">
                  Browse Destinations
                </Link>
              </div>
            ) : (
              favorites.map((dest) => (
                <div key={dest._id} className="glass-effect rounded-xl overflow-hidden hover:transform hover:translate-y-[-5px] transition-all">
                  <img src={dest.imageUrl || dest.images?.[0]} alt={dest.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1">{dest.name}</h3>
                    <p className="text-white/60 text-sm mb-2">{dest.location}</p>
                    <p className="text-white/80 text-sm mb-3 line-clamp-2">{dest.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400 font-bold">{dest.price} ETB</span>
                      <div className="flex gap-2">
                        <Link to={`/destination/${dest._id}`} className="px-3 py-1 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition">
                          View
                        </Link>
                        <button onClick={() => removeFavorite(dest._id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500 hover:text-white transition">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/tourist" className="text-center p-4 glass-effect rounded-xl hover:bg-white/10 transition">
                  <div className="text-3xl mb-2">🏔️</div>
                  <div className="text-white text-sm">Explore</div>
                </Link>
                <Link to="/wishlist" className="text-center p-4 glass-effect rounded-xl hover:bg-white/10 transition">
                  <div className="text-3xl mb-2">❤️</div>
                  <div className="text-white text-sm">Wishlist</div>
                </Link>
                <Link to="/translator" className="text-center p-4 glass-effect rounded-xl hover:bg-white/10 transition">
                  <div className="text-3xl mb-2">🗣️</div>
                  <div className="text-white text-sm">Translate</div>
                </Link>
                <Link to="/currency" className="text-center p-4 glass-effect rounded-xl hover:bg-white/10 transition">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-white text-sm">Currency</div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              {bookings.length === 0 && favorites.length === 0 ? (
                <p className="text-white/60 text-center py-8">No recent activity. Start your journey today!</p>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="flex items-center gap-3 p-3 glass-effect rounded-lg">
                      <div className="text-2xl">✈️</div>
                      <div className="flex-1">
                        <p className="text-white">Booked <span className="font-semibold">{booking.destination?.name}</span></p>
                        <p className="text-white/50 text-xs">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Travel Quote */}
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <p className="text-white/80 italic">"Ethiopia is not just a destination, it's a feeling. The land of origins awaits you."</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          position: relative;
        }
        .dashboard-navbar {
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
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          position: relative;
          z-index: 10;
        }
        .glass-effect-modern {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
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
        @media (max-width: 768px) {
          .dashboard-navbar {
            padding: 15px 20px;
            flex-direction: column;
            gap: 15px;
          }
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}