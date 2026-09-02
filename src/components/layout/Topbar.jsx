import React from 'react';
import { Link } from 'react-router-dom'; // Tambahkan baris ini

const Topbar = ({ 
  title = "Good Day, Aramugam", 
  subtitle = "Have a Nice Monday!", 
  showSearch = true, 
  actionButton 
}) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-right">
        
        {/* Ubah <button> menjadi <Link to="/notifications"> */}
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