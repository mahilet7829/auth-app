import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    location: '',
    birthdate: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    
    if (Object.values(form).some(value => !value.trim())) {
      setError('Please fill in all fields');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Save to localStorage (demo only – never do this in real apps!)
    localStorage.setItem('user', JSON.stringify(form));

    // Go to login page after successful signup
    navigate('/welcome');
  };

  return (
    <div className="auth-container">
      <h1>Sign Up</h1>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="birthdate"
          type="birthdate"
          placeholder="Birth date"
          value={form.birthdate}
          onChange={handleChange}
        />
        <input
          name="location"
          type="location"
          placeholder="location"
          value={form.location}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
<GoogleLogin
  onSuccess={(credentialResponse) => {
    const decoded = jwt_decode(credentialResponse.credential);
    console.log(decoded);

    localStorage.setItem("user", JSON.stringify(decoded));
  }}
/>
        <button type="submit">Create Account</button>
      </form>

      <div className="link" onClick={() => navigate('/login')}>
        Already have an account? Log in
      </div>
    </div>
  );
}