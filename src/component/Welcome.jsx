import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="auth-container">
      <h1 className="welcome-title">Welcome, {user.fullName}!</h1>
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        You are successfully logged in.
      </p>

      <button
        onClick={() => {
          localStorage.removeItem('user');
          navigate('/login');
        }}
        style={{ marginTop: '2rem' }}
      >
        Log out
      </button>
    </div>
  );
}