import React from 'react';

function formatMargin(profit, quantity) {
  if (!quantity) return '0%';
  // Kita tidak punya persentase margin siap pakai dari backend untuk
  // agregat ini, jadi tampilkan profit-nya langsung dalam Rupiah.
  return `Rp ${Number(profit ?? 0).toLocaleString('id-ID')}`;
}

const TopProducts = ({ data = [] }) => {
  return (
    <div className="card top-products-card">
      <div className="card-header">
        <div>
          <h4>Top products</h4>
          <p>By sales volume</p>
        </div>
        <button className="more-btn">...</button>
      </div>
      <ul className="product-list">
        {data.length === 0 && (
          <li><p style={{ color: '#9ca3af', padding: '8px 0' }}>Belum ada data penjualan.</p></li>
        )}
        {data.map((item, idx) => (
          <li key={item.product_id ?? idx}>
            <div className="product-info">
              <span className="rank">{idx + 1}</span>
              <div>
                <h5>{item.product_name ?? 'Produk'}</h5>
                <p>{item.quantity_sold} sold</p>
              </div>
            </div>
            <span className="margin text-blue">{formatMargin(item.profit, item.quantity_sold)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopProducts;
