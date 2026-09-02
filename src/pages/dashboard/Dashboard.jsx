import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

import StatCard from '../../components/dashboard/StatCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import NexoraInsight from '../../components/dashboard/NexoraInsight';
import TopProducts from '../../components/dashboard/TopProducts';
import InventoryAlert from '../../components/dashboard/InventoryAlert';

function formatRupiah(value) {
  return 'Rp ' + Number(value ?? 0).toLocaleString('id-ID');
}

const Dashboard = () => {
  const { businessId } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    async function loadDashboard() {
      try {
        const res = await api.get(`/businesses/${businessId}/dashboard`);
        setSummary(res);
      } catch (err) {
        setError(err.message || 'Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [businessId]);

  // Belum punya Business sama sekali (baru register, belum bikin bisnis)
  if (!loading && !businessId) {
    return (
      <DashboardLayout title="Dashboard" showSearch={false}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <h4>Kamu belum punya bisnis terdaftar</h4>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            Buat bisnis dulu untuk mulai mencatat transaksi dan melihat insight.
          </p>
          {/* Sesuaikan target link ini ke halaman "buat bisnis" kalau sudah ada */}
          <Link to="/products" className="btn-primary" style={{ display: 'inline-block' }}>
            Mulai Sekarang
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" showSearch={false}>
        <p>Memuat data...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard" showSearch={false}>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </DashboardLayout>
    );
  }

  const s = summary?.summary ?? {};

  return (
    <DashboardLayout>
      <div className="stats-grid">
        <StatCard
          title="Revenue"
          value={formatRupiah(s.total_omzet)}
        />
        <StatCard
          title="Net Profit"
          value={formatRupiah(s.laba_bersih)}
        />
        <StatCard
          title="Transactions"
          value={String(s.total_transaksi ?? 0)}
        />
        <StatCard
          title="Avg. per Transaction"
          value={formatRupiah(s.rata_rata_transaksi)}
        />
      </div>

      <div className="dashboard-grid">
        {/* RevenueChart, TopProducts, InventoryAlert masih perlu di-wire
            terpisah ke summary.best_seller / summary.critical_stock —
            ikuti pola yang sama seperti StatCard di atas: ambil dari
            `summary` yang sudah di-fetch, jangan pakai data dummy lagi. */}
        <RevenueChart />
        <NexoraInsight />
        <TopProducts data={summary?.best_seller} />
        <InventoryAlert data={summary?.critical_stock} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
