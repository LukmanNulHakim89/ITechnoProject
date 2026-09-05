import React from 'react';

function dotAndBadgeFor(status) {
  if (status === 'KRITIS') return { dot: 'critical', badgeClass: 'badge-critical', label: 'Critical' };
  if (status === 'PERLU PERHATIAN') return { dot: 'warning', badgeClass: 'badge-warning', label: 'Warning' };
  return { dot: 'good', badgeClass: 'badge-good', label: 'Good' };
}

const InventoryAlert = ({ data = [] }) => {
  return (
    <div className="card inventory-card">
      <div className="card-header">
        <div>
          <h4>Inventory alert</h4>
          <p>Stock health</p>
        </div>
        <button className="more-btn">...</button>
      </div>
      <ul className="alert-list">
        {data.length === 0 && (
          <li><p style={{ color: '#9ca3af', padding: '8px 0' }}>Semua stok dalam kondisi aman.</p></li>
        )}
        {data.map((item) => {
          const { dot, badgeClass, label } = dotAndBadgeFor(item.stock_status);
          return (
            <li key={item.product_id}>
              <div className="alert-info">
                <span className={`dot ${dot}`}></span>
                <div>
                  <h5>{item.name}</h5>
                  <p>{item.stock} units (min {item.minimum_stock})</p>
                </div>
              </div>
              <span className={badgeClass}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default InventoryAlert;
