import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const AiAdvisor = () => {
  const [inputText, setInputText] = useState('');

  // Fungsi simulasi saat tombol send ditekan
  const handleSend = () => {
    if (!inputText.trim()) return;
    console.log("Pertanyaan dikirim:", inputText);
    setInputText('');
    // Nantinya logika memanggil API OpenAI / Gemini / LLM lainnya akan diletakkan di sini
  };

  return (
    <DashboardLayout
      title="AI Advisor"
      subtitle="Ask Nexora about your business performance."
      showSearch={false}
      activeMenu="AiAdvisor" // Menyorot menu AI Advisor di Sidebar
    >
      <div className="dashboard-grid">
        
        {/* Kiri: Area Chat (Di dalam Card) */}
        <div className="card chat-card">
          <div className="chat-header">
            <h4 style={{ fontWeight: '700', color: '#1a1a24' }}>Nexora AI</h4>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Context-aware business advisor</p>
          </div>

          <div className="chat-history">
            {/* Pesan dari AI */}
            <div className="chat-message ai-message">
              <div className="ai-author">
                <span className="ai-icon">✦</span> <strong>Nexora</strong>
              </div>
              <p className="ai-text">
                I analyzed your latest business data. Revenue is growing 12.4%, while inventory needs attention.
              </p>
            </div>
            
            {/* Nantinya pesan dari user akan dirender di sini */}
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              placeholder="Why did my product change?" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="btn-send" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>

        {/* Kanan: Saran Pertanyaan (Tanpa Card) */}
        <div className="suggestions-area">
          <h4 className="suggestions-title">Try asking</h4>
          
          <button className="suggestion-btn" onClick={() => setInputText("Why did my product change?")}>
            Why did my product change?
          </button>
          <button className="suggestion-btn" onClick={() => setInputText("What is the revenue projection for next month?")}>
            What is the revenue projection for next month?
          </button>
          <button className="suggestion-btn" onClick={() => setInputText("Which inventory items are critically low?")}>
            Which inventory items are critically low?
          </button>
          <button className="suggestion-btn" onClick={() => setInputText("How can I improve my profit margin?")}>
            How can I improve my profit margin?
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AiAdvisor;