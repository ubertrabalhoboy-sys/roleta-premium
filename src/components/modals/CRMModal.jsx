import React from 'react';
import SoftButton from '../ui/SoftButton';

export default function CRMModal({ show, leads = [], onWhatsApp, onClose }) {
  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[95%] max-w-[800px] p-[30px] rounded-[20px] bg-white max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <h3 className="mb-4 text-[#2d3436] font-semibold">Meus Clientes</h3>
        
        <div 
          className="overflow-x-auto rounded-[15px] p-2.5"
          style={{
            boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
            background: '#eef2f5',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Nome</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">WhatsApp</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Prêmio</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Status</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Ação</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, idx) => (
                <tr key={idx}>
                  <td className="p-4 border-b border-black/5">{lead.name}</td>
                  <td className="p-4 border-b border-black/5">{lead.phone}</td>
                  <td className="p-4 border-b border-black/5">{lead.prize}</td>
                  <td className="p-4 border-b border-black/5">
                    <span 
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(0, 184, 148, 0.15)', color: '#00b894' }}
                    >
                      Ativo
                    </span>
                  </td>
                  <td className="p-4 border-b border-black/5">
                    <SoftButton 
                      variant="whatsapp" 
                      onClick={() => onWhatsApp(lead.phone)}
                      style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                    >
                      <i className="fab fa-whatsapp mr-1"></i> Conversar
                    </SoftButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SoftButton onClick={onClose} className="w-full mt-4">
          Fechar
        </SoftButton>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}