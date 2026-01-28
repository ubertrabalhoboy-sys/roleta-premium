import React from 'react';
import SoftButton from '../ui/SoftButton';

export default function PrizesModal({ show, prizes = [], onDelete, onAddNew, onClose }) {
  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[95%] max-w-[600px] p-[30px] rounded-[20px] bg-white max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <h3 className="mb-4 text-[#2d3436] font-semibold">Prêmios</h3>
        
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Nome</th>
              <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Tier</th>
              <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">%</th>
              <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Estoque</th>
              <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Expira</th>
              <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Ação</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((prize, idx) => {
              const tierColors = {
                common: '⚪',
                rare: '🔵',
                epic: '🟣'
              };
              const remaining = prize.limit_count ? (prize.limit_count - (prize.current_count || 0)) : '∞';
              const isExpired = prize.expiration_date && new Date(prize.expiration_date) < new Date();
              
              return (
                <tr key={idx} className={isExpired ? 'opacity-50' : ''}>
                  <td className="p-4 border-b border-black/5">{prize.name}</td>
                  <td className="p-4 border-b border-black/5 text-sm">
                    {tierColors[prize.tier || 'common']} {prize.tier || 'common'}
                  </td>
                  <td className="p-4 border-b border-black/5">{prize.chance}%</td>
                  <td className="p-4 border-b border-black/5">
                    <span className={remaining === 0 ? 'text-red-600 font-bold' : remaining === '∞' ? 'text-green-600' : ''}>
                      {remaining} {prize.limit_period && prize.limit_count ? `/${prize.limit_period}` : ''}
                    </span>
                  </td>
                  <td className="p-4 border-b border-black/5 text-xs">
                    {prize.expiration_date ? (
                      <span className={isExpired ? 'text-red-600' : ''}>
                        {new Date(prize.expiration_date).toLocaleDateString('pt-BR')}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4 border-b border-black/5">
                    <SoftButton 
                      variant="danger" 
                      onClick={() => onDelete(prize.id)}
                      style={{ padding: '5px 10px' }}
                    >
                      ×
                    </SoftButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4">
          <SoftButton variant="primary" onClick={onAddNew} className="w-full">
            <i className="fas fa-plus mr-2"></i> Novo Prêmio
          </SoftButton>
        </div>

        <SoftButton onClick={onClose} className="w-full mt-2.5">
          Fechar
        </SoftButton>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}