import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(''); // username or email or phone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem('user'));

    if (!savedUser) {
      setError('No account found. Please sign up first.');
      return;
    }

    const match =
      (identifier === savedUser.username ||
       identifier === savedUser.email ||
       identifier === savedUser.phone) &&
      password === savedUser.password;

    if (match) {
      // In real app → set auth token / context / redux / zustand etc.
      navigate('/welcome');
    } else {
      setError('Incorrect credentials');
    }
  };

  return (
    <div className="auth-container">
      <h1>Log In</h1>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username / Email / Phone"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Log In</button>
      </form>

      <div className="link" onClick={() => navigate('/signup')}>
        Don't have an account? Sign up
      </div>
    </div>
  );
}