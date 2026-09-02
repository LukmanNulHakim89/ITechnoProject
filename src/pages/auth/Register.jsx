import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Login.css';

const Register = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password.length < 6) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await register(fullname, email, password);
      // Belum tentu sudah punya Business setelah register — arahkan
      // ke dashboard, halaman itu sendiri yang menangani kondisi
      // "belum ada bisnis" (lihat catatan di Dashboard.jsx).
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Registrasi gagal, coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="/images/auth/poster.png"
          alt="Nexora Business Intelligence"
          className="login-poster"
        />
      </div>

      <div className="login-right">
        <div className="form-container">
          <h2>Create Account</h2>
          <p className="subtitle">Start managing your business with better insight</p>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <img src="/images/auth/user.png" alt="User Icon" className="input-icon" />
              <input
                type="text"
                placeholder="Fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <img src="/images/auth/email.png" alt="Email Icon" className="input-icon" />
              <input
                type="email"
                placeholder="Email"
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

            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <button type="button" className="btn-google">
              <img src="/images/auth/google.png" alt="Google Icon" className="google-icon-img" />
              Continue with Google
            </button>
          </form>

          <p className="create-account">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
