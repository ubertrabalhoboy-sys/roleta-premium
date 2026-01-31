import React, { useState, useEffect } from 'react';
import { supabaseHelper } from '@/components/utils/supabaseClient';
import SoftButton from '../ui/SoftButton';
import SoftInput from '../ui/SoftInput';

export default function WhatsAppModal({ 
  show, 
  clientName, 
  clientPhone,
  favProduct,
  restaurant,
  leadId,
  onSend, 
  onClose 
}) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (show && clientName) {
      const hour = new Date().getHours();
      const saudacao = hour < 12 ? 'Bom dia' : (hour < 18 ? 'Boa tarde' : 'Boa noite');
      const msg = `${saudacao} ${clientName}! 🌟\n\nVi que você adora *${favProduct}* (produto favorito)! 😋\n\nAqui está um *CUPOM ESPECIAL DE 80% DE DESCONTO* para você vir aproveitar!\n\nMostre essa mensagem no caixa. Te esperamos!`;
      setMessage(msg);
    }
  }, [show, clientName, favProduct]);

  const handleSend = async () => {
    if (!restaurant?.botplugin_api_token) {
      alert('Token da API BotPlugin não configurado.');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('https://api.botplugin.com.br/api-public/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${restaurant.botplugin_api_token}`
        },
        body: JSON.stringify({
          phone: clientPhone,
          message: message
        })
      });

      if (!response.ok) throw new Error('Falha ao enviar mensagem');

      // Atualizar status do lead
      if (leadId) {
        await supabaseHelper.Lead.update(leadId, {
          sent_by_admin: true
        });
      }

      alert('Mensagem enviada com sucesso via API!');
      onClose();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Verifique o token da API e tente novamente.');
    } finally {
      setIsSending(false);
    }
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
        <h3 className="mb-4 text-[#2d3436] font-semibold">Enviar Cupom</h3>
        <p className="text-sm text-[#636e72] mb-5">
          Cliente: <span className="font-medium">{clientName}</span>
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full p-3.5 rounded-xl outline-none mb-4 resize-none"
          style={{
            background: '#eef2f5',
            border: 'none',
            boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
            color: '#2d3436'
          }}
        />
        <div className="flex gap-2.5">
          <SoftButton onClick={onClose} className="flex-1" disabled={isSending}>
            Cancelar
          </SoftButton>
          <SoftButton 
            variant="whatsapp" 
            onClick={handleSend} 
            className="flex-1"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Enviando...
              </>
            ) : (
              <>
                <i className="fab fa-whatsapp mr-2"></i> Enviar
              </>
            )}
          </SoftButton>
        </div>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}