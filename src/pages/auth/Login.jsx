import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password.length < 6) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Email atau password salah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* Sisi Kiri - Full Poster Image */}
      <div className="login-left">
        <img
          src="/images/auth/poster.png"
          alt="Nexora Business Intelligence"
          className="login-poster"
        />
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="login-right">
        <div className="form-container">
          <h2>Welcome!</h2>
          <p className="subtitle">Enter your credential to continue</p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <img src="/images/auth/user.png" alt="User Icon" className="input-icon" />
              <input
                type="text"
                placeholder="Email / Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <img src="/images/auth/lock.png" alt="Lock Icon" className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setIsPasswordTouched(true)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                <img
                  src={showPassword ? '/images/auth/view.png' : '/images/auth/hide.png'}
                  alt="Toggle Password Visibility"
                  className="toggle-icon"
                />
              </button>
            </div>

            {isPasswordTouched && password.length < 6 && (
              <span className="error-message">Password harus minimal terdiri dari 6 karakter.</span>
            )}

            {errorMessage && <span className="error-message">{errorMessage}</span>}

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            <button type="button" className="btn-google">
              <img src="/images/auth/google.png" alt="Google Icon" className="google-icon-img" />
              Login with Google
            </button>
          </form>

          <p className="create-account">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;