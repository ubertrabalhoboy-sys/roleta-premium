import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseHelper } from '@/components/utils/supabaseClient';
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
    queryFn: () => supabaseHelper.Restaurant.list(),
    staleTime: 300000 // Cache por 5 minutos
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Login do Super Admin com credenciais fixas
      if (email === 'super@admin.com' && password === 'admin123') {
        sessionStorage.setItem('userType', 'super_admin');
        sessionStorage.removeItem('currentRestaurant');
        navigate(createPageUrl('SuperAdmin'));
        return;
      }

      // Autenticação padrão usando Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        alert(`Erro de autenticação: ${error.message}`);
        return;
      }

      if (!data.user) {
        alert('Não foi possível autenticar o usuário.');
        return;
      }

      // Verificação VIP: Super Admin com email específico
      if (data.user.email === 'rag.alvesg@gmail.com') {
        sessionStorage.setItem('userType', 'super_admin');
        sessionStorage.removeItem('currentRestaurant');
        navigate(createPageUrl('SuperAdmin'));
        return;
      }

      // Buscar restaurante (o ID do restaurante é o mesmo do usuário Auth)
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('🔍 Busca Restaurante:', { 
        userId: data.user.id,
        userEmail: data.user.email,
        restaurantData, 
        restaurantError 
      });

      if (restaurantData && !restaurantError) {
        sessionStorage.setItem('userType', 'restaurant');
        sessionStorage.setItem('currentRestaurant', JSON.stringify(restaurantData));
        navigate(createPageUrl('RestaurantDashboard'));
      } else {
        alert('Usuário não possui restaurante vinculado. Contate o administrador.');
        await supabase.auth.signOut();
      }
    } catch (error) {
      alert(`Erro: ${error.message}`);
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