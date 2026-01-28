import React from 'react';
import SoftButton from '../ui/SoftButton';
import SoftCard from '../ui/SoftCard';

export default function CRMPreviewTable({ leads = [], onWhatsApp }) {
  return (
    <SoftCard>
      <h4 className="mb-4 font-semibold text-[#2d3436]">Últimos Clientes</h4>
      <div 
        className="overflow-x-auto rounded-[15px] p-2.5"
        style={{
          boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
          background: '#eef2f5'
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
            {leads.slice(0, 5).map((lead, idx) => (
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
    </SoftCard>
  );
}