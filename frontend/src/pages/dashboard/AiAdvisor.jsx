import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

// Parse markdown sederhana: **bold**, *italic*, newline → React elements
function renderMarkdown(text) {
  if (!text) return null;

  // Pisah per baris
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Parse inline: **bold** dan *italic*
    const parts = [];
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      // teks sebelum match
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      if (match[1] !== undefined) {
        // **bold**
        parts.push(<strong key={`b-${lineIdx}-${match.index}`}>{match[1]}</strong>);
      } else if (match[2] !== undefined) {
        // *italic*
        parts.push(<em key={`i-${lineIdx}-${match.index}`}>{match[2]}</em>);
      }
      lastIndex = regex.lastIndex;
    }
    // sisa teks
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return (
      <span key={lineIdx}>
        {parts.length > 0 ? parts : line}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
}

const AiAdvisor = () => {
  const { businessId } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'I analyzed your latest business data. Ask me anything about your revenue, products, or stock.',
    },
  ]);
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const question = inputText.trim();
    if (!question || sending || !businessId) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/businesses/${businessId}/advisor`, { question });
      setMessages((prev) => [...prev, { role: 'ai', text: res.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: `Maaf, terjadi kesalahan: ${err.message}` },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <DashboardLayout
      title="AI Advisor"
      subtitle="Ask Nexora about your business performance."
      showSearch={false}
      activeMenu="AiAdvisor"
    >
      <div className="dashboard-grid">
        <div className="card chat-card">
          <div className="chat-header">
            <h4 style={{ fontWeight: '700', color: '#1a1a24' }}>Nexora AI</h4>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Context-aware business advisor</p>
          </div>

          <div className="chat-history">
            {messages.map((msg, idx) =>
              msg.role === 'ai' ? (
                <div className="chat-message ai-message" key={idx}>
                  <div className="ai-author">
                    <span className="ai-icon">✦</span> <strong>Nexora</strong>
                  </div>
                  <p className="ai-text">{renderMarkdown(msg.text)}</p>
                </div>
              ) : (
                <div className="chat-message user-message" key={idx} style={{ textAlign: 'right' }}>
                  <p className="ai-text">{msg.text}</p>
                </div>
              )
            )}
            {sending && (
              <div className="chat-message ai-message">
                <p className="ai-text">Nexora sedang berpikir...</p>
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Why did my product change?"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={sending}
            />
            <button className="btn-send" onClick={handleSend} disabled={sending}>
              Send
            </button>
          </div>
        </div>

        <div className="suggestions-area">
          <h4 className="suggestions-title">Try asking</h4>

          <button className="suggestion-btn" onClick={() => setInputText('Produk apa yang paling perlu saya perhatikan minggu ini?')}>
            Produk apa yang paling perlu saya perhatikan minggu ini?
          </button>
          <button className="suggestion-btn" onClick={() => setInputText('Bagaimana cara meningkatkan omzet bulan ini?')}>
            Bagaimana cara meningkatkan omzet bulan ini?
          </button>
          <button className="suggestion-btn" onClick={() => setInputText('Stok mana yang kritis sekarang?')}>
            Stok mana yang kritis sekarang?
          </button>
          <button className="suggestion-btn" onClick={() => setInputText('Bagaimana cara meningkatkan margin keuntungan saya?')}>
            Bagaimana cara meningkatkan margin keuntungan saya?
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiAdvisor;
