import React, { useState, useMemo } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import SoftButton from '../ui/SoftButton';
import SoftInput from '../ui/SoftInput';
import SmartRemarketingModal from './SmartRemarketingModal';

export default function RemarketingModal({ show, leads = [], onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSmartRemarketing, setShowSmartRemarketing] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const todayRemarketingLeads = useMemo(() => {
    return leads.filter(lead => {
      if (!lead.remarketing_eligible_date) return false;
      try {
        return isToday(parseISO(lead.remarketing_eligible_date));
      } catch {
        return false;
      }
    });
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return todayRemarketingLeads.filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm);
      return matchesSearch;
    });
  }, [todayRemarketingLeads, searchTerm]);

  const handleSendMessage = (lead) => {
    setSelectedLead(lead);
    setShowSmartRemarketing(true);
  };

  const sendWhatsApp = (message) => {
    if (selectedLead) {
      const url = `https://wa.me/55${selectedLead.phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      setShowSmartRemarketing(false);
      setSelectedLead(null);
    }
  };

  if (!show) return null;

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
          <div>
            <h3 className="text-[#2d3436] font-semibold text-xl">🔥 Remarketing do Dia</h3>
            <p className="text-[#636e72] text-sm mt-1">Clientes prontos para receber ofertas especiais hoje</p>
          </div>
          <SoftButton onClick={onClose}>Fechar</SoftButton>
        </div>

        <div className="mb-4">
          <SoftInput
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-sm text-[#636e72] mb-3">
          {filteredLeads.length} cliente{filteredLeads.length !== 1 ? 's' : ''} para remarketing hoje
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-10">
            <i className="fas fa-calendar-times text-5xl text-[#dfe6e9] mb-3"></i>
            <p className="text-[#636e72]">
              {todayRemarketingLeads.length === 0 
                ? 'Nenhum cliente marcado para remarketing hoje' 
                : 'Nenhum cliente encontrado com essa busca'}
            </p>
          </div>
        ) : (
          <div 
            className="overflow-x-auto rounded-[15px] p-2.5"
            style={{
              boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
              background: '#eef2f5',
              maxHeight: '500px',
              overflowY: 'auto'
            }}
          >
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Cliente</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Prêmio</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Preferências</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Marcado em</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => (
                  <tr key={idx}>
                    <td className="p-4 border-b border-black/5">
                      <div className="font-medium">{lead.name}</div>
                      <small className="text-[#636e72]">{lead.phone}</small>
                    </td>
                    <td className="p-4 border-b border-black/5">
                      <span className="text-sm">{lead.prize || '-'}</span>
                    </td>
                    <td className="p-4 border-b border-black/5">
                      {lead.day_pref ? (
                        <small>
                          📅 {lead.day_pref} / 🕐 {lead.time_pref}<br />
                          ❤️ {lead.fav_product}
                        </small>
                      ) : (
                        <small className="text-[#636e72]">Não informado</small>
                      )}
                    </td>
                    <td className="p-4 border-b border-black/5">
                      <span className="text-sm">
                        {lead.remarketing_eligible_date 
                          ? format(parseISO(lead.remarketing_eligible_date), 'HH:mm') 
                          : '-'}
                      </span>
                    </td>
                    <td className="p-4 border-b border-black/5">
                      <SoftButton 
                        variant="whatsapp" 
                        onClick={() => handleSendMessage(lead)}
                        style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                      >
                        <i className="fas fa-comment-dots mr-1"></i> Enviar Oferta
                      </SoftButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SmartRemarketingModal 
        show={showSmartRemarketing}
        lead={selectedLead}
        onSend={sendWhatsApp}
        onClose={() => { 
          setShowSmartRemarketing(false); 
          setSelectedLead(null); 
        }} 
      />

      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}