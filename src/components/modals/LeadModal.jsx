import React, { useState } from 'react';
import SoftButton from '../ui/SoftButton';

export default function LeadModal({ 
  show, 
  prizeName, 
  onSubmit, 
  onClose 
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, phone });
    setName('');
    setPhone('');
  };

  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[90%] max-w-[400px] p-[30px] rounded-[20px] text-white text-center"
        style={{
          background: 'rgba(30, 10, 10, 0.95)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid #ff003c',
          boxShadow: '0 0 40px rgba(255, 0, 60, 0.3)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <div className="text-5xl mb-2.5">🎉</div>
        <h2 className="text-[#ff003c] mb-2.5" style={{ textShadow: '0 0 10px #ff003c' }}>Você Ganhou!</h2>
        <p className="text-gray-300 mb-5">
          Prêmio: <strong className="text-[#ffd700]">{prizeName}</strong>
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Seu Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3.5 rounded-xl outline-none mb-4 text-white placeholder-white/50"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: 'none'
            }}
          />
          <input
            type="tel"
            placeholder="WhatsApp (DDD + Número)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full p-3.5 rounded-xl outline-none mb-4 text-white placeholder-white/50"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: 'none'
            }}
          />
          <SoftButton type="submit" variant="whatsapp" className="w-full mt-4">
            PRÓXIMO <i className="fas fa-arrow-right ml-2"></i>
          </SoftButton>
        </form>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}