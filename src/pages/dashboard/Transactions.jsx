import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const Transactions = () => {
  const { businessId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    if (!businessId) return;
    setLoading(true);
    try {
      const txRes = await api.get(`/businesses/${businessId}/transactions`);
      setTransactions(txRes.data ?? []);
    } catch (err) {
      setError(err.message || 'Gagal memuat transaksi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  return (
    <DashboardLayout
      title="Transactions"
      subtitle="Record and manage your business transactions."
      showSearch={false}
      activeMenu="Transactions"
    >
      <div className="card transaction-card">
        <div className="card-header">
          <div>
            <h4 style={{ fontWeight: '700', color: '#1a1a24' }}>Today</h4>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>{transactions.length} recent transactions</p>
          </div>
          <button className="more-btn">...</button>
        </div>

        {error && <p style={{ color: '#dc2626', padding: '0 16px' }}>{error}</p>}
        {loading ? (
          <p style={{ padding: 16 }}>Memuat transaksi...</p>
        ) : (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>PRODUCT</th>
                <th>QTY</th>
                <th>TOTAL</th>
                <th>PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 16 }}>Belum ada transaksi.</td></tr>
              )}
              {transactions.map((trx) => (
                <tr key={trx.id}>
                  <td style={{ color: '#64748b' }}>
                    {new Date(trx.transaction_date).toLocaleString('id-ID', {
                      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
                    })}
                  </td>
                  <td className="product-name">
                    {trx.items.map((it) => it.product_name).join(', ') || '-'}
                  </td>
                  <td style={{ color: '#64748b' }}>
                    {trx.items.reduce((sum, it) => sum + it.quantity, 0)}
                  </td>
                  <td style={{ color: '#64748b' }}>
                    Rp {Number(trx.total_amount).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span className="pay-badge">{trx.payment_method ?? 'Cash'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;

