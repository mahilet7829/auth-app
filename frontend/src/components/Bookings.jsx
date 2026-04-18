import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AnimatedGraphics from './AnimatedGraphics';

export default function Bookings() {
  const navigate = useNavigate();
  const { destinationId } = useParams();
  const { user, token } = useAuth();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfTravelers: 1,
    specialRequests: ''
  });

  // Fallback destinations data (in case API fails)
  const fallbackDestinations = [
    { id: 1, name: "Lalibela", location: "Lalibela", region: "Amhara", price: "5,000 - 8,000 ETB", priceLevel: "$$$", rating: 4.9, images: ["https://i.pinimg.com/736x/e6/c6/6d/e6c66dd3d26469e205da54776ef0259c.jpg"] },
    { id: 2, name: "Simien Mountains", location: "Simien Mountains", region: "Amhara", price: "3,500 - 6,000 ETB", priceLevel: "$$", rating: 4.8, images: ["https://i.pinimg.com/736x/65/97/de/6597debe2e191b470276cbe0171a9410.jpg"] },
    { id: 3, name: "Danakil Depression", location: "Danakil", region: "Afar", price: "8,000 - 12,000 ETB", priceLevel: "$$$", rating: 4.7, images: ["https://i.pinimg.com/736x/03/e3/ac/03e3acfe27a68e8f12f356bbeb9a9d8c.jpg"] },
    { id: 4, name: "Axum", location: "Axum", region: "Tigray", price: "2,500 - 4,500 ETB", priceLevel: "$$", rating: 4.6, images: ["https://i.pinimg.com/736x/d9/d7/32/d9d7320f916ea17d513369e885a91a1e.jpg"] },
    { id: 5, name: "Lake Tana", location: "Lake Tana", region: "Amhara", price: "2,000 - 3,500 ETB", priceLevel: "$$", rating: 4.5, images: ["https://i.pinimg.com/736x/94/8b/a9/948ba9cd2d293e7f84f2b8651a7008af.jpg"] },
    { id: 6, name: "Gondar", location: "Gondar", region: "Amhara", price: "2,000 - 4,000 ETB", priceLevel: "$$", rating: 4.7, images: ["https://i.pinimg.com/736x/b7/91/25/b79125130fdbaa410b279bd3a2b6966c.jpg"] },
    { id: 7, name: "Bale Mountains", location: "Bale Mountains", region: "Oromia", price: "3,000 - 5,500 ETB", priceLevel: "$$", rating: 4.8, images: ["https://i.pinimg.com/736x/ff/6f/18/ff6f18ec5e574131cb41eb26be9361d8.jpg"] },
    { id: 8, name: "Harar", location: "Harar", region: "Harari", price: "1,500 - 3,000 ETB", priceLevel: "$", rating: 4.6, images: ["https://i.pinimg.com/736x/18/d7/3c/18d73cdfdcb7f331f331932ddae12e29.jpg"] },
    { id: 9, name: "Omo Valley", location: "Omo Valley", region: "South Omo", price: "6,000 - 10,000 ETB", priceLevel: "$$$", rating: 4.9, images: ["https://i.pinimg.com/736x/15/20/5b/15205bbc67eee5a4eb3631dcdbec33fb.jpg"] },
    { id: 10, name: "Entoto Park", location: "Addis Ababa", region: "Addis Ababa", price: "200 - 500 ETB", priceLevel: "$", rating: 4.5, images: ["https://i.pinimg.com/736x/bf/16/21/bf162179d786e71a2da0d7a9b3447a09.jpg"] },
    { id: 11, name: "Unity Park", location: "Addis Ababa", region: "Addis Ababa", price: "500 - 1,000 ETB", priceLevel: "$$", rating: 4.7, images: ["https://i.pinimg.com/736x/46/5b/ab/465bab10ab8c1fed32420a6124fa071e.jpg"] },
    { id: 12, name: "Ethiopian National Museum", location: "Addis Ababa", region: "Addis Ababa", price: "100 - 200 ETB", priceLevel: "$", rating: 4.6, images: ["https://i.pinimg.com/736x/71/65/db/7165db09c010c19df6a6a425259e2d73.jpg"] }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (destinationId) {
      fetchDestination();
    }
  }, [destinationId, user]);

  const fetchDestination = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const response = await axios.get(`http://localhost:5000/api/destinations/${destinationId}`);
      if (response.data.success && response.data.data) {
        setDestination(response.data.data);
      } else {
        // Fallback to local data
        const found = fallbackDestinations.find(d => d.id == destinationId || d._id == destinationId);
        if (found) {
          setDestination(found);
        } else {
          toast.error('Destination not found');
          navigate('/tourist');
        }
      }
    } catch (error) {
      console.error('Error fetching destination:', error);
      // Fallback to local data
      const found = fallbackDestinations.find(d => d.id == destinationId || d._id == destinationId);
      if (found) {
        setDestination(found);
        toast.success('Using demo data for presentation');
      } else {
        toast.error('Failed to load destination');
        navigate('/tourist');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!destination || !bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    
    // Extract numeric price from string like "5,000 - 8,000 ETB"
    let pricePerNight = 2000; // default
    if (destination.price) {
      const priceMatch = destination.price.match(/(\d+)/);
      if (priceMatch) {
        pricePerNight = parseInt(priceMatch[1]);
      }
    }
    
    return pricePerNight * bookingData.numberOfTravelers * nights;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      toast.error('Check-in date cannot be in the past');
      return;
    }
    
    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const totalPrice = calculateTotalPrice();
      const bookingPayload = {
        destinationId: destination._id || destination.id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfTravelers: bookingData.numberOfTravelers,
        specialRequests: bookingData.specialRequests,
        totalPrice: totalPrice
      };
      
      const response = await axios.post('http://localhost:5000/api/bookings', bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Booking confirmed successfully!');
        
        // Save to localStorage as backup
        const myBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
        myBookings.push({
          id: Date.now(),
          destination: destination,
          ...bookingPayload,
          bookingDate: new Date().toISOString(),
          status: 'confirmed'
        });
        localStorage.setItem('myBookings', JSON.stringify(myBookings));
        
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Booking error:', error);
      
      // Fallback: Save to localStorage if backend fails
      const totalPrice = calculateTotalPrice();
      const myBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      myBookings.push({
        id: Date.now(),
        destination: destination,
        destinationId: destination._id || destination.id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfTravelers: bookingData.numberOfTravelers,
        specialRequests: bookingData.specialRequests,
        totalPrice: totalPrice,
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
      });
      localStorage.setItem('myBookings', JSON.stringify(myBookings));
      
      toast.success('Booking saved locally! (Demo mode)');
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <AnimatedGraphics />
        <div className="loading-container">
          <div className="text-white text-xl">Loading destination...</div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="bookings-page">
        <AnimatedGraphics />
        <div className="error-container">
          <div className="text-white text-xl">Destination not found</div>
          <Link to="/tourist" className="back-link">Back to Destinations</Link>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const destinationImage = destination.images?.[0] || 
                          destination.imageUrl || 
                          "https://images.unsplash.com/photo-1544829648-ff0419b3ce0d?w=400&h=300&fit=crop";

  return (
    <div className="bookings-page">
      <AnimatedGraphics />
      
      <nav className="bookings-navbar">
        <div className="nav-brand">
          <span className="brand-icon">✈️</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/tourist" className="nav-link">Destinations</Link>
          <Link to="/wishlist" className="nav-link">Wishlist</Link>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="bookings-container">
        <div className="booking-header">
          <h1>Book Your Adventure</h1>
          <p>Complete the form below to secure your spot</p>
        </div>

        <div className="booking-content">
          {/* Destination Summary */}
          <div className="destination-summary">
            <img src={destinationImage} alt={destination.name} />
            <div className="summary-info">
              <h2>{destination.name}</h2>
              <p className="location">📍 {destination.location || destination.region}</p>
              <p className="price">💰 {destination.price || "Contact for price"}</p>
              <p className="rating">⭐ {destination.rating || 4.5} / 5.0</p>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label>Check-in Date</label>
              <input
                type="date"
                value={bookingData.checkInDate}
                onChange={(e) => setBookingData({...bookingData, checkInDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>Check-out Date</label>
              <input
                type="date"
                value={bookingData.checkOutDate}
                onChange={(e) => setBookingData({...bookingData, checkOutDate: e.target.value})}
                min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>Number of Travelers</label>
              <input
                type="number"
                min="1"
                max="20"
                value={bookingData.numberOfTravelers}
                onChange={(e) => setBookingData({...bookingData, numberOfTravelers: parseInt(e.target.value)})}
                required
              />
              <small>Max 20 travelers per booking</small>
            </div>

            <div className="form-group">
              <label>Special Requests (Optional)</label>
              <textarea
                rows="3"
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                placeholder="Any special requirements or requests? (e.g., dietary restrictions, accessibility needs)"
              />
            </div>

            <div className="price-summary">
              <h3>Booking Summary</h3>
              <div className="price-details">
                <div className="price-row">
                  <span>Destination:</span>
                  <span>{destination.name}</span>
                </div>
                <div className="price-row">
                  <span>Number of travelers:</span>
                  <span>{bookingData.numberOfTravelers}</span>
                </div>
                <div className="price-row">
                  <span>Total:</span>
                  <span className="total-price">{totalPrice.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="book-now-btn">
              {submitting ? 'Processing...' : 'Confirm Booking ✈️'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .bookings-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          position: relative;
        }
        
        .bookings-navbar {
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
        
        .bookings-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          position: relative;
          z-index: 10;
        }
        
        .booking-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .booking-header h1 {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #a8b2ff, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }
        
        .booking-header p {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .booking-content {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 30px;
        }
        
        .destination-summary {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: fit-content;
        }
        
        .destination-summary img {
          width: 100%;
          height: 250px;
          object-fit: cover;
        }
        
        .summary-info {
          padding: 20px;
        }
        
        .summary-info h2 {
          font-size: 24px;
          color: white;
          margin-bottom: 10px;
        }
        
        .summary-info .location,
        .summary-info .price,
        .summary-info .rating {
          color: rgba(255, 255, 255, 0.7);
          margin: 8px 0;
        }
        
        .booking-form {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 16px;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .form-group small {
          display: block;
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          margin-top: 5px;
        }
        
        .price-summary {
          background: rgba(102, 126, 234, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .price-summary h3 {
          color: white;
          margin-bottom: 15px;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.8);
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .total-price {
          font-size: 20px;
          font-weight: bold;
          color: #4caf50;
        }
        
        .book-now-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .book-now-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        
        .book-now-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          gap: 20px;
        }
        
        .back-link {
          color: #667eea;
          text-decoration: none;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        @media (max-width: 768px) {
          .bookings-navbar {
            flex-direction: column;
            padding: 15px 20px;
          }
          
          .nav-links {
            justify-content: center;
          }
          
          .booking-content {
            grid-template-columns: 1fr;
          }
          
          .booking-header h1 {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}