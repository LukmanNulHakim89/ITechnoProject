import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const Reports = () => {
  // Data dummy untuk kartu laporan
  // Catatan: Sesuai gambar referensi, item ke-4 adalah duplikasi "Sales report"
  const reportsData = [
    { id: 1, title: 'Sales report', description: 'Generate a structured report from your Nexora data.' },
    { id: 2, title: 'Profit report', description: 'Generate a structured report from your Nexora data.' },
    { id: 3, title: 'Inventory report', description: 'Generate a structured report from your Nexora data.' },
    { id: 4, title: 'Sales report', description: 'Generate a structured report from your Nexora data.' },
  ];

  return (
    <DashboardLayout
      title="Reports"
      subtitle="Business summaries ready to export."
      showSearch={false}
      activeMenu="Reports" // Menyorot menu Reports di Sidebar
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
            
            {/* Tombol Generate */}
            <button className="btn-generate">Generate</button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Reports;