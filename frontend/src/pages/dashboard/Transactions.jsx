import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const Transactions = () => {
  const { businessId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk modal Add Transaction
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  
  const [formData, setFormData] = useState({
    product_mode: 'select', // 'select' atau 'custom'
    product_id: '',
    custom_name: '',
    custom_price: '',
    quantity: 1,
    payment_method: 'Cash',
  });

  async function loadData() {
    if (!businessId) return;
    setLoading(true);
    setError('');
    try {
      const [txRes, prodRes] = await Promise.all([
        api.get(`/businesses/${businessId}/transactions`),
        api.get(`/businesses/${businessId}/products`),
      ]);

      const txList = Array.isArray(txRes) ? txRes : (txRes?.data ?? []);
      const prodList = Array.isArray(prodRes) ? prodRes : (prodRes?.data ?? []);

      setTransactions(txList);
      setProducts(prodList);
      
      // Default product_id jika ada produk
      if (prodList.length > 0 && !formData.product_id) {
        setFormData((prev) => ({
          ...prev,
          product_id: String(prodList[0].id),
        }));
      } else if (prodList.length === 0) {
        setFormData((prev) => ({
          ...prev,
          product_mode: 'custom',
        }));
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data transaksi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const isCustom = formData.product_mode === 'custom' || products.length === 0;
  const selectedProduct = !isCustom ? products.find((p) => String(p.id) === String(formData.product_id)) : null;

  const unitPrice = isCustom 
    ? Number(formData.custom_price || 0) 
    : Number(selectedProduct?.selling_price || 0);

  const estimatedTotal = unitPrice * Number(formData.quantity || 1);

  // Handle submit transaksi ke backend
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setModalError('');

    if (isCustom && !formData.custom_name.trim()) {
      setModalError('Silakan masukkan nama produk.');
      return;
    }

    if (!isCustom && !formData.product_id) {
      setModalError('Silakan pilih produk terlebih dahulu.');
      return;
    }

    if (Number(formData.quantity) < 1) {
      setModalError('Jumlah minimal transaksi adalah 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        payment_method: formData.payment_method,
        total_amount: estimatedTotal,
        items: [
          {
            ...(isCustom
              ? { product_name: formData.custom_name.trim(), selling_price: unitPrice }
              : { product_id: Number(formData.product_id) }
            ),
            quantity: Number(formData.quantity),
          },
        ],
      };

      await api.post(`/businesses/${businessId}/transactions`, payload);

      setFormData({
        product_mode: products.length > 0 ? 'select' : 'custom',
        product_id: products.length > 0 ? String(products[0].id) : '',
        custom_name: '',
        custom_price: '',
        quantity: 1,
        payment_method: 'Cash',
      });
      setIsModalOpen(false);
      await loadData();
      alert('Transaksi berhasil dicatat!');
    } catch (err) {
      setModalError(err.message || 'Gagal mencatat transaksi baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTransactionBtn = (
    <button 
      className="btn-add" 
      onClick={() => {
        setModalError('');
        if (products.length === 0) {
          setFormData((prev) => ({ ...prev, product_mode: 'custom' }));
        }
        setIsModalOpen(true);
      }}
    >
      + Add transaction
    </button>
  );

  return (
    <DashboardLayout
      title="Transactions"
      subtitle="Record and manage your business transactions."
      showSearch={false}
      activeMenu="Transactions"
      actionButton={addTransactionBtn}
    >
      <div className="card transaction-card">
        <div className="card-header">
          <h4 style={{ fontWeight: '700', color: '#1a1a24' }}>Recent transactions</h4>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Total: {transactions.length} transaksi
          </span>
        </div>

        {loading ? (
          <p className="loading-state">Memuat transaksi...</p>
        ) : error ? (
          <p className="error-state">{error}</p>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '16px' }}>
              Belum ada transaksi tercatat.
            </p>
            <button 
              className="btn-add" 
              style={{ display: 'inline-block' }} 
              onClick={() => setIsModalOpen(true)}
            >
              + Catat Transaksi Pertama
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Products</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: '500', color: '#1e293b' }}>
                    {tx.customer_name ?? tx.customer?.name ?? 'Walk-in Customer'}
                  </td>
                  <td>
                    {tx.items && tx.items.length > 0
                      ? tx.items.map((item) => `${item.product_name || 'Produk'} (${item.quantity}x)`).join(', ')
                      : '-'}
                  </td>
                  <td>
                    <span className="payment-badge">{tx.payment_method ?? 'Cash'}</span>
                  </td>
                  <td style={{ fontWeight: '600', color: '#2563eb' }}>
                    Rp {Number(tx.total_amount).toLocaleString('id-ID')}
                  </td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {tx.transaction_date
                      ? new Date(tx.transaction_date).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Add New Transaction</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px'
              }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddTransaction}>
              {/* Opsi Pilihan Produk: Pilih dari Daftar atau Ketik Langsung */}
              {products.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, product_mode: 'select' })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: formData.product_mode === 'select' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: formData.product_mode === 'select' ? '#eff6ff' : '#ffffff',
                      color: formData.product_mode === 'select' ? '#1d4ed8' : '#64748b',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Pilih Produk Terdaftar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, product_mode: 'custom' })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: formData.product_mode === 'custom' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: formData.product_mode === 'custom' ? '#eff6ff' : '#ffffff',
                      color: formData.product_mode === 'custom' ? '#1d4ed8' : '#64748b',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    + Produk Lain / Baru
                  </button>
                </div>
              )}

              {!isCustom ? (
                <div className="form-group">
                  <label>Pilih Produk</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    required
                  >
                    <option value="" disabled>-- Pilih Produk --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Rp {Number(p.selling_price).toLocaleString('id-ID')} (Stok: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Nama Produk</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kopi Susu Aren"
                      value={formData.custom_name}
                      onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Harga Satuan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Contoh: 18000"
                      value={formData.custom_price}
                      onChange={(e) => setFormData({ ...formData, custom_price: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Jumlah (Quantity)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedProduct.stock : undefined}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
                {selectedProduct && (
                  <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Tersedia {selectedProduct.stock} unit di inventaris
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Estimasi Total Harga</label>
                <input
                  type="text"
                  value={`Rp ${Number(estimatedTotal).toLocaleString('id-ID')}`}
                  disabled
                  style={{ backgroundColor: '#f8fafc', fontWeight: '600', color: '#1e293b', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label>Metode Pembayaran</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  <option value="Cash">Cash (Tunai)</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Transfer">Transfer Bank</option>
                </select>
              </div>

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
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
