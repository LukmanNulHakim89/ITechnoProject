import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const { businessId, user } = useAuth();
  const [generatingId, setGeneratingId] = useState(null);

  const reportsData = [
    {
      id: 1,
      type: 'sales',
      title: 'Sales report',
      description: 'Generate a structured report from your Nexora transaction data.',
    },
    {
      id: 2,
      type: 'profit',
      title: 'Profit report',
      description: 'Generate a structured report from your Nexora revenue & profit data.',
    },
    {
      id: 3,
      type: 'inventory',
      title: 'Inventory report',
      description: 'Generate a structured report from your Nexora product & stock data.',
    },
    {
      id: 4,
      type: 'expense',
      title: 'Expense report',
      description: 'Generate a structured report from your Nexora operational expenses.',
    },
  ];

  // Helper untuk menambahkan Header Nexora standar pada PDF
  const addPdfHeader = (doc, titleText, subtitleText) => {
    // Header Bar Biru Modern
    doc.setFillColor(37, 99, 235); // #2563eb
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('NEXORA BUSINESS INTELLIGENCE', 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Official Business Report', 196, 16, { align: 'right' });

    // Judul Laporan
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(titleText, 14, 38);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(subtitleText, 14, 44);

    // Metadata Bisnis & Tanggal Cetak
    const printDate = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Bisnis: ${user?.name || 'Nexora'} Store`, 14, 53);
    doc.text(`Waktu Cetak: ${printDate} WIB`, 14, 58);
    doc.text(`Dicetak Oleh: ${user?.name || user?.email || 'User'}`, 196, 53, { align: 'right' });

    // Garis Pemisah
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 63, 196, 63);
  };

  // Helper untuk menambahkan Footer standar pada PDF
  const addPdfFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 282, 196, 282);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Dokumen ini dibuat otomatis oleh Nexora Business Intelligence System.', 14, 288);
      doc.text(`Halaman ${i} dari ${pageCount}`, 196, 288, { align: 'right' });
    }
  };

  // 1. GENERATE SALES REPORT
  const generateSalesReport = async () => {
    const res = await api.get(`/businesses/${businessId}/transactions`);
    const transactions = Array.isArray(res) ? res : (res?.data ?? []);

    const doc = new jsPDF();
    addPdfHeader(doc, 'LAPORAN TRANSAKSI PENJUALAN', 'Ringkasan aktivitas penjualan dan arus transaksi');

    const totalSales = transactions.reduce((sum, tx) => sum + Number(tx.total_amount || 0), 0);
    const avgSales = transactions.length > 0 ? Math.round(totalSales / transactions.length) : 0;

    // Kotak Ringkasan Singkat
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 68, 182, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`Total Transaksi: ${transactions.length}`, 20, 79);
    doc.text(`Total Omzet: Rp ${totalSales.toLocaleString('id-ID')}`, 75, 79);
    doc.text(`Rata-rata / Transaksi: Rp ${avgSales.toLocaleString('id-ID')}`, 135, 79);

    // Tabel Transaksi
    const tableRows = transactions.map((tx, index) => {
      const itemsText = (tx.items ?? []).map((it) => `${it.product_name || 'Produk'} (${it.quantity}x)`).join(', ') || '-';
      const dateText = tx.transaction_date
        ? new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-';

      return [
        index + 1,
        dateText,
        tx.customer_name ?? tx.customer?.name ?? 'Walk-in Customer',
        itemsText,
        tx.payment_method ?? 'Cash',
        `Rp ${Number(tx.total_amount || 0).toLocaleString('id-ID')}`,
      ];
    });

    autoTable(doc, {
      startY: 92,
      head: [['No', 'Tanggal', 'Customer', 'Daftar Produk', 'Pembayaran', 'Total']],
      body: tableRows.length > 0 ? tableRows : [['-', '-', '-', 'Belum ada data transaksi', '-', 'Rp 0']],
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 24 },
        2: { cellWidth: 32 },
        3: { cellWidth: 60 },
        4: { cellWidth: 24, halign: 'center' },
        5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      },
    });

    addPdfFooter(doc);
    doc.save(`Nexora_Sales_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // 2. GENERATE PROFIT & LOSS REPORT
  const generateProfitReport = async () => {
    const res = await api.get(`/businesses/${businessId}/dashboard`);
    const summary = res?.summary || {};
    const bestSeller = res?.best_seller || [];
    const mostProfitable = res?.most_profitable || [];

    const doc = new jsPDF();
    addPdfHeader(doc, 'LAPORAN LABA RUGI & PROFITABILITAS', 'Ringkasan laba kotor, beban pengeluaran, dan laba bersih');

    const totalOmzet = Number(summary.total_omzet || 0);
    const labaKotor = Number(summary.laba_kotor || 0);
    const totalPengeluaran = Number(summary.total_pengeluaran || 0);
    const labaBersih = Number(summary.laba_bersih || 0);
    const totalTransaksi = Number(summary.total_transaksi || 0);

    // Ringkasan Finansial dalam bentuk Tabel Keuangan
    autoTable(doc, {
      startY: 70,
      head: [['Deskripsi Komponen Keuangan', 'Nominal (Rupiah)']],
      body: [
        ['Total Pendapatan Omzet Penjualan', `Rp ${totalOmzet.toLocaleString('id-ID')}`],
        ['Estimasi Total HPP (Cost of Goods Sold)', `Rp ${(totalOmzet - labaKotor).toLocaleString('id-ID')}`],
        ['Laba Kotor (Gross Profit)', `Rp ${labaKotor.toLocaleString('id-ID')}`],
        ['Total Biaya & Pengeluaran Operasional', `Rp ${totalPengeluaran.toLocaleString('id-ID')}`],
        ['LABA BERSIH (NET PROFIT)', `Rp ${labaBersih.toLocaleString('id-ID')}`],
        ['Jumlah Total Transaksi Tercatat', `${totalTransaksi} Transaksi`],
      ],
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      styles: { fontSize: 9.5, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 62, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: function (data) {
        if (data.row.index === 4) {
          data.cell.styles.fillColor = [220, 252, 231]; // Highlight hijau lembut
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    // Tabel Produk Paling Menguntungkan (Most Profitable)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const currentY = doc.lastAutoTable.finalY + 12;
    doc.text('5 Produk Paling Menguntungkan (Top Profitable Products):', 14, currentY);

    const profitRows = (mostProfitable.length > 0 ? mostProfitable : bestSeller).map((item, idx) => [
      idx + 1,
      item.product_name || `Produk #${item.product_id}`,
      `${item.quantity_sold ?? '-'} unit`,
      `Rp ${Number(item.profit || 0).toLocaleString('id-ID')}`,
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Ranking', 'Nama Produk', 'Unit Terjual', 'Total Keuntungan']],
      body: profitRows.length > 0 ? profitRows : [['-', 'Belum ada data produk terjual', '-', 'Rp 0']],
      headStyles: { fillColor: [71, 85, 105] },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 47, halign: 'right', fontStyle: 'bold' },
      },
    });

    addPdfFooter(doc);
    doc.save(`Nexora_Profit_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // 3. GENERATE INVENTORY REPORT
  const generateInventoryReport = async () => {
    const res = await api.get(`/businesses/${businessId}/products`);
    const products = Array.isArray(res) ? res : (res?.data ?? []);

    const doc = new jsPDF();
    addPdfHeader(doc, 'LAPORAN INVENTARIS & VALUASI STOK', 'Status ketersediaan stok, nilai aset inventaris, dan status peringatan');

    const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
    const totalAssetValue = products.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.cost_price || p.selling_price * 0.7)), 0);

    // Kotak Ringkasan Singkat
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 68, 182, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`Total Jenis Produk: ${products.length} SKU`, 20, 79);
    doc.text(`Total Stok Tersedia: ${totalStock} unit`, 75, 79);
    doc.text(`Valuasi Stok: Rp ${Math.round(totalAssetValue).toLocaleString('id-ID')}`, 135, 79);

    const tableRows = products.map((p, index) => {
      const margin = Number(p.margin ?? (p.selling_price - (p.cost_price ?? 0)));
      const stockVal = Number(p.stock || 0) * Number(p.selling_price || 0);
      const isCritical = Number(p.stock || 0) <= Number(p.minimum_stock || 5);

      return [
        index + 1,
        p.name,
        p.category || 'General',
        `Rp ${Number(p.cost_price || 0).toLocaleString('id-ID')}`,
        `Rp ${Number(p.selling_price || 0).toLocaleString('id-ID')}`,
        `Rp ${margin.toLocaleString('id-ID')}`,
        `${p.stock} unit`,
        `Rp ${stockVal.toLocaleString('id-ID')}`,
        isCritical ? 'KRITIS' : 'AMAN',
      ];
    });

    autoTable(doc, {
      startY: 92,
      head: [['No', 'Nama Produk', 'Kategori', 'Hrg Modal', 'Hrg Jual', 'Margin', 'Stok', 'Total Nilai', 'Status']],
      body: tableRows.length > 0 ? tableRows : [['-', 'Belum ada data produk', '-', '-', '-', '-', '-', '-', '-']],
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 18, halign: 'right' },
        6: { cellWidth: 16, halign: 'center' },
        7: { cellWidth: 23, halign: 'right', fontStyle: 'bold' },
        8: { cellWidth: 17, halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: function (data) {
        if (data.column.index === 8 && data.cell.text[0] === 'KRITIS') {
          data.cell.styles.textColor = [220, 38, 38]; // Merah jika kritis
        } else if (data.column.index === 8 && data.cell.text[0] === 'AMAN') {
          data.cell.styles.textColor = [22, 163, 74]; // Hijau jika aman
        }
      },
    });

    addPdfFooter(doc);
    doc.save(`Nexora_Inventory_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // 4. GENERATE EXPENSE REPORT
  const generateExpenseReport = async () => {
    let expenses = [];
    try {
      const res = await api.get(`/businesses/${businessId}/expenses`);
      expenses = Array.isArray(res) ? res : (res?.data ?? []);
    } catch {
      expenses = [];
    }

    const doc = new jsPDF();
    addPdfHeader(doc, 'LAPORAN PENGELUARAN BISNIS', 'Daftar rincian biaya operasional dan pengeluaran berkala');

    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Kotak Ringkasan
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 68, 182, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`Total Catatan Biaya: ${expenses.length}`, 20, 79);
    doc.text(`Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}`, 110, 79);

    const tableRows = expenses.map((exp, index) => [
      index + 1,
      exp.expense_date
        ? new Date(exp.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-',
      exp.category || 'Operasional',
      exp.description || 'Pengeluaran bisnis',
      `Rp ${Number(exp.amount || 0).toLocaleString('id-ID')}`,
    ]);

    autoTable(doc, {
      startY: 92,
      head: [['No', 'Tanggal', 'Kategori', 'Keterangan Pengeluaran', 'Jumlah']],
      body: tableRows.length > 0 ? tableRows : [['-', '-', '-', 'Belum ada data pengeluaran tercatat', 'Rp 0']],
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 35 },
        3: { cellWidth: 70 },
        4: { cellWidth: 39, halign: 'right', fontStyle: 'bold' },
      },
    });

    addPdfFooter(doc);
    doc.save(`Nexora_Expense_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Handler Tombol Generate
  const handleGenerate = async (report) => {
    if (!businessId) {
      alert('Silakan pilih bisnis terlebih dahulu.');
      return;
    }

    setGeneratingId(report.id);
    try {
      if (report.type === 'sales') {
        await generateSalesReport();
      } else if (report.type === 'profit') {
        await generateProfitReport();
      } else if (report.type === 'inventory') {
        await generateInventoryReport();
      } else if (report.type === 'expense') {
        await generateExpenseReport();
      }
    } catch (err) {
      console.error(err);
      alert('Gagal membuat file PDF: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Reports"
      subtitle="Business summaries ready to export."
      showSearch={false}
      activeMenu="Reports"
    >
      <div className="reports-grid">
        {reportsData.map((report) => (
          <div key={report.id} className="report-card">
            {/* Ikon File */}
            <div className="report-icon-box">
              <img src="/images/dashboard/Reports.png" alt="File Icon" />
            </div>

            {/* Teks */}
            <h4>{report.title}</h4>
            <p>{report.description}</p>

            {/* Tombol Generate PDF */}
            <button
              className="btn-generate"
              onClick={() => handleGenerate(report)}
              disabled={generatingId === report.id}
              style={{
                backgroundColor: generatingId === report.id ? '#eff6ff' : 'white',
                color: generatingId === report.id ? '#2563eb' : '#6b7280',
                borderColor: generatingId === report.id ? '#2563eb' : '#e5e7eb',
                cursor: generatingId === report.id ? 'not-allowed' : 'pointer',
              }}
            >
              {generatingId === report.id ? 'Mengunduh PDF...' : 'Generate PDF'}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Reports;