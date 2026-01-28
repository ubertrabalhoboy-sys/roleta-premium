import React from 'react';
import SoftButton from '../ui/SoftButton';

export default function GlobalLeadsModal({ show, leads = [], restaurants = [], onSendCoupon, onClose }) {
  if (!show) return null;

  const getRestName = (restId) => {
    const rest = restaurants.find(r => r.id === restId);
    return rest?.name || '?';
  };

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[95%] max-w-[900px] p-[30px] rounded-[20px] bg-white max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[#2d3436] font-semibold">CRM Estratégico (Admin Geral)</h3>
          <SoftButton onClick={onClose}>Fechar</SoftButton>
        </div>
        
        <div 
          className="overflow-x-auto rounded-[15px] p-2.5"
          style={{
            boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
            background: '#eef2f5',
            maxHeight: '500px',
            overflowY: 'auto'
          }}
        >
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Restaurante</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Cliente</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">WhatsApp</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Preferências</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Status</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Ação</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, idx) => (
                <tr key={idx}>
                  <td className="p-4 border-b border-black/5">{getRestName(lead.restaurant_id)}</td>
                  <td className="p-4 border-b border-black/5">
                    {lead.name}<br />
                    <small className="text-[#636e72]">{lead.phone}</small>
                  </td>
                  <td className="p-4 border-b border-black/5">{lead.phone}</td>
                  <td className="p-4 border-b border-black/5">
                    {lead.day_pref ? (
                      <small>
                        {lead.day_pref} / {lead.time_pref}<br />
                        ❤️ {lead.fav_product}
                      </small>
                    ) : '-'}
                  </td>
                  <td className="p-4 border-b border-black/5">
                    <span 
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        background: lead.sent_by_admin ? 'rgba(0, 184, 148, 0.15)' : 'rgba(214, 48, 49, 0.15)', 
                        color: lead.sent_by_admin ? '#00b894' : '#d63031' 
                      }}
                    >
                      {lead.sent_by_admin ? 'Enviado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="p-4 border-b border-black/5">
                    <SoftButton 
                      variant="whatsapp" 
                      onClick={() => onSendCoupon(lead)}
                      style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                    >
                      Enviar 80%
                    </SoftButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}