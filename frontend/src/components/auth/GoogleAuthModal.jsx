import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleAuthModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [googleEmail, setGoogleEmail] = useState('indrawjya31@gmail.com');
  const [googleName, setGoogleName] = useState('Indra Wijaya');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async (emailToUse, nameToUse) => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle({
        email: emailToUse || googleEmail,
        name: nameToUse || googleName,
        google_id: 'google_' + Math.random().toString(36).substring(2, 12),
      });
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Gagal login menggunakan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '440px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          ✕
        </button>

        {/* Header Google */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/images/auth/google.png"
            alt="Google"
            style={{ width: '42px', height: '42px', marginBottom: '12px' }}
          />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#1e293b', fontWeight: '700' }}>
            Masuk dengan Google
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Pilih akun Google Anda untuk melanjutkan ke Nexora
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {/* Akun Google Default / Utama */}
        <div
          onClick={() => !loading && handleSignIn('indrawjya31@gmail.com', 'Indra Wijaya')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
            transition: 'all 0.2s',
            backgroundColor: '#f8fafc',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '16px',
          }}>
            I
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Indra Wijaya</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>indrawjya31@gmail.com</div>
          </div>
          <span style={{ fontSize: '18px', color: '#94a3b8' }}>›</span>
        </div>

        {/* Akun Demo / Tester */}
        <div
          onClick={() => !loading && handleSignIn('demo.google@nexora.id', 'Google Demo User')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s',
            backgroundColor: '#f8fafc',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '16px',
          }}>
            G
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Google Demo User</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>demo.google@nexora.id</div>
          </div>
          <span style={{ fontSize: '18px', color: '#94a3b8' }}>›</span>
        </div>

        {/* Toggle Masukkan Akun Lain */}
        {!isCustom ? (
          <button
            type="button"
            onClick={() => setIsCustom(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              textAlign: 'center',
              padding: '8px',
            }}
          >
            + Gunakan Akun Google Lain
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn(googleEmail, googleName);
            }}
            style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}
          >
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder="Nama Anda"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                Alamat Email Google
              </label>
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="email@gmail.com"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsCustom(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Menghubungkan...' : 'Lanjutkan Login'}
              </button>
            </div>
          </form>
        )}

        <p style={{ margin: '20px 0 0 0', fontSize: '11px', color: '#94a3b8', textAlign: 'center', lineHeight: 1.4 }}>
          Dengan melanjutkan, akun Anda akan otomatis terhubung ke sistem otentikasi Nexora API.
        </p>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
