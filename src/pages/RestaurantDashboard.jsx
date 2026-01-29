import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { format, subDays } from 'date-fns';
import SoftButton from '@/components/ui/SoftButton';
import StatCard from '@/components/dashboard/StatCard';
import StrategicAlert from '@/components/dashboard/StrategicAlert';
import CRMPreviewTable from '@/components/dashboard/CRMPreviewTable';
import CRMModal from '@/components/modals/CRMModal';
import PrizesModal from '@/components/modals/PrizesModal';
import NewPrizeModal from '@/components/modals/NewPrizeModal';
import RemarketingModal from '@/components/modals/RemarketingModal';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import MetricsChart from '@/components/charts/MetricsChart';
import ConversionChart from '@/components/charts/ConversionChart';
import NotificationService from '@/components/notifications/NotificationService';

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [chartType, setChartType] = useState('area');
  
  // Modals
  const [showCRM, setShowCRM] = useState(false);
  const [showPrizes, setShowPrizes] = useState(false);
  const [showNewPrize, setShowNewPrize] = useState(false);
  const [showRemarketing, setShowRemarketing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const userType = sessionStorage.getItem('userType');
    const restData = sessionStorage.getItem('currentRestaurant');
    
    if (userType !== 'restaurant' || !restData) {
      navigate(createPageUrl('Login'));
      return;
    }
    
    setCurrentRestaurant(JSON.parse(restData));
  }, [navigate]);

  const { data: leads = [] } = useQuery({
    queryKey: ['leads', currentRestaurant?.id],
    queryFn: () => base44.entities.Lead.filter({ restaurant_id: currentRestaurant?.id }),
    enabled: !!currentRestaurant?.id
  });

  const { data: prizes = [] } = useQuery({
    queryKey: ['prizes', currentRestaurant?.id],
    queryFn: () => base44.entities.Prize.filter({ restaurant_id: currentRestaurant?.id }),
    enabled: !!currentRestaurant?.id
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentRestaurant?.id],
    queryFn: () => base44.entities.Notification.filter({ restaurant_id: currentRestaurant?.id }),
    enabled: !!currentRestaurant?.id
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['metrics', currentRestaurant?.id],
    queryFn: () => base44.entities.Metric.filter({ restaurant_id: currentRestaurant?.id }),
    enabled: !!currentRestaurant?.id
  });

  const deletePrizeMutation = useMutation({
    mutationFn: (id) => base44.entities.Prize.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['prizes'])
  });

  const createPrizeMutation = useMutation({
    mutationFn: (data) => base44.entities.Prize.create({
      ...data,
      restaurant_id: currentRestaurant?.id,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['prizes']);
      setShowNewPrize(false);
      setShowPrizes(true);
    }
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id) => NotificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => NotificationService.markAllAsRead(currentRestaurant?.id),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const logout = () => {
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('currentRestaurant');
    navigate(createPageUrl('Login'));
  };

  const openWhatsApp = (phone) => {
    window.open(`https://wa.me/55${phone}`, '_blank');
  };

  const simulateClientView = () => {
    if (currentRestaurant) {
      sessionStorage.setItem('simulatedRestaurant', JSON.stringify(currentRestaurant));
      navigate(createPageUrl('ClientRoleta'));
    }
  };

  const exportToCSV = () => {
    const csvContent = leads.map(l => 
      `${l.name},${l.phone},${l.prize},${l.day_pref || ''},${l.time_pref || ''},${l.fav_product || ''}`
    ).join('\n');
    const blob = new Blob([`Nome,WhatsApp,Prêmio,Dia,Horário,Produto\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
  };

  const exportDetailedReport = () => {
    const reportData = {
      restaurante: currentRestaurant.name,
      periodo: `${format(new Date(), 'dd/MM/yyyy')}`,
      metricas: {
        acessos: metricsData.access,
        giros: metricsData.spins,
        leads: metricsData.leads,
        conversao: conversion + '%'
      },
      leads: leads.map(l => ({
        nome: l.name,
        telefone: l.phone,
        premio: l.prize,
        dia_pref: l.day_pref || '',
        horario_pref: l.time_pref || '',
        produto_fav: l.fav_product || '',
        data: l.created_date ? format(new Date(l.created_date), 'dd/MM/yyyy HH:mm') : ''
      })),
      premios: prizes.map(p => ({
        nome: p.name,
        chance: p.chance + '%'
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${currentRestaurant.slug}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };



  if (!currentRestaurant) return null;

  // Calcular métricas totais a partir dos dados diários
  const metricsData = {
    access: metrics.reduce((sum, m) => sum + (m.access || 0), 0),
    spins: metrics.reduce((sum, m) => sum + (m.spins || 0), 0),
    leads: metrics.reduce((sum, m) => sum + (m.leads || 0), 0)
  };

  const conversion = metricsData.access > 0 ? ((metricsData.leads / metricsData.access) * 100).toFixed(1) : '0';
  
  const remarketingLeads = leads.filter(lead => {
    if (!lead.remarketing_eligible_date) return false;
    try {
      const leadDate = new Date(lead.remarketing_eligible_date);
      const today = new Date();
      return leadDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  });
  
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Generate chart data
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayMetric = metrics.find(m => m.date === dateStr && m.restaurant_id === currentRestaurant?.id);
      
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

  const chartData = generateChartData();

  return (
    <div className="min-h-screen" style={{ background: '#eef2f5' }}>
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] h-screen">
        {/* Sidebar */}
        <aside 
          className="hidden lg:flex flex-col p-5 border-r border-white/50"
          style={{ background: '#eef2f5' }}
        >
          <div className="mb-10 flex items-center gap-2.5">
            <i className="fas fa-pizza-slice text-3xl text-[#6c5ce7]"></i>
            <h3 className="font-bold text-xl">FoodSpin</h3>
          </div>
          <nav className="flex flex-col gap-4">
            <SoftButton variant="primary">
              <i className="fas fa-chart-line mr-2"></i> Dashboard
            </SoftButton>
            <SoftButton onClick={() => navigate(createPageUrl('LeadsManagement'))}>
              <i className="fas fa-users-cog mr-2"></i> Gerenciar Leads
            </SoftButton>
            <SoftButton onClick={() => setShowCRM(true)}>
              <i className="fas fa-users mr-2"></i> Clientes CRM
            </SoftButton>
            <SoftButton onClick={() => setShowRemarketing(true)}>
              <i className="fas fa-bullhorn mr-2"></i> Remarketing
            </SoftButton>
            <SoftButton onClick={() => setShowPrizes(true)}>
              <i className="fas fa-gift mr-2"></i> Prêmios
            </SoftButton>
            <SoftButton onClick={simulateClientView}>
              <i className="fas fa-eye mr-2"></i> Visualizar Roleta
            </SoftButton>
          </nav>
          <div className="mt-auto">
            <SoftButton variant="danger" onClick={logout} className="w-full">
              <i className="fas fa-sign-out-alt mr-2"></i> Sair
            </SoftButton>
          </div>
        </aside>

        {/* Main Content */}
        <main className="p-6 overflow-y-auto" style={{ background: '#f8faff' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-[#2d3436]">
              Olá, {currentRestaurant.name}!
            </h2>
            <div className="flex gap-2.5 flex-wrap">
              <SoftButton variant="export" onClick={exportToCSV}>
                <i className="fas fa-file-csv mr-2"></i> Leads CSV
              </SoftButton>
              <SoftButton variant="export" onClick={exportDetailedReport}>
                <i className="fas fa-file-download mr-2"></i> Relatório
              </SoftButton>
              <SoftButton onClick={() => setShowNotifications(true)}>
                <i className="fas fa-bell mr-2"></i>
                {unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs ml-1">
                    {unreadNotifications}
                  </span>
                )}
              </SoftButton>
            </div>
          </div>

          {/* Strategic Alert */}
          <StrategicAlert count={remarketingLeads.length} onAction={() => setShowRemarketing(true)} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard icon="fas fa-eye" value={metricsData.access} label="Acessos" />
            <StatCard icon="fas fa-dice" value={metricsData.spins} label="Giros" />
            <StatCard icon="fas fa-user-check" value={metricsData.leads} label="Leads" />
            <StatCard icon="fas fa-percentage" value={`${conversion}%`} label="Conversão" />
          </div>

          {/* Charts */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2d3436]">Desempenho (últimos 7 dias)</h3>
              <div className="flex gap-2">
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
              <MetricsChart data={chartData} title="Acessos, Giros e Leads" type={chartType} />
              <ConversionChart data={chartData} type={chartType} />
            </div>
          </div>

          {/* CRM Preview */}
          <CRMPreviewTable leads={[...leads].reverse()} onWhatsApp={openWhatsApp} />

          {/* Mobile Nav */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 flex justify-around border-t shadow-lg">
            <SoftButton onClick={() => setShowCRM(true)} style={{ padding: '10px' }}>
              <i className="fas fa-users"></i>
            </SoftButton>
            <SoftButton onClick={() => setShowPrizes(true)} style={{ padding: '10px' }}>
              <i className="fas fa-gift"></i>
            </SoftButton>
            <SoftButton onClick={simulateClientView} style={{ padding: '10px' }}>
              <i className="fas fa-eye"></i>
            </SoftButton>
            <SoftButton variant="danger" onClick={logout} style={{ padding: '10px' }}>
              <i className="fas fa-sign-out-alt"></i>
            </SoftButton>
          </div>
        </main>
      </div>

      {/* Modals */}
      <CRMModal 
        show={showCRM} 
        leads={[...leads].reverse()} 
        onWhatsApp={openWhatsApp}
        onClose={() => setShowCRM(false)} 
      />
      <PrizesModal 
        show={showPrizes} 
        prizes={prizes}
        onDelete={(id) => deletePrizeMutation.mutate(id)}
        onAddNew={() => { setShowPrizes(false); setShowNewPrize(true); }}
        onClose={() => setShowPrizes(false)} 
      />
      <NewPrizeModal 
        show={showNewPrize}
        onSave={(data) => createPrizeMutation.mutate(data)}
        onClose={() => setShowNewPrize(false)} 
      />
      <RemarketingModal
        show={showRemarketing}
        leads={leads}
        onClose={() => setShowRemarketing(false)}
      />
      <NotificationCenter 
        show={showNotifications}
        notifications={[...notifications].sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        )}
        onMarkRead={(id) => markNotificationReadMutation.mutate(id)}
        onMarkAllRead={() => markAllNotificationsReadMutation.mutate()}
        onClose={() => setShowNotifications(false)} 
      />

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet" />
    </div>
  );
}