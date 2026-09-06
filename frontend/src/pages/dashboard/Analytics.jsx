import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import RevenueChart from '../../components/dashboard/RevenueChart';

const Analytics = () => {
  const { businessId } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!businessId) return;
    api.get(`/businesses/${businessId}/products`)
      .then((res) => setProducts(res.data ?? []))
      .catch(() => { });
  }, [businessId]);

  // Margin dalam persen: (selling_price - cost_price) / selling_price * 100
  const marginData = products
    .filter((p) => Number(p.selling_price) > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      value: Math.round((p.margin / p.selling_price) * 100),
    }));

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Turn operational data into business insight."
      showSearch={false}
      activeMenu="Analytics"
    >
      {/* Menggunakan flexbox untuk membagi porsi layar menjadi 2:1 */}
      <div className="dashboard-grid" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* 1. BAGIAN KIRI: REVENUE CHART (Porsi lebih lebar) */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <RevenueChart />
        </div>

        {/* 2. BAGIAN KANAN: PRODUCT MARGINS (Dipertahankan dari kode asli) */}
        <div className="card chart-card" style={{ flex: 1, minWidth: 0 }}>
          <div className="card-header">
            <div>
              <h4 style={{ fontWeight: '700', color: '#1a1a24' }}>Product margins</h4>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Compare profitability</p>
            </div>
            <button className="more-btn">...</button>
          </div>

          <div style={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '30px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: '100%',
              borderBottom: '1px solid #e2e8f0',
              borderLeft: '1px solid #e2e8f0',
              paddingLeft: '16px',
              paddingRight: '16px'
            }}>
              {marginData.length === 0 && (
                <p style={{ color: '#9ca3af', alignSelf: 'center' }}>Belum ada produk.</p>
              )}
              {marginData.map((item) => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48px', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                  <div
                    style={{
                      height: `${Math.max(item.value, 2)}%`,
                      width: '100%',
                      backgroundColor: '#4b6bfb',
                      borderRadius: '4px 4px 0 0'
                    }}
                    title={`${item.value}%`}
                  ></div>
                  <span style={{
                    fontSize: '10px',
                    color: '#64748b',
                    position: 'absolute',
                    bottom: '-24px',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Analytics;