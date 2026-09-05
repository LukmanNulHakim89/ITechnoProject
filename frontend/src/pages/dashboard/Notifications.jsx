import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const Notifications = () => {
  // Data notifikasi yang dikelompokkan berdasarkan tanggal dan dilengkapi kategori logo
  const [notifData, setNotifData] = useState({
    Today: [
      {
        id: 1,
        type: 'transaction',
        title: 'New Transaction: QRIS',
        desc: 'Payment of Rp 30.000 received via QRIS for 2x Es Kopi.',
        time: '10 mins ago',
        isRead: false,
      },
      {
        id: 2,
        type: 'transaction',
        title: 'New Transaction: Cash',
        desc: 'Payment of Rp 25.000 received via Cash for 1x Kopi Latte.',
        time: '45 mins ago',
        isRead: false,
      },
      {
        id: 3,
        type: 'inventory',
        title: 'Low Stock Alert',
        desc: 'Susu UHT is running critically low (0 units left). Restock immediately.',
        time: '2 hours ago',
        isRead: true,
      },
      {
        id: 4,
        type: 'goal',
        title: 'Goal Almost Achieved!',
        desc: 'Great job! You have reached 90% of your August revenue target (Rp 45.000.000 / Rp 50.000.000).',
        time: '1 day ago',
        isRead: true,
      }
    ],
    Yesterday: [
      {
        id: 5,
        type: 'goal',
        title: 'Goal Almost Achieved!',
        desc: 'Great job! You have reached 90% of your August revenue target (Rp 45.000.000 / Rp 50.000.000).',
        time: '1 day ago',
        isRead: true,
      }
    ]
  });

  // Fungsi untuk menandai semua notifikasi menjadi "Read"
  const markAllAsRead = () => {
    const updatedData = { ...notifData };
    Object.keys(updatedData).forEach(date => {
      updatedData[date] = updatedData[date].map(notif => ({ ...notif, isRead: true }));
    });
    setNotifData(updatedData);
  };

  // Fungsi helper untuk merender ikon dan warna berdasarkan tipe
  const getIconConfig = (type) => {
    switch (type) {
      case 'transaction':
        return { bg: 'bg-transaction', icon: '/images/dashboard/Transactions.png' };
      case 'inventory':
        return { bg: 'bg-inventory', icon: '/images/dashboard/inventory.png' };
      case 'goal':
        return { bg: 'bg-goal', icon: '/images/dashboard/Goals.png' };
      default:
        return { bg: 'bg-default', icon: '/images/dashboard/notification.png' };
    }
  };

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Stay updated with your latest business activities."
      showSearch={false}
      activeMenu=""
    >
      {/* 
        Gaya CSS Khusus (Inline Style Block)
        CSS ini disematkan langsung agar tidak mengganggu layout utama Anda 
      */}
      <style>{`
        .notif-container {
          padding-bottom: 40px;
        }
        
        .date-group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 24px 0 16px 0;
        }

        .date-group-header h3 {
          font-size: 16px;
          color: #1a1a24;
          font-weight: 700;
          margin: 0;
        }

        .btn-mark-read {
          background-color: white;
          border: 1px solid #d1d5db;
          color: #4b5563;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-mark-read:hover {
          border-color: #4b6bfb;
          color: #4b6bfb;
        }

        .notif-card {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .notif-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .notif-left {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }

        /* Warna Latar Belakang Ikon */
        .bg-transaction { background-color: #e6f4ea; }
        .bg-inventory { background-color: #fce8e6; }
        .bg-goal { background-color: #fef7e0; }
        .bg-default { background-color: #eef2ff; }

        .icon-box img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          /* Filter agar ikon menjadi hitam transparan supaya serasi dengan background */
          filter: brightness(0) opacity(0.6); 
        }

        .notif-details h5 {
          margin: 0 0 6px 0;
          font-size: 14px;
          color: #1e293b;
          font-weight: 700;
        }

        .notif-details p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        }

        .notif-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          min-width: 100px;
        }

        .time-and-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notif-time {
          font-size: 12px;
          color: #94a3b8;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981; /* Hijau untuk unread */
          border-radius: 50%;
        }
      `}</style>

      <div className="notif-container">
        
        {/* Render Grup Berdasarkan Tanggal (Today, Yesterday) */}
        {Object.entries(notifData).map(([date, notifications]) => (
          <div key={date}>
            
            {/* Header Tanggal */}
            <div className="date-group-header">
              <h3>{date}</h3>
              {/* Tombol Mark All as Read hanya muncul di grup "Today" */}
              {date === 'Today' && (
                <button className="btn-mark-read" onClick={markAllAsRead}>
                  Mark All as Read
                </button>
              )}
            </div>

            {/* List Kartu Notifikasi */}
            {notifications.map((notif) => {
              const { bg, icon } = getIconConfig(notif.type);
              
              return (
                <div key={notif.id} className="notif-card">
                  
                  {/* Sisi Kiri: Ikon & Teks */}
                  <div className="notif-left">
                    <div className={`icon-box ${bg}`}>
                      <img src={icon} alt={notif.type} />
                    </div>
                    <div className="notif-details">
                      <h5>{notif.title}</h5>
                      <p>{notif.desc}</p>
                    </div>
                  </div>

                  {/* Sisi Kanan: Waktu & Status */}
                  <div className="notif-right">
                    <div className="time-and-status">
                      <span className="notif-time">{notif.time}</span>
                      {/* Munculkan titik hijau jika belum dibaca */}
                      {!notif.isRead && <span className="unread-dot"></span>}
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        ))}

      </div>
    </DashboardLayout>
  );
};

export default Notifications;