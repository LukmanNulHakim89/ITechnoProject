import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const Goals = () => {
  // State untuk menyimpan daftar goals secara dinamis
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'August revenue target',
      type: 'Monthly goal',
      current: 36000000,
      target: 50000000
    }
  ]);

  // State untuk mengontrol modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Monthly goal',
    target: ''
  });

  // Fungsi untuk memproses penambahan goal baru
  const handleAddGoal = (e) => {
    e.preventDefault();
    const newGoal = {
      id: goals.length + 1,
      title: formData.title,
      type: formData.type,
      current: 0, // Progress awal dimulai dari 0
      target: Number(formData.target)
    };

    // Tambahkan goal baru ke bagian atas daftar
    setGoals([newGoal, ...goals]);
    
    // Tutup modal dan reset form
    setIsModalOpen(false);
    setFormData({ title: '', type: 'Monthly goal', target: '' });
  };

  // Tombol aksi untuk Topbar yang memicu modal
  const newGoalBtn = (
    <button className="btn-add" onClick={() => setIsModalOpen(true)}>
      + New goal
    </button>
  );

  return (
    <DashboardLayout
      title="Business goals"
      subtitle="Track progress toward your monthly targets."
      showSearch={false}
      actionButton={newGoalBtn}
      activeMenu="Goals" 
    >
      {/* Mapping data goals menjadi daftar kartu (card) */}
      {goals.map((goal) => {
        // Kalkulasi persentase dan sisa target secara otomatis
        const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
        const remaining = Math.max(goal.target - goal.current, 0);

        return (
          <div className="card transaction-card" key={goal.id} style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <div>
                <h4 style={{ fontWeight: '700', color: '#1a1a24' }}>{goal.title}</h4>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>{goal.type}</p>
              </div>
              <button className="more-btn">...</button>
            </div>

            <div className="goal-content">
              <div className="goal-amount">
                <h2>
                  Rp {goal.current.toLocaleString('id-ID')} 
                  <span className="goal-target"> / Rp {goal.target.toLocaleString('id-ID')}</span>
                </h2>
              </div>
              
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
              </div>
              
              <div className="progress-labels">
                <span>{percentage}% achieved</span>
                <span>Rp {remaining.toLocaleString('id-ID')} remaining</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Komponen Modal Add Goal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>Create New Goal</h3>
            <form onSubmit={handleAddGoal}>
              
              <div className="form-group">
                <label>Goal Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. September revenue target"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Goal Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="Monthly goal">Monthly goal</option>
                  <option value="Quarterly goal">Quarterly goal</option>
                  <option value="Annual goal">Annual goal</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Amount (Rp)</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="e.g. 50000000"
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                  required 
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Goal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Goals;