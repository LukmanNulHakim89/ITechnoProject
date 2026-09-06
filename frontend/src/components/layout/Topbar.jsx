import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Mengimpor AuthContext

const Topbar = ({
  title,
  subtitle,
  showSearch = true,
  actionButton
}) => {
  // Mengambil data user dari context (pastikan backend mengirimkan field 'name')
  const { user } = useAuth();

  // Mendapatkan hari saat ini secara otomatis (misal: "Monday", "Tuesday")
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Fallback teks dinamis jika halaman tidak mengirimkan props title/subtitle spesifik
  const displayTitle = title || `Good Day, ${user?.name || 'User'}`;
  const displaySubtitle = subtitle || `Have a Nice ${currentDay}!`;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>{displayTitle}</h2>
        <p>{displaySubtitle}</p>
      </div>
      <div className="topbar-right">

        <Link to="/notifications" className="notification-btn">
          <img src="/images/dashboard/notification.png" alt="Notifications" />
          <span className="badge"></span>
        </Link>

        {showSearch && (
          <div className="search-bar">
            <img src="/images/dashboard/search.png" alt="Search" className="search-icon" />
            <input type="text" placeholder="Search something..." />
          </div>
        )}

        {actionButton && actionButton}
      </div>
    </header>
  );
};

export default Topbar;