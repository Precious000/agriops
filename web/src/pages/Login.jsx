import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>🌾 AgriOps</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" style={{ width: '100%' }}>Log In</button>
        </form>
      </div>
    </div>
  );
}
