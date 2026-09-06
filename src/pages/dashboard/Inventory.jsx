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

  // State untuk modal Stock Movement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'IN', // 'IN' untuk penambahan stok, 'OUT' untuk pengurangan
    quantity: '',
  });

  // Dipisahkan menjadi fungsi agar bisa dipanggil ulang setelah submit
  const fetchInventory = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await api.get(`/businesses/${businessId}/products`);
      setProducts(res.data ?? []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data stok.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // Fungsi handle submit stock movement
  const handleStockMovement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        product_id: formData.product_id,
        type: formData.type,
        quantity: Number(formData.quantity)
      };

      // Sesuaikan endpoint ini dengan struktur API backend Anda
      await api.post(`/businesses/${businessId}/stock-movements`, payload);

      setFormData({ product_id: '', type: 'IN', quantity: '' });
      setIsModalOpen(false);
      fetchInventory(); // Refresh data stok
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal mencatat pergerakan stok.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStockBtn = (
    <button className="btn-add" onClick={() => setIsModalOpen(true)}>
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

      {/* Komponen Modal Stock Movement */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>Record Stock Movement</h3>
            <form onSubmit={handleStockMovement}>
              
              <div className="form-group">
                <label>Product</label>
                <select 
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  required
                >
                  <option value="" disabled>-- Select a Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Movement Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="IN">Stock In (Add)</option>
                  <option value="OUT">Stock Out (Reduce)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="e.g. 50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required 
                />
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
                  {isSubmitting ? 'Saving...' : 'Save Movement'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Inventory;