import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import SoftCard from '@/components/ui/SoftCard';
import SoftButton from '@/components/ui/SoftButton';
import SoftInput from '@/components/ui/SoftInput';
import { createPageUrl } from '@/utils';

export default function Home() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('restaurant');
  const [email, setEmail] = useState('admin@restaurante.com');
  const [password, setPassword] = useState('');

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list()
  });

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (email.includes('super')) {
      sessionStorage.setItem('userType', 'super_admin');
      sessionStorage.removeItem('currentRestaurant');
      navigate(createPageUrl('SuperAdmin'));
    } else {
      if (restaurants.length > 0) {
        sessionStorage.setItem('userType', 'restaurant');
        sessionStorage.setItem('currentRestaurant', JSON.stringify(restaurants[0]));
        navigate(createPageUrl('RestaurantDashboard'));
      } else {
        alert('Nenhum restaurante cadastrado.');
      }
    }
  };

  const toggleLoginType = (type) => {
    setLoginType(type);
    if (type === 'admin') {
      setEmail('super@admin.com');
    } else {
      setEmail('admin@restaurante.com');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#eef2f5' }}
    >
      <SoftCard className="max-w-[400px] w-[90%] p-10 text-center">
        <h2 className="mb-2.5 text-[#6c5ce7] font-bold text-2xl">FoodSpin SaaS</h2>
        <p className="text-[#636e72] mb-8">Acesso ao painel multi-restaurantes</p>

        <div className="flex mb-6 gap-4 justify-center">
          <SoftButton 
            variant={loginType === 'restaurant' ? 'primary' : 'default'}
            onClick={() => toggleLoginType('restaurant')}
          >
            Restaurante
          </SoftButton>
          <SoftButton 
            variant={loginType === 'admin' ? 'primary' : 'default'}
            onClick={() => toggleLoginType('admin')}
          >
            Super Admin
          </SoftButton>
        </div>

        <form onSubmit={handleLogin}>
          <SoftInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <SoftInput
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <SoftButton type="submit" variant="primary" className="w-full">
            ENTRAR <i className="fas fa-arrow-right ml-2"></i>
          </SoftButton>
        </form>
      </SoftCard>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet" />
    </div>
  );
}