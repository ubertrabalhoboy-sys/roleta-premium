import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import SoftCard from '@/components/ui/SoftCard';
import SoftButton from '@/components/ui/SoftButton';
import StatCard from '@/components/dashboard/StatCard';
import NewRestaurantModal from '@/components/modals/NewRestaurantModal';
import FoodOptionsModal from '@/components/modals/FoodOptionsModal';
import GlobalLeadsModal from '@/components/modals/GlobalLeadsModal';
import WhatsAppModal from '@/components/modals/WhatsAppModal';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showNewRestaurant, setShowNewRestaurant] = useState(false);
  const [showFoodOptions, setShowFoodOptions] = useState(false);
  const [showGlobalLeads, setShowGlobalLeads] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    const userType = sessionStorage.getItem('userType');
    if (userType !== 'super_admin') {
      navigate(createPageUrl('Home'));
    }
  }, [navigate]);

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list()
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['all-leads'],
    queryFn: () => base44.entities.Lead.list()
  });

  const { data: foodOptions = [] } = useQuery({
    queryKey: ['food-options'],
    queryFn: () => base44.entities.FoodOption.list()
  });

  const createRestaurantMutation = useMutation({
    mutationFn: (data) => base44.entities.Restaurant.create({
      ...data,
      status: 'active',
      metrics_access: 0,
      metrics_spins: 0,
      metrics_leads: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['restaurants']);
      setShowNewRestaurant(false);
    }
  });

  const toggleRestaurantMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Restaurant.update(id, { 
      status: status === 'active' ? 'paused' : 'active' 
    }),
    onSuccess: () => queryClient.invalidateQueries(['restaurants'])
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: (id) => base44.entities.Restaurant.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['restaurants'])
  });

  const addFoodOptionMutation = useMutation({
    mutationFn: (name) => base44.entities.FoodOption.create({ name }),
    onSuccess: () => queryClient.invalidateQueries(['food-options'])
  });

  const removeFoodOptionMutation = useMutation({
    mutationFn: (id) => base44.entities.FoodOption.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['food-options'])
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['all-leads'])
  });

  const logout = () => {
    sessionStorage.removeItem('userType');
    navigate(createPageUrl('Home'));
  };

  const simulateClientView = (restaurant) => {
    sessionStorage.setItem('simulatedRestaurant', JSON.stringify(restaurant));
    navigate(createPageUrl('ClientRoleta'));
  };

  const handleSendCoupon = (lead) => {
    setSelectedLead(lead);
    setShowWhatsApp(true);
  };

  const sendWhatsApp = (message) => {
    if (selectedLead) {
      const url = `https://wa.me/55${selectedLead.phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      updateLeadMutation.mutate({ id: selectedLead.id, data: { sent_by_admin: true } });
      setShowWhatsApp(false);
      setSelectedLead(null);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#f8faff' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-[#2d3436]">Painel Super Admin</h2>
          <div className="flex gap-2.5 flex-wrap">
            <SoftButton onClick={() => setShowFoodOptions(true)}>
              <i className="fas fa-utensils mr-2"></i> Opções Comida
            </SoftButton>
            <SoftButton onClick={() => setShowGlobalLeads(true)}>
              <i className="fas fa-list mr-2"></i> Leads Globais (CRM)
            </SoftButton>
            <SoftButton variant="danger" onClick={logout}>
              Sair
            </SoftButton>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <StatCard icon="fas fa-store" value={restaurants.length} label="Restaurantes" />
          <StatCard icon="fas fa-users" value={leads.length} label="Leads Globais" />
        </div>

        {/* Restaurants Table */}
        <SoftCard>
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-lg text-[#2d3436]">Gestão de Restaurantes</h3>
            <SoftButton variant="primary" onClick={() => setShowNewRestaurant(true)}>
              <i className="fas fa-plus mr-2"></i> Novo
            </SoftButton>
          </div>
          
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
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Restaurante</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Link</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Status</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Ações</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((rest) => (
                  <tr key={rest.id}>
                    <td className="p-4 border-b border-black/5 font-medium">{rest.name}</td>
                    <td className="p-4 border-b border-black/5 text-[#636e72]">/r/{rest.slug}</td>
                    <td className="p-4 border-b border-black/5">
                      <span 
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          background: rest.status === 'active' ? 'rgba(0, 184, 148, 0.15)' : 'rgba(253, 203, 110, 0.2)', 
                          color: rest.status === 'active' ? '#00b894' : '#fdcb6e' 
                        }}
                      >
                        {rest.status === 'active' ? 'Ativo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="p-4 border-b border-black/5">
                      <div className="flex gap-2">
                        <SoftButton 
                          onClick={() => simulateClientView(rest)}
                          style={{ padding: '5px 10px' }}
                        >
                          <i className="fas fa-eye"></i>
                        </SoftButton>
                        <SoftButton 
                          variant={rest.status === 'active' ? 'warning' : 'primary'}
                          onClick={() => toggleRestaurantMutation.mutate({ id: rest.id, status: rest.status })}
                          style={{ padding: '5px 10px' }}
                        >
                          <i className={`fas fa-${rest.status === 'active' ? 'pause' : 'play'}`}></i>
                        </SoftButton>
                        <SoftButton 
                          variant="danger"
                          onClick={() => {
                            if (confirm('Excluir restaurante?')) {
                              deleteRestaurantMutation.mutate(rest.id);
                            }
                          }}
                          style={{ padding: '5px 10px' }}
                        >
                          <i className="fas fa-trash"></i>
                        </SoftButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SoftCard>
      </div>

      {/* Modals */}
      <NewRestaurantModal 
        show={showNewRestaurant}
        onSave={(data) => createRestaurantMutation.mutate(data)}
        onClose={() => setShowNewRestaurant(false)} 
      />
      <FoodOptionsModal 
        show={showFoodOptions}
        foodOptions={foodOptions}
        onAdd={(name) => addFoodOptionMutation.mutate(name)}
        onRemove={(id) => removeFoodOptionMutation.mutate(id)}
        onClose={() => setShowFoodOptions(false)} 
      />
      <GlobalLeadsModal 
        show={showGlobalLeads}
        leads={[...leads].reverse()}
        restaurants={restaurants}
        onSendCoupon={handleSendCoupon}
        onClose={() => setShowGlobalLeads(false)} 
      />
      <WhatsAppModal 
        show={showWhatsApp}
        clientName={selectedLead?.name}
        clientPhone={selectedLead?.phone}
        favProduct={selectedLead?.fav_product}
        onSend={sendWhatsApp}
        onClose={() => { setShowWhatsApp(false); setSelectedLead(null); }} 
      />

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet" />
    </div>
  );
}