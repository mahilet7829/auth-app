import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

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
      navigate('/welcome');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="signup-page">
      {/* Background */}
      <div className="signup-hero-bg">
        <div className="signup-overlay"></div>
      </div>

      <div className="signup-container">
        <div className="signup-card">
          
          {/* Custom Back Button - Navigates to Tourist Page */}
          <div className="back-button-wrapper">
            <button onClick={handleBack} className="custom-back-button">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M19 12H5M5 12L12 19M5 12L12 5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span>Back to Explore</span>
            </button>
          </div>

          <div className="signup-logo">
            <span className="logo-icon">🇪🇹</span>
            <span className="logo-text">Ethiopia Travel</span>
          </div>

          <div className="signup-header">
            <h1>Create Account</h1>
            <p>Join us to explore the wonders of Ethiopia</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="fullname"
                    placeholder=""
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <span className="input-icon">@</span>
                  <input
                    type="text"
                    name="username"
                    placeholder=""
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  name="email"
                  placeholder=""
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <div className="input-wrapper">
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

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
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
              className="submit-btn"
              disabled={isLoading || authLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .signup-page {
          min-height: 100vh;
          background: #0a1729;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        }

        .signup-hero-bg {
          position: absolute;
          inset: 0;
          background: url('https://i.pinimg.com/736x/5c/5e/1c/5c5e1c6c0f4c4c4c4c4c4c4c4c4c4c4c.jpg') center/cover no-repeat;
          filter: brightness(0.65);
          z-index: 1;
        }

        .signup-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10,23,41,0.8), rgba(10,23,41,0.95));
          z-index: 2;
        }

        .signup-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 520px;
          padding: 20px;
        }

        .signup-card {
          background: rgba(18, 23, 41, 0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(250, 204, 21, 0.3);
          border-radius: 28px;
          padding: 50px 40px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        }

        .back-button-wrapper {
          margin-bottom: 30px;
        }

        .custom-back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(250, 204, 21, 0.1);
          border: 1px solid rgba(250, 204, 21, 0.3);
          border-radius: 12px;
          padding: 10px 18px;
          color: #facc15;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .custom-back-button:hover {
          background: rgba(250, 204, 21, 0.2);
          border-color: rgba(250, 204, 21, 0.5);
          transform: translateX(-4px);
        }

        .custom-back-button svg {
          transition: transform 0.3s ease;
        }

        .custom-back-button:hover svg {
          transform: translateX(-2px);
        }

        .signup-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: center;
          margin-bottom: 35px;
        }

        .logo-icon { 
          font-size: 44px; 
        }
        
        .logo-text {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(90deg, #facc15, #eab308);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .signup-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .signup-header h1 {
          font-size: 32px;
          font-weight: 800;
          color: white;
          margin-bottom: 8px;
        }

        .signup-header p {
          color: #cbd5e1;
          font-size: 1.1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 0;
        }

        .form-group {
          margin-bottom: 26px;
        }

        .form-group label {
          display: block;
          color: #e2e8f0;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 22px;
          color: #94a3b8;
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          padding: 16px 20px 16px 54px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(250, 204, 21, 0.3);
          border-radius: 16px;
          color: white;
          font-size: 1.05rem;
          transition: all 0.3s ease;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #facc15;
          background: rgba(255,255,255,0.12);
        }

        .input-wrapper input::placeholder {
          color: #64748b;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(90deg, #facc15, #eab308);
          color: #120E0D;
          border: none;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(250, 204, 21, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-link {
          text-align: center;
          margin-top: 28px;
          color: #94a3b8;
        }

        .login-link a {
          color: #facc15;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .login-link a:hover {
          color: #eab308;
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .signup-card { 
            padding: 40px 24px; 
          }
          
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          
          .custom-back-button {
            padding: 8px 14px;
            font-size: 0.9rem;
          }
          
          .signup-header h1 {
            font-size: 28px;
          }
          
          .logo-text {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;