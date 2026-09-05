import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import '../styles/dashboard.css'; 

const DashboardLayout = ({ 
  children, 
  title, 
  subtitle, 
  showSearch, 
  actionButton, 
  activeMenu 
}) => {
  return (
    <div className="dashboard-layout">
      <Sidebar activeMenu={activeMenu} />
      <div className="main-content">
        <Topbar 
          title={title} 
          subtitle={subtitle} 
          showSearch={showSearch} 
          actionButton={actionButton} 
        />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;