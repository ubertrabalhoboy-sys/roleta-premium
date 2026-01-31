import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseHelper } from '@/components/utils/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { format, subDays } from 'date-fns';
import SoftCard from '@/components/ui/SoftCard';
import SoftButton from '@/components/ui/SoftButton';
import StatCard from '@/components/dashboard/StatCard';
import NewRestaurantModal from '@/components/modals/NewRestaurantModal';
import FoodOptionsModal from '@/components/modals/FoodOptionsModal';
import GlobalLeadsModal from '@/components/modals/GlobalLeadsModal';
import WhatsAppModal from '@/components/modals/WhatsAppModal';
import MetricsChart from '@/components/charts/MetricsChart';
import ConversionChart from '@/components/charts/ConversionChart';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showNewRestaurant, setShowNewRestaurant] = useState(false);
  const [showFoodOptions, setShowFoodOptions] = useState(false);
  const [showGlobalLeads, setShowGlobalLeads] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [chartType, setChartType] = useState('area');

  useEffect(() => {
    const userType = sessionStorage.getItem('userType');
    if (userType !== 'super_admin') {
      navigate(createPageUrl('Home'));
    }
  }, [navigate]);

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => supabaseHelper.Restaurant.list()
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['all-leads'],
    queryFn: () => supabaseHelper.Lead.list()
  });

  const { data: foodOptions = [] } = useQuery({
    queryKey: ['food-options'],
    queryFn: () => supabaseHelper.FoodOption.list()
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['all-metrics'],
    queryFn: () => supabaseHelper.Metric.list()
  });

  const { data: prizes = [] } = useQuery({
    queryKey: ['all-prizes'],
    queryFn: () => supabaseHelper.Prize.list()
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data) => {
      // Passo 1: Criar usuário no Supabase Auth PRIMEIRO
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      // Passo 2: Validação - Se erro, parar tudo
      if (authError) {
        alert('Erro ao criar login: ' + authError.message);
        throw authError;
      }

      if (!authData.user) {
        alert('Erro: Usuário não foi criado no sistema de autenticação');
        throw new Error('Usuário não foi criado');
      }

      // Passo 3: Agora sim, criar o restaurante com o owner_id
      const novoUserId = authData.user.id;
      
      const { data: restaurant, error: dbError } = await supabase
        .from('restaurant')
        .insert([{
          id: crypto.randomUUID(),
          name: data.name,
          slug: data.slug,
          owner_email: data.email,
          owner_id: novoUserId,
          color: data.color,
          status: 'active',
          metrics_access: 0,
          metrics_spins: 0,
          metrics_leads: 0,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (dbError) {
        alert('Erro ao salvar restaurante no banco: ' + dbError.message);
        throw dbError;
      }
      
      return restaurant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['restaurants']);
      setShowNewRestaurant(false);
      alert('✅ Restaurante criado com sucesso! Usuário registrado no Auth e restaurante salvo no banco.');
    },
    onError: (error) => {
      console.error('Erro completo:', error);
    }
  });

  const toggleRestaurantMutation = useMutation({
    mutationFn: ({ id, status }) => supabaseHelper.Restaurant.update(id, { 
      status: status === 'active' ? 'paused' : 'active' 
    }),
    onSuccess: () => queryClient.invalidateQueries(['restaurants']),
    onError: (error) => alert(`Erro: ${error.message}`)
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: (id) => supabaseHelper.Restaurant.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['restaurants']),
    onError: (error) => alert(`Erro: ${error.message}`)
  });

  const addFoodOptionMutation = useMutation({
    mutationFn: (name) => supabaseHelper.FoodOption.create({ name }),
    onSuccess: () => queryClient.invalidateQueries(['food-options']),
    onError: (error) => alert(`Erro: ${error.message}`)
  });

  const removeFoodOptionMutation = useMutation({
    mutationFn: (id) => supabaseHelper.FoodOption.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['food-options']),
    onError: (error) => alert(`Erro: ${error.message}`)
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => supabaseHelper.Lead.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['all-leads']),
    onError: (error) => alert(`Erro: ${error.message}`)
  });

  const deleteAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      const allNotifications = await supabaseHelper.Notification.list();
      await Promise.all(allNotifications.map(n => supabaseHelper.Notification.delete(n.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      alert('Todas as notificações foram apagadas com sucesso!');
    },
    onError: (error) => alert(`Erro: ${error.message}`)
  });

  const logout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('currentRestaurant');
    navigate(createPageUrl('Home'));
  };

  const simulateClientView = (restaurant) => {
    const url = `${window.location.origin}${createPageUrl('ClientRoleta')}?slug=${restaurant.slug}`;
    window.open(url, '_blank');
  };

  const handleSendCoupon = (lead) => {
    setSelectedLead(lead);
    setSelectedRestaurant(restaurants.find(r => r.id === lead.restaurant_id));
    setShowWhatsApp(true);
  };

  const exportGlobalReport = () => {
    const reportData = {
      data_geracao: format(new Date(), 'dd/MM/yyyy HH:mm'),
      total_restaurantes: restaurants.length,
      total_leads: leads.length,
      restaurantes: restaurants.map(rest => {
        const restLeads = leads.filter(l => l.restaurant_id === rest.id);
        return {
          nome: rest.name,
          slug: rest.slug,
          status: rest.status,
          acessos: rest.metrics_access || 0,
          giros: rest.metrics_spins || 0,
          leads: restLeads.length,
          conversao: rest.metrics_access > 0 ? ((restLeads.length / rest.metrics_access) * 100).toFixed(1) + '%' : '0%'
        };
      })
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-global-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  const generateGlobalChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayMetrics = metrics.filter(m => m.date === dateStr);
      
      const totalAccess = dayMetrics.reduce((sum, m) => sum + (m.access || 0), 0);
      const totalSpins = dayMetrics.reduce((sum, m) => sum + (m.spins || 0), 0);
      const totalLeads = dayMetrics.reduce((sum, m) => sum + (m.leads || 0), 0);
      
      return {
        date: format(date, 'dd/MM'),
        access: totalAccess,
        spins: totalSpins,
        leads: totalLeads,
        conversion_rate: totalAccess > 0 ? (totalLeads / totalAccess) * 100 : 0
      };
    });
    return last7Days;
  };

  const generateRestaurantChartData = (restaurantId) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayMetric = metrics.find(m => m.date === dateStr && m.restaurant_id === restaurantId);
      
      return {
        date: format(date, 'dd/MM'),
        access: dayMetric?.access || 0,
        spins: dayMetric?.spins || 0,
        leads: dayMetric?.leads || 0,
        conversion_rate: dayMetric?.conversion_rate || 0
      };
    });
    return last7Days;
  };

  const globalChartData = generateGlobalChartData();
  const totalAccess = restaurants.reduce((sum, r) => sum + (r.metrics_access || 0), 0);
  const totalSpins = restaurants.reduce((sum, r) => sum + (r.metrics_spins || 0), 0);

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
            <SoftButton variant="export" onClick={exportGlobalReport}>
              <i className="fas fa-file-download mr-2"></i> Relatório Global
            </SoftButton>
            <SoftButton 
              variant="danger" 
              onClick={() => {
                if (confirm('Apagar TODAS as notificações do sistema?')) {
                  deleteAllNotificationsMutation.mutate();
                }
              }}
            >
              <i className="fas fa-bell-slash mr-2"></i> Limpar Notificações
            </SoftButton>
            <SoftButton variant="danger" onClick={logout}>
              Sair
            </SoftButton>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard icon="fas fa-store" value={restaurants.length} label="Restaurantes" />
          <StatCard icon="fas fa-users" value={leads.length} label="Leads Globais" />
          <StatCard icon="fas fa-eye" value={totalAccess} label="Acessos Totais" />
          <StatCard icon="fas fa-dice" value={totalSpins} label="Giros Totais" />
        </div>

        {/* Global Charts */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#2d3436]">
              {selectedRestaurant ? `Desempenho: ${selectedRestaurant.name}` : 'Desempenho Global (últimos 7 dias)'}
            </h3>
            <div className="flex gap-2">
              {selectedRestaurant && (
                <SoftButton 
                  onClick={() => setSelectedRestaurant(null)}
                  style={{ padding: '5px 15px', fontSize: '0.8rem' }}
                >
                  Ver Global
                </SoftButton>
              )}
              <SoftButton 
                variant={chartType === 'line' ? 'primary' : 'default'}
                onClick={() => setChartType('line')}
                style={{ padding: '5px 15px', fontSize: '0.8rem' }}
              >
                Linha
              </SoftButton>
              <SoftButton 
                variant={chartType === 'area' ? 'primary' : 'default'}
                onClick={() => setChartType('area')}
                style={{ padding: '5px 15px', fontSize: '0.8rem' }}
              >
                Área
              </SoftButton>
              <SoftButton 
                variant={chartType === 'bar' ? 'primary' : 'default'}
                onClick={() => setChartType('bar')}
                style={{ padding: '5px 15px', fontSize: '0.8rem' }}
              >
                Barra
              </SoftButton>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <MetricsChart 
              data={selectedRestaurant ? generateRestaurantChartData(selectedRestaurant.id) : globalChartData} 
              title="Acessos, Giros e Leads" 
              type={chartType} 
            />
            <ConversionChart 
              data={selectedRestaurant ? generateRestaurantChartData(selectedRestaurant.id) : globalChartData}
              type={chartType}
            />
          </div>
        </div>

        {/* Prize Stock Overview */}
        <SoftCard className="mb-6">
          <h3 className="font-semibold text-lg text-[#2d3436] mb-4">
            <i className="fas fa-gift mr-2 text-[#6c5ce7]"></i>
            Estoque de Prêmios (Todos Restaurantes)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map(rest => {
              const restPrizes = prizes.filter(p => p.restaurant_id === rest.id);
              if (restPrizes.length === 0) return null;

              return (
                <div key={rest.id} className="p-4 rounded-lg" style={{ background: '#f8faff', border: '1px solid #e0e6f0' }}>
                  <h4 className="font-semibold text-sm text-[#2d3436] mb-2">{rest.name}</h4>
                  <div className="space-y-1 text-xs">
                    {restPrizes.map(prize => {
                      const remaining = prize.limit_count ? (prize.limit_count - (prize.current_count || 0)) : '∞';
                      const isLow = prize.limit_count && remaining <= 3 && remaining > 0;
                      const isEmpty = remaining === 0;
                      const tierEmoji = { common: '⚪', rare: '🔵', epic: '🟣' }[prize.tier || 'common'];

                      return (
                        <div key={prize.id} className={`flex justify-between items-center ${isEmpty ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-[#636e72]'}`}>
                          <span>{tierEmoji} {prize.name}</span>
                          <span className="font-semibold">{remaining}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </SoftCard>

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
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Webhook Fiqon</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Métricas</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Status</th>
                  <th className="p-4 text-left text-[#636e72] text-xs font-semibold uppercase border-b border-black/5">Ações</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((rest) => {
                  const restLeads = leads.filter(l => l.restaurant_id === rest.id);
                  const conversion = rest.metrics_access > 0 ? ((restLeads.length / rest.metrics_access) * 100).toFixed(1) : '0';
                  
                  return (
                    <tr key={rest.id} className="hover:bg-gray-50">
                      <td className="p-4 border-b border-black/5 font-medium">{rest.name}</td>
                      <td className="p-4 border-b border-black/5 text-[#636e72]">/r/{rest.slug}</td>
                      <td className="p-4 border-b border-black/5">
                        <input
                          type="text"
                          placeholder="URL do webhook Fiqon"
                          value={rest.webhook_url || ''}
                          onChange={(e) => {
                            supabaseHelper.Restaurant.update(rest.id, { webhook_url: e.target.value })
                              .then(() => queryClient.invalidateQueries(['restaurants']));
                          }}
                          className="w-full px-2 py-1 text-xs rounded border border-gray-300 focus:border-[#6c5ce7] focus:outline-none"
                          style={{ maxWidth: '250px' }}
                        />
                      </td>
                      <td className="p-4 border-b border-black/5">
                        <div className="text-xs space-y-0.5">
                          <div>👁️ {rest.metrics_access || 0} acessos</div>
                          <div>🎲 {rest.metrics_spins || 0} giros</div>
                          <div>👥 {restLeads.length} leads</div>
                          <div className="font-semibold text-[#6c5ce7]">📊 {conversion}% conversão</div>
                        </div>
                      </td>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRestaurant(rest);
                            }}
                            style={{ padding: '5px 10px' }}
                            title="Ver gráficos"
                          >
                            <i className="fas fa-chart-line"></i>
                          </SoftButton>
                          <SoftButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              simulateClientView(rest);
                            }}
                            style={{ padding: '5px 10px' }}
                            title="Visualizar roleta"
                          >
                            <i className="fas fa-eye"></i>
                          </SoftButton>
                          <SoftButton 
                            variant={rest.status === 'active' ? 'warning' : 'primary'}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRestaurantMutation.mutate({ id: rest.id, status: rest.status });
                            }}
                            style={{ padding: '5px 10px' }}
                            title={rest.status === 'active' ? 'Pausar' : 'Ativar'}
                          >
                            <i className={`fas fa-${rest.status === 'active' ? 'pause' : 'play'}`}></i>
                          </SoftButton>
                          <SoftButton 
                            variant="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Excluir restaurante?')) {
                                deleteRestaurantMutation.mutate(rest.id);
                              }
                            }}
                            style={{ padding: '5px 10px' }}
                            title="Excluir"
                          >
                            <i className="fas fa-trash"></i>
                          </SoftButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
        restaurant={selectedRestaurant}
        leadId={selectedLead?.id}
        onClose={() => { 
          setShowWhatsApp(false); 
          setSelectedLead(null);
          setSelectedRestaurant(null);
        }} 
      />

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet" />
    </div>
  );
}