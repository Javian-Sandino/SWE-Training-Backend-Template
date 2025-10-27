// frontend/src/components/Auth.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      name: '',
      bio: ''
    }
  });

  const { login, register, loading, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.profile.name || formData.profile.bio ? formData.profile : null
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      profile: {
        name: '',
        bio: ''
      }
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Enter your username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="Confirm your password"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile.name">Full Name (optional):</label>
                <input
                  type="text"
                  id="profile.name"
                  name="profile.name"
                  value={formData.profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile.bio">Bio (optional):</label>
                <textarea
                  id="profile.bio"
                  name="profile.bio"
                  value={formData.profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  rows="3"
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={toggleMode}
              className="toggle-button"
              disabled={loading}
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;