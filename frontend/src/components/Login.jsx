import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    const success = await login(email, password);
    
    setIsLoading(false);
    
    if (success) {
      navigate('/'); // Go to Tourist Page (Home)
    }
  };

  // Custom back button that navigates to home
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-hero-bg">
        <div className="login-overlay"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          
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

          <div className="login-logo">
            <span className="logo-icon">🇪🇹</span>
            <span className="logo-text">Ethiopia Travel</span>
          </div>

          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="forgot-link">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading || authLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Create one</Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: #0a1729;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        }

        .login-hero-bg {
          position: absolute;
          inset: 0;
          background: url('https://i.pinimg.com/736x/78/6e/9d/786e9d7d60aae752b95af9ba4a80f955.jpg') center/cover no-repeat;
          filter: brightness(0.65);
          z-index: 1;
        }

        .login-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10,23,41,0.8), rgba(10,23,41,0.95));
          z-index: 2;
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 460px;
          padding: 20px;
        }

        .login-card {
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

        .login-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: center;
          margin-bottom: 35px;
        }

        .logo-icon { font-size: 44px; }
        .logo-text {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(90deg, #facc15, #eab308);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-header h1 {
          font-size: 32px;
          font-weight: 800;
          color: white;
          margin-bottom: 8px;
        }

        .login-header p {
          color: #cbd5e1;
          font-size: 1.1rem;
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
        }

        .input-wrapper input {
          width: 100%;
          padding: 16px 20px 16px 54px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(250, 204, 21, 0.3);
          border-radius: 16px;
          color: white;
          font-size: 1.05rem;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #facc15;
        }

        .forgot-link {
          text-align: right;
          margin-bottom: 30px;
        }

        .forgot-link a {
          color: #facc15;
          text-decoration: none;
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
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(250, 204, 21, 0.4);
        }

        .signup-link {
          text-align: center;
          margin-top: 28px;
          color: #94a3b8;
        }

        .signup-link a {
          color: #facc15;
          font-weight: 600;
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .login-card { padding: 40px 24px; }
          .custom-back-button {
            padding: 8px 14px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;