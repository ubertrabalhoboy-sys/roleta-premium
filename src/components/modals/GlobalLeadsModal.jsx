import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import SoftButton from '../ui/SoftButton';
import SoftInput from '../ui/SoftInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LeadDetailsModal from './LeadDetailsModal';
import { base44 } from '@/api/base44Client';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function GlobalLeadsModal({ show, leads = [], restaurants = [], onSendCoupon, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrizeFilter, setSelectedPrizeFilter] = useState('all');
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState(null);

  const uniquePrizes = useMemo(() => {
    const prizes = [...new Set(leads.map(l => l.prize).filter(Boolean))];
    return prizes;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm);
      
      const matchesPrize = selectedPrizeFilter === 'all' || lead.prize === selectedPrizeFilter;
      const matchesRestaurant = selectedRestaurantFilter === 'all' || lead.restaurant_id === selectedRestaurantFilter;
      
      return matchesSearch && matchesPrize && matchesRestaurant;
    });
  }, [leads, searchTerm, selectedPrizeFilter, selectedRestaurantFilter]);

  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads];
    sorted.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'date') {
        const dateA = new Date(a.created_date || 0);
        const dateB = new Date(b.created_date || 0);
        compareValue = dateA - dateB;
      } else if (sortBy === 'name') {
        compareValue = (a.name || '').localeCompare(b.name || '');
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
    return sorted;
  }, [filteredLeads, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (lead) => {
    setSelectedLeadForDetails(lead);
    setShowLeadDetails(true);
  };

  const handleSendRemarketing = async (lead) => {
    const restaurant = restaurants.find(r => r.id === lead.restaurant_id);
    if (!restaurant) return;

    await base44.entities.Notification.create({
      restaurant_id: restaurant.id,
      type: 'hot_lead',
      title: '🔥 Cliente Quente para Remarketing',
      message: `O cliente ${lead.name} (${lead.phone}) está pronto para uma promoção de remarketing! Produto favorito: ${lead.fav_product || 'não informado'}. Dia preferido: ${lead.day_pref || 'não informado'}.`,
      priority: 'high',
      read: false,
      metadata: {
        lead_id: lead.id,
        lead_name: lead.name,
        lead_phone: lead.phone,
        lead_prize: lead.prize,
        remarketing: true
      }
    });

    alert(`Notificação de remarketing enviada para ${restaurant.name}!`);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 inline ml-1" />;
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-3 h-3 inline ml-1" /> : 
      <ArrowDown className="w-3 h-3 inline ml-1" />;
  };

  const getRestName = (restId) => {
    const rest = restaurants.find(r => r.id === restId);
    return rest?.name || '?';
  };

  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[95%] max-w-[1200px] p-[30px] rounded-[20px] bg-white max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[#2d3436] font-semibold">CRM Estratégico (Admin Geral)</h3>
          <SoftButton onClick={onClose}>Fechar</SoftButton>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <SoftInput
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select value={selectedRestaurantFilter} onValueChange={setSelectedRestaurantFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Restaurante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Restaurantes</SelectItem>
              {restaurants.map(rest => (
                <SelectItem key={rest.id} value={rest.id}>{rest.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPrizeFilter} onValueChange={setSelectedPrizeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Prêmio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Prêmios</SelectItem>
              {uniquePrizes.map(prize => (
                <SelectItem key={prize} value={prize}>{prize}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-[#636e72] mb-3">
          Mostrando {sortedLeads.length} de {leads.length} leads
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
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Restaurante</th>
                <th 
                  className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5 cursor-pointer hover:text-[#6c5ce7]"
                  onClick={() => handleSort('name')}
                >
                  Cliente {getSortIcon('name')}
                </th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Prêmio</th>
                <th 
                  className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5 cursor-pointer hover:text-[#6c5ce7]"
                  onClick={() => handleSort('date')}
                >
                  Data Criação {getSortIcon('date')}
                </th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Preferências</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Status</th>
                <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map((lead, idx) => (
                <tr key={idx}>
                  <td className="p-4 border-b border-black/5 font-medium text-sm">
                    {getRestName(lead.restaurant_id)}
                  </td>
                  <td className="p-4 border-b border-black/5">
                    <div className="font-medium">{lead.name}</div>
                    <small className="text-[#636e72]">{lead.phone}</small>
                  </td>
                  <td className="p-4 border-b border-black/5">
                    <span className="text-sm">{lead.prize || '-'}</span>
                  </td>
                  <td className="p-4 border-b border-black/5">
                    <span className="text-sm">
                      {lead.created_date ? format(new Date(lead.created_date), 'dd/MM/yyyy HH:mm') : '-'}
                    </span>
                  </td>
                  <td className="p-4 border-b border-black/5">
                    {lead.day_pref ? (
                      <small>
                        {lead.day_pref} / {lead.time_pref}<br />
                        ❤️ {lead.fav_product}
                      </small>
                    ) : (
                      <small className="text-[#636e72]">Não informado</small>
                    )}
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
                    <div className="flex gap-2 flex-wrap">
                      <SoftButton 
                        variant="whatsapp" 
                        onClick={() => onSendCoupon(lead)}
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                      >
                        Enviar 80%
                      </SoftButton>
                      <SoftButton 
                        onClick={() => handleViewDetails(lead)}
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                      >
                        <i className="fas fa-eye mr-1"></i> Detalhes
                      </SoftButton>
                      <SoftButton 
                        variant="primary"
                        onClick={() => handleSendRemarketing(lead)}
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                        title="Enviar notificação de remarketing ao restaurante"
                      >
                        <i className="fas fa-bullhorn mr-1"></i> Remarketing
                      </SoftButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDetailsModal 
        show={showLeadDetails}
        lead={selectedLeadForDetails}
        restaurant={restaurants.find(r => r.id === selectedLeadForDetails?.restaurant_id)}
        onClose={() => {
          setShowLeadDetails(false);
          setSelectedLeadForDetails(null);
        }}
      />

      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}