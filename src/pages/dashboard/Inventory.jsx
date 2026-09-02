import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

function dotAndBadgeFor(status) {
  if (status === 'KRITIS') return { dot: 'critical', badge: 'critical', label: 'Critical' };
  if (status === 'PERLU PERHATIAN') return { dot: 'warning', badge: 'warning', label: 'Warning' };
  return { dot: 'good', badge: 'good', label: 'Good' };
}

const Inventory = () => {
  const { businessId } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!businessId) return;
    api.get(`/businesses/${businessId}/products`)
      .then((res) => setProducts(res.data ?? []))
      .catch((err) => setError(err.message || 'Gagal memuat data stok.'))
      .finally(() => setLoading(false));
  }, [businessId]);

  const addStockBtn = (
    <button className="btn-add" title="Backend belum punya endpoint untuk mencatat stock movement manual">
      + Stock movement
    </button>
  );

  return (
    <DashboardLayout
      title="Inventory"
      subtitle="Monitor stock health and prevent stockouts."
      showSearch={false}
      actionButton={addStockBtn}
      activeMenu="Inventory"
    >
      <div className="card transaction-card">
        <div className="card-header">
          <div>
            <h4 style={{ fontWeight: '700', color: '#1a1a24' }}>Stock health</h4>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Berdasarkan stok saat ini</p>
          </div>
          <button className="more-btn">...</button>
        </div>

        {error && <p style={{ color: '#dc2626', padding: '0 16px' }}>{error}</p>}
        {loading ? (
          <p style={{ padding: 16 }}>Memuat data...</p>
        ) : (
          <ul className="alert-list" style={{ marginTop: '16px' }}>
            {products.length === 0 && (
              <li style={{ color: '#9ca3af', padding: '16px 0' }}>Belum ada produk.</li>
            )}
            {products.map((item) => {
              const { dot, badge, label } = dotAndBadgeFor(item.stock_status);
              return (
                <li key={item.id} style={{ padding: '16px 0' }}>
                  <div className="alert-info">
                    <span className={`dot ${dot}`}></span>
                    <div>
                      <h5>{item.name}</h5>
                      {/* Estimasi "hari tersisa" butuh data rata-rata pemakaian
                          harian yang belum dihitung backend — untuk sekarang
                          tampilkan jumlah stok & minimum saja. */}
                      <p>{item.stock} units (minimum {item.minimum_stock})</p>
                    </div>
                  </div>
                  <span className={`badge-${badge}`}>{label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
