import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './LoginPage.module.css';

// It's a good practice to create an axios instance for your API
const api = axios.create({
  baseURL: 'http://localhost:8001/api', // Adjust if your backend port is different
});

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const response = await api.post('/token/', {
        email: email,
        password: password,
      });
      // Store tokens in localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Set authorization header for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Redirect to the dashboard
      navigate('/');

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginBox}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1200px-Salesforce.com_logo.svg.png" alt="Salesforce Logo" className={styles.logo} />
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.button}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
