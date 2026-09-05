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

  return (
    <DashboardLayout
      title="Products"
      subtitle="Understand which products drive revenue and margin."
      showSearch={false}
      activeMenu="Products"
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
    </DashboardLayout>
  );
};

export default Products;
