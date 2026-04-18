import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import AnimatedGraphics from './AnimatedGraphics';

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
      console.log("Login successful, navigating to /welcome");
      navigate('/welcome');
    }
  };

  return (
    <div className="auth-page-modern">
      <AnimatedGraphics />
      
      <div className="auth-container-modern">
        <div className="auth-card-modern">
          <div className="auth-logo">
            <span className="auth-logo-icon">🇪🇹</span>
            <span className="auth-logo-text">Ethiopia Travel Guide</span>
          </div>
          
          <div className="auth-header-modern">
            <h1>Welcome Back</h1>
            <p>Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group-modern">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
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

            <div className="input-group-modern">
              <label>Password</label>
              <div className="input-icon-wrapper">
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

            <div className="forgot-password-modern">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={isLoading || authLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="auth-footer-modern">
              Don't have an account? <Link to="/signup">Create account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;