import React, { useState } from 'react';
import SoftButton from '../ui/SoftButton';

export default function LeadStep2Modal({ 
  show, 
  foodOptions = [], 
  onSubmit, 
  onClose 
}) {
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [favProduct, setFavProduct] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ day, time, favProduct });
    setDay('');
    setTime('');
    setFavProduct('');
  };

  if (!show) return null;

  const selectStyle = {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: 'none',
    color: '#fff'
  };

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
        <div className="text-4xl mb-2.5">🔥</div>
        <h3 className="text-[#ff003c] font-bold mb-2.5" style={{ textShadow: '0 0 10px #ff003c' }}>
          Oferta Exclusiva!
        </h3>
        <p className="text-gray-300 mb-5 text-sm leading-relaxed">
          Garanta um <strong>CUPOM DE ATÉ 80% OFF</strong> para sua próxima visita no dia e hora de sua preferência!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2.5 mb-2.5">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
              className="flex-1 p-3.5 rounded-xl outline-none mb-4"
              style={selectStyle}
            >
              <option value="" disabled>Dia Preferido?</option>
              <option value="Segunda">Segunda</option>
              <option value="Terça">Terça</option>
              <option value="Quarta">Quarta</option>
              <option value="Quinta">Quinta</option>
              <option value="Sexta">Sexta</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="flex-1 p-3.5 rounded-xl outline-none mb-4"
              style={selectStyle}
            >
              <option value="" disabled>Horário?</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noite">Noite</option>
            </select>
          </div>

          <select
            value={favProduct}
            onChange={(e) => setFavProduct(e.target.value)}
            required
            className="w-full p-3.5 rounded-xl outline-none mb-4"
            style={selectStyle}
          >
            <option value="" disabled>Qual seu prato favorito?</option>
            {foodOptions.map((opt, idx) => (
              <option key={idx} value={opt.name || opt}>{opt.name || opt}</option>
            ))}
          </select>

          <SoftButton type="submit" variant="whatsapp" className="w-full font-bold mt-2.5">
            <i className="fab fa-whatsapp mr-2"></i> RESGATAR AGORA!
          </SoftButton>
        </form>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        select option { background: #333; color: #fff; }
      `}</style>
    </div>
  );
}