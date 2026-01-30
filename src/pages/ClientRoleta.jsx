import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import WheelCanvas from '@/components/wheel/WheelCanvas';
import FairyContainer from '@/components/wheel/FairyContainer';
import BalloonOverlay from '@/components/wheel/BalloonOverlay';
import LeadModal from '@/components/modals/LeadModal';
import LeadStep2Modal from '@/components/modals/LeadStep2Modal';
import SoftButton from '@/components/ui/SoftButton';

export default function ClientRoleta() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const wheelRef = useRef(null);
  
  const [restaurant, setRestaurant] = useState(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  
  // Modals
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showLeadStep2, setShowLeadStep2] = useState(false);
  const [tempLeadData, setTempLeadData] = useState({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (slug) {
      // Buscar restaurante pelo slug
      base44.entities.Restaurant.filter({ slug: slug }).then(restaurants => {
        if (restaurants && restaurants.length > 0) {
          const rest = restaurants[0];
          setRestaurant(rest);
          
          // Check if already spun
          const spunKey = `hasSpun_${rest.id}`;
          if (sessionStorage.getItem(spunKey)) {
            setHasSpun(true);
          }
        } else {
          navigate(createPageUrl('Home'));
        }
      });
    } else {
      // Fallback para simulação antiga
      const restData = sessionStorage.getItem('simulatedRestaurant');
      if (!restData) {
        navigate(createPageUrl('Home'));
        return;
      }
      const rest = JSON.parse(restData);
      setRestaurant(rest);
      
      // Check if already spun
      const spunKey = `hasSpun_${rest.id}`;
      if (sessionStorage.getItem(spunKey)) {
        setHasSpun(true);
      }
    }
  }, [navigate]);

  const { data: prizes = [] } = useQuery({
    queryKey: ['prizes', restaurant?.id],
    queryFn: () => base44.entities.Prize.filter({ restaurant_id: restaurant?.id }),
    enabled: !!restaurant?.id
  });

  const { data: foodOptions = [] } = useQuery({
    queryKey: ['food-options'],
    queryFn: () => base44.entities.FoodOption.list()
  });

  const createLeadMutation = useMutation({
    mutationFn: (data) => base44.entities.Lead.create(data),
    onSuccess: () => queryClient.invalidateQueries(['leads'])
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Restaurant.update(id, data)
  });

  const exitSimulation = () => {
    const userType = sessionStorage.getItem('userType');
    sessionStorage.removeItem('simulatedRestaurant');
    
    if (userType === 'super_admin') {
      navigate(createPageUrl('SuperAdmin'));
    } else if (userType === 'restaurant') {
      navigate(createPageUrl('RestaurantDashboard'));
    } else {
      navigate(createPageUrl('Home'));
    }
  };

  const handleSpin = async () => {
    if (isSpinning || hasSpun || prizes.length === 0) return;
    
    setIsSpinning(true);
    
    // Update metrics
    if (restaurant) {
      updateRestaurantMutation.mutate({
        id: restaurant.id,
        data: { metrics_spins: (restaurant.metrics_spins || 0) + 1 }
      });
      
      // Update daily metric
      const today = format(new Date(), 'yyyy-MM-dd');
      const existingMetrics = await base44.entities.Metric.filter({ 
        restaurant_id: restaurant.id, 
        date: today 
      });
      
      if (existingMetrics.length > 0) {
        await base44.entities.Metric.update(existingMetrics[0].id, {
          spins: (existingMetrics[0].spins || 0) + 1
        });
      } else {
        await base44.entities.Metric.create({
          restaurant_id: restaurant.id,
          date: today,
          access: 0,
          spins: 1,
          leads: 0,
          conversion_rate: 0
        });
      }
    }
    
    wheelRef.current?.spin();
  };

  const handleSpinEnd = async (prize) => {
    setIsSpinning(false);
    setWonPrize(prize);
    setShowBalloons(true);
    
    // Update prize count
    if (prize.id) {
      await base44.entities.Prize.update(prize.id, {
        current_count: (prize.current_count || 0) + 1
      });
    }
    
    setTimeout(() => {
      setShowBalloons(false);
    }, 6000);
    
    setShowLeadModal(true);
  };

  const handleLeadStep1 = async (data) => {
    setTempLeadData(data);
    
    // Enviar dados para webhook
    const webhookData = {
      name: data.name,
      phone: data.phone,
      prize: wonPrize?.name,
      restaurant_id: restaurant?.id,
      restaurant_name: restaurant?.name,
      timestamp: new Date().toISOString()
    };
    
    console.log('Enviando para webhook:', webhookData);
    
    try {
      const response = await fetch('https://webhook.fiqon.app/webhook/a0f4cd0b-aeff-48f5-b84c-ad7ba060ca34/35a202e4-f3e3-411f-8fcf-da5c151f9a24', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });
      console.log('Webhook enviado com sucesso');
    } catch (error) {
      console.error('Erro ao enviar dados para webhook:', error);
    }
    
    setShowLeadModal(false);
    setShowLeadStep2(true);
  };

  const handleLeadStep2 = async (data) => {
    // Abrir WhatsApp IMEDIATAMENTE antes de qualquer operação assíncrona
    const restPhone = restaurant?.whatsapp || '5511999999999';
    const msg = `Olá! Acabei de ganhar *${wonPrize?.name}* na roleta! Gostaria de resgatar.`;
    window.open(`https://wa.me/${restPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    
    // Agora sim processar o resto
    const lead = {
      restaurant_id: restaurant?.id,
      name: tempLeadData.name,
      phone: tempLeadData.phone,
      prize: wonPrize?.name,
      day_pref: data.day,
      time_pref: data.time,
      fav_product: data.favProduct,
      sent_by_admin: false
    };
    
    const createdLead = await createLeadMutation.mutateAsync(lead);
    
    // Enviar dados para webhook individual do restaurante
    if (restaurant?.webhook_resgate_cupom) {
      const webhookData = {
        lead_id: createdLead.id,
        name: tempLeadData.name,
        phone: tempLeadData.phone,
        prize: wonPrize?.name,
        day_pref: data.day,
        time_pref: data.time,
        fav_product: data.favProduct,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        timestamp: new Date().toISOString()
      };
      
      console.log('Enviando resgate para webhook:', webhookData);
      
      try {
        const response = await fetch(restaurant.webhook_resgate_cupom, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(webhookData)
        });
        
        if (response.ok) {
          // Webhook respondeu com sucesso
          await base44.entities.Lead.update(createdLead.id, { coupon_status: 'sent' });
          console.log('Webhook de resgate enviado com sucesso - Status atualizado para "sent"');
        } else {
          // Webhook retornou erro
          await base44.entities.Lead.update(createdLead.id, { coupon_status: 'failed' });
          console.log('Webhook de resgate falhou - Status atualizado para "failed"');
        }
      } catch (error) {
        console.error('Erro ao enviar webhook de resgate:', error);
        await base44.entities.Lead.update(createdLead.id, { coupon_status: 'failed' });
      }
    }
    
    // Create hot lead notification
    if (data.day && data.time && data.favProduct) {
      await base44.entities.Notification.create({
        restaurant_id: restaurant?.id,
        type: 'hot_lead',
        title: '🔥 Lead Quente Detectado!',
        message: `${tempLeadData.name} completou todos os dados. Pronto para conversão!`,
        priority: 'high',
        metadata: {
          lead_id: lead.id,
          lead_name: tempLeadData.name,
          lead_phone: tempLeadData.phone
        }
      });
    }
    
    // Update metrics
    if (restaurant) {
      const newLeadsCount = (restaurant.metrics_leads || 0) + 1;
      const totalAccess = restaurant.metrics_access || 0;
      
      updateRestaurantMutation.mutate({
        id: restaurant.id,
        data: { metrics_leads: newLeadsCount }
      });
      
      // Update daily metric
      const today = format(new Date(), 'yyyy-MM-dd');
      const existingMetrics = await base44.entities.Metric.filter({ 
        restaurant_id: restaurant.id, 
        date: today 
      });
      
      if (existingMetrics.length > 0) {
        const updatedLeads = (existingMetrics[0].leads || 0) + 1;
        const updatedAccess = existingMetrics[0].access || 0;
        await base44.entities.Metric.update(existingMetrics[0].id, {
          leads: updatedLeads,
          conversion_rate: updatedAccess > 0 ? (updatedLeads / updatedAccess) * 100 : 0
        });
      }
    }
    
    // Mark as spun
    sessionStorage.setItem(`hasSpun_${restaurant?.id}`, 'true');
    setHasSpun(true);
    setShowLeadStep2(false);
  };

  // Update access metrics on load
  useEffect(() => {
    const trackAccess = async () => {
      if (restaurant && !hasSpun) {
        updateRestaurantMutation.mutate({
          id: restaurant.id,
          data: { metrics_access: (restaurant.metrics_access || 0) + 1 }
        });
        
        // Update daily metric
        const today = format(new Date(), 'yyyy-MM-dd');
        const existingMetrics = await base44.entities.Metric.filter({ 
          restaurant_id: restaurant.id, 
          date: today 
        });
        
        if (existingMetrics.length > 0) {
          await base44.entities.Metric.update(existingMetrics[0].id, {
            access: (existingMetrics[0].access || 0) + 1
          });
        } else {
          await base44.entities.Metric.create({
            restaurant_id: restaurant.id,
            date: today,
            access: 1,
            spins: 0,
            leads: 0,
            conversion_rate: 0
          });
        }
      }
    };
    
    trackAccess();
  }, [restaurant?.id]);

  if (!restaurant) return null;

  const isPaused = restaurant.status === 'paused';

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: '#1a0505',
        backgroundImage: `
          linear-gradient(rgba(255, 50, 50, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 50, 50, 0.05) 1px, transparent 1px),
          radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.3) 0%, transparent 80%)
        `,
        backgroundSize: '50px 50px, 50px 50px, 100% 100%'
      }}
    >
      {/* Fairies Background */}
      <FairyContainer />

      {/* Exit Button */}
      <div className="absolute top-5 left-5 z-20">
        <SoftButton 
          onClick={exitSimulation}
          className="botao-vibecodes-glass"
          style={{ 
            fontSize: '0.8rem', 
            opacity: 0.8, 
            background: 'white', 
            color: '#333' 
          }}
        >
          <i className="fas fa-arrow-left mr-2"></i> Sair
        </SoftButton>
      </div>

      {/* Main Machine Frame */}
      <div 
        className="relative w-[360px] p-[30px] flex flex-col items-center z-10"
        style={{
          background: 'rgba(35, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid #ff003c',
          borderRadius: '40px',
          boxShadow: '0 0 40px rgba(255,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px rgba(255, 0, 60, 0.2)'
        }}
      >
        {/* Title */}
        <h2 
          className="text-white text-center mb-6 uppercase tracking-[3px] text-2xl font-bold"
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            textShadow: '0 0 5px #fff, 0 0 10px #ff003c, 0 0 20px #ff003c',
            animation: 'flicker 4s infinite alternate'
          }}
        >
          {restaurant.name}
        </h2>

        {/* Wheel Wrapper */}
        <div 
          className="relative w-[300px] h-[300px] rounded-full p-2 flex items-center justify-center"
          style={{
            background: 'conic-gradient(from 180deg, #333, #111, #333, #111)',
            boxShadow: '0 0 30px rgba(255, 0, 0, 0.2)',
            border: '2px solid rgba(255,255,255,0.1)',
            opacity: isPaused ? 0.3 : 1
          }}
        >
          <WheelCanvas 
            ref={wheelRef}
            prizes={prizes.length > 0 ? prizes : [{ name: 'Prêmio 1' }, { name: 'Prêmio 2' }]} 
            onSpinEnd={handleSpinEnd}
          />
          
          {/* Pointer */}
          <div 
            className="absolute top-[-20px] left-1/2 z-20"
            style={{
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderTop: '40px solid #ffd700',
              filter: 'drop-shadow(0 0 10px #ffd700)'
            }}
          />
        </div>

        {/* Spin Button or Messages */}
        {isPaused ? (
          <div 
            className="flex flex-col items-center p-5 rounded-[20px] text-center mt-8 bg-white/90"
          >
            <i className="fas fa-lock text-4xl text-[#d63031] mb-2"></i>
            <h3 className="text-[#2d3436] font-semibold">Roleta em Pausa</h3>
            <p className="text-[#636e72] text-sm">Tente novamente mais tarde.</p>
          </div>
        ) : hasSpun ? (
          <div 
            className="flex flex-col items-center p-5 rounded-[20px] text-center mt-8 bg-white/90"
          >
            <i className="fas fa-check-circle text-4xl text-[#00b894] mb-2"></i>
            <h3 className="text-[#2d3436] font-semibold">Concluído!</h3>
            <p className="text-[#636e72] text-sm">Aguarde nosso contato.</p>
          </div>
        ) : (
          <button
            onClick={handleSpin}
            disabled={isSpinning || prizes.length === 0}
            className="mt-8 w-full py-4 text-white uppercase tracking-[4px] text-xl font-bold relative overflow-hidden botao-vibecodes-glass"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              background: 'transparent',
              border: '2px solid #ff003c',
              borderRadius: '10px',
              boxShadow: '0 0 15px rgba(255, 0, 60, 0.3)',
              transition: 'all 0.3s',
              cursor: isSpinning || prizes.length === 0 ? 'not-allowed' : 'pointer',
              opacity: isSpinning || prizes.length === 0 ? 0.5 : 1
            }}
          >
            GIRAR AGORA
          </button>
        )}
      </div>

      {/* Balloons */}
      <BalloonOverlay show={showBalloons} />

      {/* Modals */}
      <LeadModal 
        show={showLeadModal}
        prizeName={wonPrize?.name}
        onSubmit={handleLeadStep1}
        onClose={() => setShowLeadModal(false)}
      />
      <LeadStep2Modal 
        show={showLeadStep2}
        foodOptions={foodOptions}
        onSubmit={handleLeadStep2}
        onClose={() => setShowLeadStep2(false)}
      />

      {/* Animations */}
      <style>{`
        @keyframes flicker { 
          0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; } 
          20%, 24%, 55% { opacity: 0.4; } 
        }

        @keyframes glass-shine {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        /* Glassmorphism Mobile-First Effect */
        .botao-vibecodes-glass {
          position: relative;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 
            0 4px 15px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 14px 24px;
        }

        .botao-vibecodes-glass::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
          mix-blend-mode: overlay;
          pointer-events: none;
          animation: glass-shine 3s ease-in-out infinite;
        }

        /* Mobile: Active state (touch) */
        .botao-vibecodes-glass:active:not(:disabled) {
          transform: scale(0.97);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
        }

        /* Desktop: Hover only for devices that support hover */
        @media (hover: hover) and (pointer: fine) {
          .botao-vibecodes-glass:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 
              0 8px 25px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            filter: saturate(1.1) brightness(1.05);
          }

          .botao-vibecodes-glass:hover:not(:disabled)::before {
            left: 100%;
          }
        }

        /* Disabled state */
        .botao-vibecodes-glass:disabled {
          cursor: not-allowed;
          filter: grayscale(0.3);
        }

        /* Graceful degradation for browsers without backdrop-filter */
        @supports not (backdrop-filter: blur(10px)) {
          .botao-vibecodes-glass {
            background: rgba(255, 255, 255, 0.05);
          }
        }
      `}</style>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet" />
    </div>
  );
}