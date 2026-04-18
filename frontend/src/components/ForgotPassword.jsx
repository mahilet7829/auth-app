import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import BackButton from "./BackButton";
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('If that email exists, we\'ve sent a reset link. Check your inbox!');
        setEmail('');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password?</h1>
          <p>Enter your email to receive a reset link</p>
        </div>
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
  <BackButton fallbackPath="/login" />
</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message submit-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="auth-footer">
            Remember your password? <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}