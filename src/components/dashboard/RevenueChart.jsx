import React from 'react';

const RevenueChart = () => {
  return (
    <div className="card chart-card">
      <div className="card-header">
        <div>
          <h4>Revenue overview</h4>
          <p>Daily revenue performance</p>
        </div>
        <button className="more-btn">...</button>
      </div>
      <div className="chart-placeholder">
        <p>[ Placeholder Grafik Garis akan diletakkan di sini ]</p>
      </div>
    </div>
  );
};

export default RevenueChart;