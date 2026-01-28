import React, { useState } from 'react';
import SoftButton from '../ui/SoftButton';
import SoftInput from '../ui/SoftInput';

export default function NewPrizeModal({ show, onSave, onClose }) {
  const [name, setName] = useState('');
  const [chance, setChance] = useState('');

  const handleSave = () => {
    if (!name) {
      alert('Preencha o nome');
      return;
    }
    onSave({ name, chance: parseInt(chance) || 0 });
    setName('');
    setChance('');
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
        <h3 className="mb-4 text-[#2d3436] font-semibold">Adicionar Prêmio</h3>
        <SoftInput
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <SoftInput
          type="number"
          placeholder="Chance %"
          value={chance}
          onChange={(e) => setChance(e.target.value)}
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