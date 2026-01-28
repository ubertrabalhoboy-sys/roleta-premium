import React, { useState } from 'react';
import SoftButton from '../ui/SoftButton';
import SoftInput from '../ui/SoftInput';

export default function NewPrizeModal({ show, onSave, onClose }) {
  const [name, setName] = useState('');
  const [chance, setChance] = useState('');
  const [tier, setTier] = useState('common');
  const [limitCount, setLimitCount] = useState('');
  const [limitPeriod, setLimitPeriod] = useState('total');
  const [expirationDate, setExpirationDate] = useState('');

  const handleSave = () => {
    if (!name) {
      alert('Preencha o nome');
      return;
    }
    onSave({ 
      name, 
      chance: parseInt(chance) || 0,
      tier,
      limit_count: limitCount ? parseInt(limitCount) : null,
      limit_period: limitPeriod,
      expiration_date: expirationDate || null,
      current_count: 0
    });
    setName('');
    setChance('');
    setTier('common');
    setLimitCount('');
    setLimitPeriod('total');
    setExpirationDate('');
  };

  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[90%] max-w-[500px] p-[30px] rounded-[20px] bg-white max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <h3 className="mb-4 text-[#2d3436] font-semibold">Adicionar Prêmio</h3>
        
        <div className="space-y-3">
          <SoftInput
            placeholder="Nome do Prêmio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <SoftInput
            type="number"
            placeholder="Chance %"
            value={chance}
            onChange={(e) => setChance(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-[#636e72] mb-1">Nível (Tier)</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-none"
              style={{
                background: '#eef2f5',
                boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
                color: '#2d3436'
              }}
            >
              <option value="common">⚪ Comum</option>
              <option value="rare">🔵 Raro</option>
              <option value="epic">🟣 Épico</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#636e72] mb-1">Limite de Prêmios</label>
              <SoftInput
                type="number"
                placeholder="Ex: 10"
                value={limitCount}
                onChange={(e) => setLimitCount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#636e72] mb-1">Período</label>
              <select
                value={limitPeriod}
                onChange={(e) => setLimitPeriod(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-none"
                style={{
                  background: '#eef2f5',
                  boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
                  color: '#2d3436'
                }}
              >
                <option value="total">Total</option>
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#636e72] mb-1">Data de Expiração</label>
            <SoftInput
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-4">
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