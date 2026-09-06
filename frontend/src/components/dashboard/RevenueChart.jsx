import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const RevenueChart = () => {
  const { businessId } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      if (!businessId) return;

      try {
        setLoading(true);
        let chartData = [];

        try {
          // Mencoba memanggil endpoint khusus revenue
          const response = await api.get(`/businesses/${businessId}/revenue`);
          if (response?.data && Array.isArray(response.data)) {
            chartData = response.data;
          }
        } catch {
          // Fallback: Jika endpoint /revenue belum ada, hitung otomatis dari data transaksi
          try {
            const txRes = await api.get(`/businesses/${businessId}/transactions`);
            const txList = Array.isArray(txRes) ? txRes : (txRes?.data ?? []);

            if (txList.length > 0) {
              const daysMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

              // Tentukan batas waktu 7 hari yang lalu agar tidak menjumlahkan transaksi bulan/tahun lalu
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

              txList.forEach((tx) => {
                const d = new Date(tx.transaction_date);
                // Hanya agregasi transaksi yang terjadi dalam 7 hari terakhir
                if (d >= sevenDaysAgo) {
                  const dayName = dayNames[d.getDay()];
                  if (daysMap[dayName] !== undefined) {
                    daysMap[dayName] += Number(tx.total_amount || 0);
                  }
                }
              });

              chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
                day,
                revenue: daysMap[day] || 0,
              }));
            }
          } catch (e) {
            console.warn('Could not load transactions for chart:', e);
          }
        }

        // UX Check: Jika data kosong atau tidak ada transaksi, tampilkan grafik flat (0)
        // daripada menampilkan dummy data jutaan rupiah palsu.
        if (!chartData || chartData.length === 0) {
          chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
            day,
            revenue: 0,
          }));
        }

        setData(chartData);
      } catch (error) {
        console.error("Gagal memuat data grafik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [businessId]);

  // Format label sumbu Y menjadi format singkat, misal: Rp2.5jt
  const formatYAxis = (tickItem) => {
    return `Rp${(tickItem / 1000000).toFixed(1)}jt`;
  };

  return (
    <div className="card chart-card" style={{ paddingBottom: '24px' }}>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h4 style={{ fontWeight: '700', color: '#1a1a24', margin: '0 0 4px 0' }}>Revenue overview</h4>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Daily revenue performance</p>
        </div>
        <button className="more-btn">...</button>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '100px' }}>Memuat grafik...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4b6bfb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4b6bfb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={formatYAxis} />
              <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#4b6bfb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: '#4b6bfb', stroke: '#white', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;