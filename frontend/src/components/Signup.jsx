import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import AnimatedGraphics from './AnimatedGraphics';

function Signup() {
  const navigate = useNavigate();
  const { register, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    location: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { fullname, username, email, location, password } = formData;
    
    if (!fullname || !username || !email || !location || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    const success = await register(formData);
    
    setIsLoading(false);
    
    if (success) {
      console.log("Registration successful, navigating to /welcome");
      navigate('/welcome');
    }
  };

  return (
    <div className="auth-page-modern">
      <AnimatedGraphics />
      
      <div className="auth-container-modern">
        <div className="auth-card-modern auth-card-wide">
          <div className="auth-logo">
            <span className="auth-logo-icon">🇪🇹</span>
            <span className="auth-logo-text">Ethiopia Travel Guide</span>
          </div>
          
          <div className="auth-header-modern">
            <h1>Create Account</h1>
            <p>Join us to explore the wonders of Ethiopia</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-group-modern">
                <label>Full Name</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="fullname"
                    placeholder="John Doe"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group-modern">
                <label>Username</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">@</span>
                  <input
                    type="text"
                    name="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group-modern">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  name="email"
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group-modern">
              <label>Location</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">📍</span>
                <input
                  type="text"
                  name="location"
                  placeholder="Addis Ababa, Ethiopia"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group-modern">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={isLoading || authLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="auth-footer-modern">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 0;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;