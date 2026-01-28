import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import SoftButton from '@/components/ui/SoftButton';
import StatCard from '@/components/dashboard/StatCard';
import StrategicAlert from '@/components/dashboard/StrategicAlert';
import CRMPreviewTable from '@/components/dashboard/CRMPreviewTable';
import CRMModal from '@/components/modals/CRMModal';
import PrizesModal from '@/components/modals/PrizesModal';
import NewPrizeModal from '@/components/modals/NewPrizeModal';
import NotificationsModal from '@/components/modals/NotificationsModal';

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Modals
  const [showCRM, setShowCRM] = useState(false);
  const [showPrizes, setShowPrizes] = useState(false);
  const [showNewPrize, setShowNewPrize] = useState(false);
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

  if (!currentRestaurant) return null;

  const metrics = {
    access: currentRestaurant.metrics_access || 0,
    spins: currentRestaurant.metrics_spins || 0,
    leads: leads.length
  };

  const conversion = metrics.access > 0 ? ((metrics.leads / metrics.access) * 100).toFixed(1) : '0';
  const hotLeads = leads.filter(l => l.day_pref && l.fav_product).length;

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
                <i className="fas fa-file-csv mr-2"></i> Exportar
              </SoftButton>
              <SoftButton onClick={() => setShowNotifications(true)}>
                <i className="fas fa-bell mr-2"></i>
                <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {notifications.length}
                </span>
              </SoftButton>
            </div>
          </div>

          {/* Strategic Alert */}
          <StrategicAlert count={hotLeads} onAction={() => setShowCRM(true)} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard icon="fas fa-eye" value={metrics.access} label="Acessos" />
            <StatCard icon="fas fa-dice" value={metrics.spins} label="Giros" />
            <StatCard icon="fas fa-user-check" value={metrics.leads} label="Leads" />
            <StatCard icon="fas fa-percentage" value={`${conversion}%`} label="Conversão" />
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
      <NotificationsModal 
        show={showNotifications}
        notifications={notifications}
        onClear={() => setNotifications([])}
        onClose={() => setShowNotifications(false)} 
      />

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet" />
    </div>
  );
}