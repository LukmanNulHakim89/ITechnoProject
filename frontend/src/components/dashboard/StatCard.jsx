import React from 'react';

const StatCard = ({ title, value, trend, trendType, subtitle }) => {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <h3>{value}</h3>
      
      {/* Menampilkan trend (persentase) jika datanya diberikan */}
      {trend && (
        <span className={`trend ${trendType}`}>
          {trendType === 'up' ? '↗ ' : '↘ '}
          {trend}
        </span>
      )}
      
      {/* Menampilkan subtitle jika datanya diberikan */}
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
  );
};

export default StatCard;