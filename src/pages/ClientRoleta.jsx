import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import WheelCanvas from '@/components/wheel/WheelCanvas';
import FairyContainer from '@/components/wheel/FairyContainer';
import BalloonOverlay from '@/components/wheel/BalloonOverlay';
import LeadModal from '@/components/modals/LeadModal';
import LeadStep2Modal from '@/components/modals/LeadStep2Modal';
import SoftButton from '@/components/ui/SoftButton';

export default function ClientRoleta() {
  const navigate = useNavigate();
  const wheelRef = useRef(null);
  
  const [restaurant, setRestaurant] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [hasSpun, setHasSpun] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  
  // Modals
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showLeadStep2, setShowLeadStep2] = useState(false);
  const [tempLeadData, setTempLeadData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug');
      
      if (slug) {
        try {
          const restaurants = await base44.entities.Restaurant.filter({ slug: slug });
          if (restaurants && restaurants.length > 0) {
            const rest = restaurants[0];
            setRestaurant(rest);
            
            // Load prizes
            const restPrizes = await base44.entities.Prize.filter({ restaurant_id: rest.id });
            setPrizes(restPrizes || []);
            
            // Check if already spun
            const spunKey = `hasSpun_${rest.id}`;
            if (localStorage.getItem(spunKey)) {
              setHasSpun(true);
            }
          } else {
            navigate(createPageUrl('Home'));
          }
        } catch (error) {
          console.error('Erro ao carregar restaurante:', error);
          navigate(createPageUrl('Home'));
        }
      } else {
        // Fallback para simulação antiga
        const restData = sessionStorage.getItem('simulatedRestaurant');
        if (!restData) {
          navigate(createPageUrl('Home'));
          return;
        }
        const rest = JSON.parse(restData);
        setRestaurant(rest);
        
        try {
          const restPrizes = await base44.entities.Prize.filter({ restaurant_id: rest.id });
          setPrizes(restPrizes || []);
        } catch (error) {
          console.error('Erro ao carregar prêmios:', error);
        }
        
        // Check if already spun
        const spunKey = `hasSpun_${rest.id}`;
        if (localStorage.getItem(spunKey)) {
          setHasSpun(true);
        }
      }

      // Load food options
      try {
        const options = await base44.entities.FoodOption.list();
        setFoodOptions(options || []);
      } catch (error) {
        console.error('Erro ao carregar opções de comida:', error);
      }
    };

    loadData();
  }, [navigate]);

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
    wheelRef.current?.spin();
  };

  const handleSpinEnd = async (prize) => {
    setIsSpinning(false);
    setWonPrize(prize);
    setShowBalloons(true);
    
    setTimeout(() => {
      setShowBalloons(false);
    }, 6000);
    
    setShowLeadModal(true);
  };

  const handleLeadStep1 = async (data) => {
    setTempLeadData(data);
    setShowLeadModal(false);
    setShowLeadStep2(true);
  };

  const handleLeadStep2 = async (data) => {
    // 1. Processar o lead e enviar para webhook Fiqon PRIMEIRO
    try {
      await base44.functions.invoke('ProcessLeadSubmission', {
        restaurantId: restaurant.id,
        name: tempLeadData.name,
        phone: tempLeadData.phone,
        prize: wonPrize?.name,
        dayPref: data.day,
        timePref: data.time,
        favProduct: data.favProduct
      });
      
      console.log('Lead enviado para Fiqon com sucesso');
    } catch (error) {
      console.error('Erro ao processar lead:', error);
    }

    // 2. Abrir WhatsApp para resgate
    const restPhone = restaurant?.whatsapp || '5511999999999';
    const msg = `Olá! Acabei de ganhar *${wonPrize?.name}* na roleta! Gostaria de resgatar.`;
    window.open(`https://wa.me/${restPhone}?text=${encodeURIComponent(msg)}`, '_blank');

    // 3. Mark as spun
    localStorage.setItem(`hasSpun_${restaurant?.id}`, 'true');
    setHasSpun(true);
    setShowLeadStep2(false);
  };

  // Access tracking será implementado via backend functions quando disponível

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