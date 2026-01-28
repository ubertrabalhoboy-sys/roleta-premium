import React, { useState } from 'react';
import SoftButton from '../ui/SoftButton';
import SoftInput from '../ui/SoftInput';

export default function FoodOptionsModal({ show, foodOptions = [], onAdd, onRemove, onClose }) {
  const [newOption, setNewOption] = useState('');

  const handleAdd = () => {
    if (newOption) {
      onAdd(newOption);
      setNewOption('');
    }
  };

  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[90%] max-w-[400px] p-[30px] rounded-[20px] bg-white max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <h3 className="mb-4 text-[#2d3436] font-semibold">Opções de Comida</h3>
        
        <div className="flex gap-2.5 mb-4">
          <SoftInput
            placeholder="Nova opção (ex: Poke)"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            className="flex-1 mb-0"
            style={{ marginBottom: 0 }}
          />
          <SoftButton variant="primary" onClick={handleAdd}>
            Adicionar
          </SoftButton>
        </div>

        <ul className="list-none p-0">
          {foodOptions.map((opt, idx) => (
            <li 
              key={idx} 
              className="flex justify-between items-center p-2.5 border-b border-gray-100"
            >
              <span>{opt.name || opt}</span>
              <button 
                onClick={() => onRemove(opt.id || idx)}
                className="border-none bg-transparent text-red-500 cursor-pointer text-lg"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <SoftButton onClick={onClose} className="w-full mt-4">
          Fechar
        </SoftButton>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}