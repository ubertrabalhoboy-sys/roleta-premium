import React from 'react';
import SoftButton from '../ui/SoftButton';

export default function NotificationsModal({ show, notifications = [], onClear, onClose }) {
  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[90%] max-w-[400px] p-[30px] rounded-[20px] bg-white max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[#2d3436] font-semibold">Notificações</h3>
          <SoftButton onClick={onClose}>Fechar</SoftButton>
        </div>

        <ul className="list-none p-0">
          {notifications.length === 0 ? (
            <li className="text-center text-[#636e72] py-5">
              Nenhuma notificação recente.
            </li>
          ) : (
            notifications.map((n, idx) => (
              <li key={idx} className="p-2.5 border-b border-gray-100 text-sm text-[#2d3436]">
                <strong>{n.text}</strong>
                <small className="block text-[#636e72] mt-0.5">
                  {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </li>
            ))
          )}
        </ul>

        <SoftButton variant="primary" onClick={onClear} className="w-full mt-2.5">
          Limpar Tudo
        </SoftButton>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}