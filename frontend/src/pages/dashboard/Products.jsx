import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

function performanceFor(marginPercent, unitsSold) {
  if (marginPercent >= 55 && unitsSold >= 15) return { label: 'Star product', type: 'default' };
  if (marginPercent >= 55 && unitsSold < 15) return { label: 'Hidden gem', type: 'success' };
  if (unitsSold === 0) return { label: 'Needs attention', type: 'warning' };
  return { label: 'Steady seller', type: 'default' };
}

const Products = () => {
  const { businessId } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State baru untuk fitur Add Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    selling_price: '',
    margin: ''
  });

  async function loadProducts() {
    if (!businessId) return;
    setLoading(true);
    try {
      const [productRes, txRes] = await Promise.all([
        api.get(`/businesses/${businessId}/products`),
        api.get(`/businesses/${businessId}/transactions`),
      ]);

      const soldByProduct = {};
      (txRes.data ?? []).forEach((trx) => {
        trx.items.forEach((item) => {
          soldByProduct[item.product_id] = (soldByProduct[item.product_id] ?? 0) + item.quantity;
        });
      });

      const enriched = (productRes.data ?? []).map((p) => {
        const sold = soldByProduct[p.id] ?? 0;
        const marginPercent = p.selling_price > 0 ? Math.round((p.margin / p.selling_price) * 100) : 0;
        return { ...p, sold, marginPercent, ...performanceFor(marginPercent, sold) };
      });

      setProducts(enriched);
    } catch (err) {
      setError(err.message || 'Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // Fungsi handle submit produk ke backend
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name,
        selling_price: Number(formData.selling_price),
        margin: Number(formData.margin)
      };

      await api.post(`/businesses/${businessId}/products`, payload);

      setFormData({ name: '', selling_price: '', margin: '' });
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal menambahkan produk baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tombol aksi untuk membuka modal
  const addProductBtn = (
    <button className="btn-add" onClick={() => setIsModalOpen(true)}>
      + Add product
    </button>
  );

  return (
    <DashboardLayout
      title="Products"
      subtitle="Understand which products drive revenue and margin."
      showSearch={false}
      activeMenu="Products"
      actionButton={addProductBtn}
    >
      <div className="card transaction-card">
        <div className="card-header">
          <div>
            <h4 style={{ fontWeight: '700', color: '#1a1a24' }}>Product performance</h4>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Current business performance</p>
          </div>
          <button className="more-btn">...</button>
        </div>

        {error && <p style={{ color: '#dc2626', padding: '0 16px' }}>{error}</p>}
        {loading ? (
          <p style={{ padding: 16 }}>Memuat produk...</p>
        ) : (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>UNITS SOLD</th>
                <th>MARGIN</th>
                <th>PERFORMANCE</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: 16 }}>Belum ada produk.</td></tr>
              )}
              {products.map((prod) => (
                <tr key={prod.id}>
                  <td className="product-name">{prod.name}</td>
                  <td style={{ color: '#64748b' }}>{prod.sold}</td>
                  <td style={{ color: '#64748b' }}>{prod.marginPercent}%</td>
                  <td>
                    <span className={`perf-badge ${prod.type}`}>
                      {prod.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Komponen Modal Add Product */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kopi Latte"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Selling Price (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="e.g. 25000"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({...formData, selling_price: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Margin (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="e.g. 15000"
                  value={formData.margin}
                  onChange={(e) => setFormData({...formData, margin: e.target.value})}
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
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Products;
