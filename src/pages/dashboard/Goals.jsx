import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const Goals = () => {
  // Tombol aksi untuk Topbar
  const newGoalBtn = (
    <button className="btn-add">
      + New goal
    </button>
  );

  return (
    <DashboardLayout
      title="Business goals"
      subtitle="Track progress toward your monthly targets."
      showSearch={false}
      actionButton={newGoalBtn}
      activeMenu="Goals" // Menyorot menu Goals di Sidebar
    >
      <div className="card transaction-card">
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <div>
            <h4 style={{ fontWeight: '700', color: '#1a1a24' }}>August revenue target</h4>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Monthly goal</p>
          </div>
          <button className="more-btn">...</button>
        </div>

        <div className="goal-content">
          <div className="goal-amount">
            <h2>Rp 36.000.000 <span className="goal-target">/ Rp 50.000.000</span></h2>
          </div>
          
          {/* Progress Bar Container */}
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '72%' }}></div>
          </div>
          
          {/* Label Progress */}
          <div className="progress-labels">
            <span>72% achieved</span>
            <span>Rp14.000.000 remaining</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Goals;