import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseHelper } from '@/components/utils/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import SoftCard from '@/components/ui/SoftCard';
import SoftButton from '@/components/ui/SoftButton';
import SoftInput from '@/components/ui/SoftInput';
import { format } from 'date-fns';
import LeadAnalyticsReport from '@/components/reports/LeadAnalyticsReport';
import SmartRemarketingModal from '@/components/modals/SmartRemarketingModal';

export default function LeadsManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [restaurant, setRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPrize, setFilterPrize] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [customDiscount, setCustomDiscount] = useState('50% OFF');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSmartRemarketing, setShowSmartRemarketing] = useState(false);
  const [selectedLeadForSmart, setSelectedLeadForSmart] = useState(null);

  useEffect(() => {
    const restData = sessionStorage.getItem('currentRestaurant');
    if (!restData) {
      navigate(createPageUrl('Home'));
      return;
    }
    setRestaurant(JSON.parse(restData));
  }, [navigate]);

  const { data: leads = [] } = useQuery({
    queryKey: ['restaurant-leads', restaurant?.id],
    queryFn: () => supabaseHelper.Lead.filter({ restaurant_id: restaurant?.id }),
    enabled: !!restaurant?.id
  });

  const { data: prizes = [] } = useQuery({
    queryKey: ['prizes', restaurant?.id],
    queryFn: () => supabaseHelper.Prize.filter({ restaurant_id: restaurant?.id }),
    enabled: !!restaurant?.id
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => supabaseHelper.Lead.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['restaurant-leads']),
    onError: (error) => alert(`Erro: ${error.message}`)
  });

  const goBack = () => {
    navigate(createPageUrl('RestaurantDashboard'));
  };

  const getFilteredAndSortedLeads = () => {
    let filtered = [...leads];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.prize?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'contacted') {
        filtered = filtered.filter(lead => lead.sent_by_admin === true);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(lead => lead.sent_by_admin !== true);
      }
    }

    // Filter by prize
    if (filterPrize !== 'all') {
      filtered = filtered.filter(lead => lead.prize === filterPrize);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === '-created_date') {
        return new Date(b.created_date) - new Date(a.created_date);
      } else if (sortBy === 'created_date') {
        return new Date(a.created_date) - new Date(b.created_date);
      } else if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === '-name') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });

    return filtered;
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const selectAll = () => {
    const allIds = getFilteredAndSortedLeads().map(lead => lead.id);
    setSelectedLeads(allIds);
  };

  const deselectAll = () => {
    setSelectedLeads([]);
  };

  const sendCoupons = () => {
    if (selectedLeads.length === 0) {
      alert('Selecione pelo menos um lead');
      return;
    }
    setShowCouponModal(true);
  };

  const confirmSendCoupons = () => {
    const selectedLeadData = leads.filter(lead => selectedLeads.includes(lead.id));
    
    selectedLeadData.forEach(lead => {
      const message = `Olá ${lead.name}! 🎉\n\nParabéns por participar da nossa roleta!\n\nEstamos com uma PROMOÇÃO ESPECIAL para você: *${customDiscount}* em qualquer pedido!\n\nGostaria de fazer seu pedido agora? 😋`;
      
      const url = `https://wa.me/55${lead.phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      
      // Mark as contacted
      updateLeadMutation.mutate({ 
        id: lead.id, 
        data: { sent_by_admin: true } 
      });
    });
    
    setShowCouponModal(false);
    setSelectedLeads([]);
  };

  const handleSmartRemarketing = (lead) => {
    setSelectedLeadForSmart(lead);
    setShowSmartRemarketing(true);
  };

  const sendSmartWhatsApp = (message) => {
    if (selectedLeadForSmart) {
      const url = `https://wa.me/55${selectedLeadForSmart.phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      
      updateLeadMutation.mutate({ 
        id: selectedLeadForSmart.id, 
        data: { sent_by_admin: true } 
      });
      
      setShowSmartRemarketing(false);
      setSelectedLeadForSmart(null);
    }
  };

  const uniquePrizes = [...new Set(leads.map(lead => lead.prize).filter(Boolean))];
  const filteredLeads = getFilteredAndSortedLeads();

  return (
    <div className="min-h-screen p-6" style={{ background: '#f8faff' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2d3436]">Gerenciamento de Leads</h2>
            <p className="text-[#636e72] text-sm mt-1">{restaurant?.name}</p>
          </div>
          <div className="flex gap-2">
            <SoftButton onClick={() => setShowReport(!showReport)} variant={showReport ? 'primary' : 'default'}>
              <i className="fas fa-chart-bar mr-2"></i> {showReport ? 'Ocultar' : 'Exibir'} Relatório
            </SoftButton>
            <SoftButton onClick={goBack}>
              <i className="fas fa-arrow-left mr-2"></i> Voltar
            </SoftButton>
          </div>
        </div>

        {/* Analytics Report */}
        {showReport && (
          <div className="mb-6">
            <LeadAnalyticsReport leads={leads} />
          </div>
        )}

        {/* Filters */}
        <SoftCard className="mb-6">
          <h3 className="font-semibold text-[#2d3436] mb-4">Filtros e Busca</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <SoftInput
              placeholder="Buscar por nome, telefone ou prêmio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-none"
              style={{
                background: '#eef2f5',
                boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
                color: '#2d3436',
                outline: 'none'
              }}
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="contacted">Contatados</option>
            </select>

            <select
              value={filterPrize}
              onChange={(e) => setFilterPrize(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-none"
              style={{
                background: '#eef2f5',
                boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
                color: '#2d3436',
                outline: 'none'
              }}
            >
              <option value="all">Todos os Prêmios</option>
              {uniquePrizes.map(prize => (
                <option key={prize} value={prize}>{prize}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-none"
              style={{
                background: '#eef2f5',
                boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
                color: '#2d3436',
                outline: 'none'
              }}
            >
              <option value="-created_date">Mais Recentes</option>
              <option value="created_date">Mais Antigos</option>
              <option value="name">Nome (A-Z)</option>
              <option value="-name">Nome (Z-A)</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-[#636e72] text-sm">
              {filteredLeads.length} lead(s) encontrado(s)
            </span>
            <span className="text-[#636e72] mx-2">•</span>
            <SoftButton onClick={selectAll} style={{ padding: '5px 15px', fontSize: '0.8rem' }}>
              Selecionar Todos
            </SoftButton>
            <SoftButton onClick={deselectAll} style={{ padding: '5px 15px', fontSize: '0.8rem' }}>
              Desmarcar Todos
            </SoftButton>
          </div>
        </SoftCard>

        {/* Actions */}
        {selectedLeads.length > 0 && (
          <SoftCard className="mb-6" style={{ background: 'rgba(108, 92, 231, 0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-[#2d3436]">
                  {selectedLeads.length} lead(s) selecionado(s)
                </h4>
                <p className="text-[#636e72] text-sm">Pronto para enviar cupons promocionais</p>
              </div>
              <SoftButton variant="whatsapp" onClick={sendCoupons}>
                <i className="fab fa-whatsapp mr-2"></i> Enviar Cupons
              </SoftButton>
            </div>
          </SoftCard>
        )}

        {/* Leads Table */}
        <SoftCard>
          <div 
            className="overflow-x-auto rounded-[15px] p-2.5"
            style={{
              boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
              background: '#eef2f5'
            }}
          >
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={() => selectedLeads.length === filteredLeads.length ? deselectAll() : selectAll()}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Nome</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">WhatsApp</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Prêmio</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Preferências</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Data</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Status</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className={selectedLeads.includes(lead.id) ? 'bg-blue-50' : ''}>
                    <td className="p-4 border-b border-black/5">
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="p-4 border-b border-black/5 font-medium">{lead.name}</td>
                    <td className="p-4 border-b border-black/5">{lead.phone}</td>
                    <td className="p-4 border-b border-black/5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        {lead.prize}
                      </span>
                    </td>
                    <td className="p-4 border-b border-black/5 text-sm text-[#636e72]">
                      {lead.day_pref && lead.time_pref ? (
                        <div>
                          <div>{lead.day_pref} - {lead.time_pref}</div>
                          <div className="text-xs">{lead.fav_product}</div>
                        </div>
                      ) : (
                        <span className="text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 border-b border-black/5 text-sm">
                      {lead.created_date ? format(new Date(lead.created_date), 'dd/MM/yyyy HH:mm') : '—'}
                    </td>
                    <td className="p-4 border-b border-black/5">
                      <span 
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          background: lead.sent_by_admin ? 'rgba(0, 184, 148, 0.15)' : 'rgba(253, 203, 110, 0.2)', 
                          color: lead.sent_by_admin ? '#00b894' : '#fdcb6e' 
                        }}
                      >
                        {lead.sent_by_admin ? 'Contatado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-4 border-b border-black/5">
                      <SoftButton 
                        variant="whatsapp" 
                        onClick={() => handleSmartRemarketing(lead)}
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                        title="Remarketing Inteligente com IA"
                      >
                        <i className="fab fa-whatsapp"></i>
                      </SoftButton>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-[#636e72]">
                      Nenhum lead encontrado com os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SoftCard>
      </div>

      {/* Coupon Modal */}
      {showCouponModal && (
        <div 
          className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div 
            className="w-[95%] max-w-[500px] p-[30px] rounded-[20px] bg-white"
            style={{
              boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
              animation: 'scaleUp 0.3s ease'
            }}
          >
            <h3 className="mb-4 text-[#2d3436] font-semibold">Enviar Cupom Promocional</h3>
            
            <p className="text-[#636e72] mb-4 text-sm">
              Enviar cupom para {selectedLeads.length} lead(s) selecionado(s)
            </p>

            <label className="block mb-2 text-sm font-medium text-[#2d3436]">Desconto</label>
            <SoftInput
              placeholder="Ex: 50% OFF, R$ 20 OFF, etc."
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              className="mb-4"
            />

            <div className="p-3 rounded-lg mb-4" style={{ background: '#f0f0f0' }}>
              <p className="text-xs text-[#636e72] mb-2">Pré-visualização da mensagem:</p>
              <p className="text-sm text-[#2d3436]">
                Olá [Nome]! 🎉<br/>
                Parabéns por participar da nossa roleta!<br/>
                Estamos com uma PROMOÇÃO ESPECIAL para você: <strong>{customDiscount}</strong> em qualquer pedido!<br/>
                Gostaria de fazer seu pedido agora? 😋
              </p>
            </div>

            <div className="flex gap-3">
              <SoftButton onClick={() => setShowCouponModal(false)} className="flex-1">
                Cancelar
              </SoftButton>
              <SoftButton variant="whatsapp" onClick={confirmSendCoupons} className="flex-1">
                <i className="fab fa-whatsapp mr-2"></i> Enviar
              </SoftButton>
            </div>
          </div>
          <style>{`
            @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}

      {/* Smart Remarketing Modal */}
      <SmartRemarketingModal 
        show={showSmartRemarketing}
        lead={selectedLeadForSmart}
        onSend={sendSmartWhatsApp}
        onClose={() => { 
          setShowSmartRemarketing(false); 
          setSelectedLeadForSmart(null); 
        }} 
      />

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
    </div>
  );
}