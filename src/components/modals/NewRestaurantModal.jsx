import React, { useState } from 'react';
import SoftButton from '../ui/SoftButton';
import SoftInput from '../ui/SoftInput';

export default function NewRestaurantModal({ show, onSave, onClose }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState('#6c5ce7');

  const handleSave = () => {
    if (!name || !slug || !email || !password) {
      alert('Preencha todos os campos');
      return;
    }
    onSave({ name, slug, email, password, color });
    setName('');
    setSlug('');
    setEmail('');
    setPassword('');
    setColor('#6c5ce7');
  };

  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[90%] max-w-[400px] p-[30px] rounded-[20px] bg-white"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <h3 className="mb-4 text-[#2d3436] font-semibold">Novo Restaurante</h3>
        <SoftInput
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <SoftInput
          placeholder="Slug (URL)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <SoftInput
          placeholder="Email do Proprietário"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <SoftInput
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-[50px] rounded-xl mb-4 cursor-pointer"
          style={{
            background: '#eef2f5',
            border: 'none',
            boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff'
          }}
        />
        <div className="flex gap-2.5 mt-2.5">
          <SoftButton onClick={onClose} className="flex-1">
            Cancelar
          </SoftButton>
          <SoftButton variant="primary" onClick={handleSave} className="flex-1">
            Salvar
          </SoftButton>
        </div>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}