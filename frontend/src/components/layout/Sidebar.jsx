import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeMenu = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/images/logo/logo.png" alt="Nexora Logo" className="brand-logo" />
      </div>

      <div className="sidebar-menu">
        <p className="menu-label">WORKSPACE</p>

        <Link to="/dashboard" className={`menu-item ${activeMenu === 'Dashboard' ? 'active' : ''}`}>
          <img src="/images/dashboard/Dashboard.png" alt="Dashboard" />
          <span>Dashboard</span>
        </Link>
        <Link to="/transactions" className={`menu-item ${activeMenu === 'Transactions' ? 'active' : ''}`}>
          <img src="/images/dashboard/Transactions.png" alt="Transactions" />
          <span>Transactions</span>
        </Link>
        <Link to="/products" className={`menu-item ${activeMenu === 'Products' ? 'active' : ''}`}>
          <img src="/images/dashboard/Products.png" alt="Products" />
          <span>Products</span>
        </Link>
        <Link to="/inventory" className={`menu-item ${activeMenu === 'Inventory' ? 'active' : ''}`}>
          <img src="/images/dashboard/inventory.png" alt="Inventory" />
          <span>Inventory</span>
        </Link>
        <Link to="/analytics" className={`menu-item ${activeMenu === 'Analytics' ? 'active' : ''}`}>
          <img src="/images/dashboard/Analytics.png" alt="Analytics" />
          <span>Analytics</span>
        </Link>
        <Link to="/ai-advisor" className={`menu-item ${activeMenu === 'AiAdvisor' ? 'active' : ''}`}>
          <img src="/images/dashboard/AiAdvisor.png" alt="AI Advisor" />
          <span>AI Advisor</span>
        </Link>
        <Link to="/goals" className={`menu-item ${activeMenu === 'Goals' ? 'active' : ''}`}>
          <img src="/images/dashboard/Goals.png" alt="Goals" />
          <span>Goals</span>
        </Link>
        <Link to="/reports" className={`menu-item ${activeMenu === 'Reports' ? 'active' : ''}`}>
          <img src="/images/dashboard/Reports.png" alt="Reports" />
          <span>Reports</span>
        </Link>

        {/* Update Link ke /settings dan tambahkan logic activeMenu */}
        <Link to="/settings" className={`menu-item ${activeMenu === 'Settings' ? 'active' : ''}`}>
          <img src="/images/dashboard/setting.png" alt="Settings" />
          <span>Settings</span>
        </Link>

        {/* Atribut style="..." dihapus agar class "menu-item" dan "btn-logout" bisa menerapkan efek hover dari CSS */}
        <button
          type="button"
          onClick={handleLogout}
          className="menu-item btn-logout"
        >
          <img src="/images/dashboard/logout.png" alt="Logout" />
          <span>Logout</span>
        </button>
      </div>

      <div className="sidebar-bottom">
        <div className="user-profile">
          <img src="/images/dashboard/profile.png" alt="Profile" className="avatar" />
          <div className="user-info">
            <h4>{user?.name || 'Aramugam'}</h4>
            <p>{user?.email || 'Kedai Kopi Nexora'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;