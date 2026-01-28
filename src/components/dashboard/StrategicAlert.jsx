import React from 'react';
import SoftButton from '../ui/SoftButton';

export default function StrategicAlert({ count, onAction }) {
  if (count <= 0) return null;

  return (
    <div 
      className="rounded-[15px] p-4 flex items-center gap-4 mb-6"
      style={{
        background: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
        animation: 'pulseAlert 2s infinite'
      }}
    >
      <i className="fab fa-whatsapp text-3xl"></i>
      <div>
        <h4 className="m-0 font-semibold">🔥 Remarketing Disponível!</h4>
        <p className="m-0 text-sm">
          Existem <strong>{count}</strong> cliente{count !== 1 ? 's' : ''} marcado{count !== 1 ? 's' : ''} para remarketing hoje.
        </p>
      </div>
      <SoftButton variant="whatsapp" onClick={onAction} style={{ marginLeft: 'auto' }}>
        Enviar Cupons
      </SoftButton>
      <style>{`
        @keyframes pulseAlert { 0% { transform: scale(1); } 50% { transform: scale(1.01); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}