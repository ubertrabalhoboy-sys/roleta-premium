import React from 'react';
import { format } from 'date-fns';
import SoftButton from '../ui/SoftButton';

export default function LeadCard({ lead, getRestName, onSendCoupon, onViewDetails, onSendRemarketing }) {
  const hasPreferences = lead.day_pref && lead.time_pref && lead.fav_product;

  return (
    <div 
      className="p-4 rounded-[20px] bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
      style={{
        boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.05), -5px -5px 15px rgba(255, 255, 255, 0.9)'
      }}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-[#2d3436] mb-1">{lead.name}</h4>
            <p className="text-sm text-[#636e72] mb-2">{lead.phone}</p>
          </div>
          <span 
            className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{ 
              background: lead.sent_by_admin ? 'rgba(0, 184, 148, 0.15)' : 'rgba(214, 48, 49, 0.15)', 
              color: lead.sent_by_admin ? '#00b894' : '#d63031' 
            }}
          >
            {lead.sent_by_admin ? 'Enviado' : 'Pendente'}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-store text-[#6c5ce7]"></i>
            <span className="text-[#636e72]">{getRestName(lead.restaurant_id)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-gift text-[#6c5ce7]"></i>
            <span className="text-[#2d3436] font-medium">{lead.prize || 'Sem prêmio'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-calendar text-[#6c5ce7]"></i>
            <span className="text-[#636e72]">
              {lead.created_date ? format(new Date(lead.created_date), 'dd/MM/yyyy HH:mm') : '-'}
            </span>
          </div>
        </div>

        {hasPreferences ? (
          <div 
            className="p-3 rounded-lg mb-3"
            style={{ background: 'rgba(108, 92, 231, 0.08)' }}
          >
            <div className="text-xs font-semibold text-[#6c5ce7] mb-2">🔥 Preferências</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[#636e72]">📅 {lead.day_pref}</span>
                <span className="text-[#636e72]">•</span>
                <span className="text-[#636e72]">🕐 {lead.time_pref}</span>
              </div>
              <div className="text-[#636e72]">❤️ {lead.fav_product}</div>
            </div>
          </div>
        ) : (
          <div 
            className="p-3 rounded-lg mb-3 text-center"
            style={{ background: 'rgba(150, 150, 150, 0.08)' }}
          >
            <p className="text-xs text-[#636e72]">⏳ Preferências não informadas</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-3 border-t border-black/5">
        <SoftButton 
          variant="whatsapp" 
          onClick={() => onSendCoupon(lead)}
          style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
        >
          <i className="fas fa-paper-plane mr-2"></i>
          Enviar 80%
        </SoftButton>
        
        <div className="flex gap-2">
          <SoftButton 
            onClick={() => onViewDetails(lead)}
            style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
          >
            <i className="fas fa-eye"></i>
          </SoftButton>
          <SoftButton 
            variant="primary"
            onClick={() => onSendRemarketing(lead)}
            style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
            title="Enviar notificação de remarketing"
          >
            <i className="fas fa-bullhorn"></i>
          </SoftButton>
        </div>
      </div>
    </div>
  );
}