import React from 'react';

const NexoraInsight = () => {
  return (
    <div className="card insight-card">
      <div className="card-header">
        <div>
          <h4>Nexora insight</h4>
          <p>Generated from your business data</p>
        </div>
        <button className="more-btn">...</button>
      </div>
      <div className="insight-content">
        <div className="sparkles-icon">✦</div>
        <p>Omzet meningkat 12,4% minggu ini. Kopi Latte memiliki margin tertinggi, sementara stok susu diperkirakan kritis dalam 1-2 hari.</p>
        <a href="#" className="view-analysis">View full analysis →</a>
      </div>
    </div>
  );
};

export default NexoraInsight;