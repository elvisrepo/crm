import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

import styles from './LoginPage.module.css';

// It's a good practice to create an axios instance for your API


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err?.response?.status === 401) setError('Invalid email or password.');
      else setError('An unexpected error occurred. Please try again.');
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
