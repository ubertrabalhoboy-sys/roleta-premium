import React from 'react';
import { format } from 'date-fns';
import SoftButton from '../ui/SoftButton';
import SoftCard from '../ui/SoftCard';

export default function LeadDetailsModal({ show, lead, restaurant, onClose }) {
  if (!show || !lead) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3500]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[95%] max-w-[600px] p-[30px] rounded-[20px] bg-white max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[#2d3436] font-semibold text-xl">
            <i className="fas fa-user-circle mr-2"></i>
            Detalhes do Lead
          </h3>
          <SoftButton onClick={onClose}>
            <i className="fas fa-times"></i>
          </SoftButton>
        </div>

        <div className="space-y-4">
          {/* Informações Básicas */}
          <SoftCard>
            <h4 className="font-semibold text-[#2d3436] mb-3 flex items-center">
              <i className="fas fa-info-circle mr-2 text-[#6c5ce7]"></i>
              Informações Básicas
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#636e72]">Nome:</span>
                <span className="font-medium">{lead.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#636e72]">WhatsApp:</span>
                <span className="font-medium">{lead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#636e72]">Restaurante:</span>
                <span className="font-medium">{restaurant?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#636e72]">Data de Criação:</span>
                <span className="font-medium">
                  {lead.created_date ? format(new Date(lead.created_date), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </span>
              </div>
            </div>
          </SoftCard>

          {/* Prêmio */}
          <SoftCard>
            <h4 className="font-semibold text-[#2d3436] mb-3 flex items-center">
              <i className="fas fa-gift mr-2 text-[#fdcb6e]"></i>
              Prêmio Ganho
            </h4>
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🎁</div>
              <div className="text-xl font-bold text-[#6c5ce7]">
                {lead.prize || 'Não informado'}
              </div>
            </div>
          </SoftCard>

          {/* Preferências */}
          <SoftCard>
            <h4 className="font-semibold text-[#2d3436] mb-3 flex items-center">
              <i className="fas fa-heart mr-2 text-[#d63031]"></i>
              Preferências do Cliente
            </h4>
            {lead.day_pref || lead.time_pref || lead.fav_product ? (
              <div className="space-y-2">
                {lead.day_pref && (
                  <div className="flex justify-between">
                    <span className="text-[#636e72]">Dia Preferido:</span>
                    <span className="font-medium">{lead.day_pref}</span>
                  </div>
                )}
                {lead.time_pref && (
                  <div className="flex justify-between">
                    <span className="text-[#636e72]">Horário Preferido:</span>
                    <span className="font-medium">{lead.time_pref}</span>
                  </div>
                )}
                {lead.fav_product && (
                  <div className="flex justify-between">
                    <span className="text-[#636e72]">Produto Favorito:</span>
                    <span className="font-medium">❤️ {lead.fav_product}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-[#636e72]">
                <i className="fas fa-exclamation-circle mb-2 text-2xl"></i>
                <div>Nenhuma preferência informada</div>
              </div>
            )}
          </SoftCard>

          {/* Status */}
          <SoftCard>
            <h4 className="font-semibold text-[#2d3436] mb-3 flex items-center">
              <i className="fas fa-flag mr-2 text-[#00b894]"></i>
              Status do Lead
            </h4>
            <div className="flex justify-center">
              <span 
                className="px-4 py-2 rounded-full text-sm font-semibold"
                style={{ 
                  background: lead.sent_by_admin ? 'rgba(0, 184, 148, 0.15)' : 'rgba(214, 48, 49, 0.15)', 
                  color: lead.sent_by_admin ? '#00b894' : '#d63031' 
                }}
              >
                {lead.sent_by_admin ? '✓ Cupom Enviado pelo Admin' : '⏳ Cupom Pendente'}
              </span>
            </div>
          </SoftCard>

          {/* Ação Rápida */}
          <div className="flex justify-center pt-2">
            <SoftButton 
              variant="whatsapp"
              onClick={() => {
                const url = `https://wa.me/55${lead.phone}`;
                window.open(url, '_blank');
              }}
              style={{ width: '100%' }}
            >
              <i className="fab fa-whatsapp mr-2"></i>
              Abrir WhatsApp
            </SoftButton>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}