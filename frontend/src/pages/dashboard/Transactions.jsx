import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const Transactions = () => {
  const { businessId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- 1. STATE BARU UNTUK FITUR ADD TRANSACTION ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    quantity: '',
    total_amount: '',
    payment_method: 'QRIS'
  });

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

  // --- 2. FUNGSI HANDLE SUBMIT TRANSAKSI KE BACKEND ---
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Struktur payload (sesuaikan dengan format body yang diterima backend Anda)
      const payload = {
        total_amount: Number(formData.total_amount),
        payment_method: formData.payment_method,
        items: [
          {
            product_name: formData.product_name,
            quantity: Number(formData.quantity)
          }
        ]
      };

      // POST request ke backend
      await api.post(`/businesses/${businessId}/transactions`, payload);

      // Reset form dan tutup modal setelah sukses
      setFormData({ product_name: '', quantity: '', total_amount: '', payment_method: 'QRIS' });
      setIsModalOpen(false);

      // Refresh tabel data transaksi
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal menambahkan transaksi baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. TOMBOL AKSI UNTUK MEMBUKA MODAL ---
  const addTransactionBtn = (
    <button className="btn-add" onClick={() => setIsModalOpen(true)}>
      + Add transaction
    </button>
  );

  return (
    <DashboardLayout
      title="Transactions"
      subtitle="Record and manage your business transactions."
      showSearch={false}
      activeMenu="Transactions"
      actionButton={addTransactionBtn} // <-- Menyisipkan tombol ke layout
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

      {/* --- 4. KOMPONEN MODAL ADD TRANSACTION --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>Add New Transaction</h3>
            <form onSubmit={handleAddTransaction}>
              
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kopi Susu"
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="e.g. 2"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Total Price (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="e.g. 40000"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select 
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                >
                  <option value="QRIS">QRIS</option>
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Transactions;
