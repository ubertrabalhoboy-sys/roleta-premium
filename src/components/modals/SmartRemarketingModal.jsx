import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import SoftButton from '../ui/SoftButton';
import SoftInput from '../ui/SoftInput';
import { Loader2 } from 'lucide-react';

export default function SmartRemarketingModal({ show, lead, onSend, onClose, restaurant }) {
  const [promotion, setPromotion] = useState('');
  const [productType, setProductType] = useState('');
  const [generatedScripts, setGeneratedScripts] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedScript, setSelectedScript] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!show) return null;

  const handleGenerateScripts = async () => {
    if (!promotion || !productType) {
      alert('Preencha a promoção e o tipo de produto');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em marketing de restaurantes. Crie 3 mensagens de WhatsApp curtas e envolventes para enviar a um cliente chamado "${lead?.name || 'Cliente'}" que já participou de uma promoção anterior.

Informações do Cliente:
- Nome: ${lead?.name || 'Cliente'}
- Prêmio ganho anteriormente: ${lead?.prize || 'um prêmio'}
- Produto favorito: ${lead?.fav_product || 'não informado'}
- Dia preferido: ${lead?.day_pref || 'não informado'}
- Horário preferido: ${lead?.time_pref || 'não informado'}

Promoção Atual:
- Oferta: ${promotion}
- Tipo de produto: ${productType}

IMPORTANTE: Use as preferências do cliente (dia, horário e produto favorito) para personalizar as mensagens e torná-las mais relevantes e persuasivas.

Crie 3 versões diferentes:
1. PERSUASIVA: Focada em urgência, benefícios e call-to-action forte. Mencione as preferências dele.
2. BRINCALHONA: Tom descontraído, emojis e linguagem informal. Use as preferências de forma divertida.
3. NEUTRA: Profissional, clara e direta. Inclua as preferências de forma objetiva.

IMPORTANTE: Cada mensagem deve ter no máximo 4 linhas e incluir emojis apropriados.`,
        response_json_schema: {
          type: "object",
          properties: {
            persuasiva: { type: "string" },
            brincalhona: { type: "string" },
            neutra: { type: "string" }
          },
          required: ["persuasiva", "brincalhona", "neutra"]
        }
      });

      setGeneratedScripts(response);
    } catch (error) {
      alert('Erro ao gerar scripts. Tente novamente.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectScript = (type) => {
    setSelectedScript(generatedScripts[type]);
    setCustomMessage(generatedScripts[type]);
  };

  const handleSendMessage = async () => {
    if (!customMessage) {
      alert('Digite ou selecione uma mensagem');
      return;
    }
    
    setIsSending(true);
    await onSend(customMessage);
    
    // Reset
    setPromotion('');
    setProductType('');
    setGeneratedScripts(null);
    setSelectedScript('');
    setCustomMessage('');
    setIsSending(false);
  };

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[4000]"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
    >
      <div 
        className="w-[95%] max-w-[700px] p-[30px] rounded-[20px] bg-white max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 40px rgba(108, 92, 231, 0.3)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        <div className="mb-5">
          <h3 className="text-[#2d3436] font-bold text-xl mb-1">
            <i className="fas fa-magic mr-2 text-[#6c5ce7]"></i>
            Enviar Cupom
          </h3>
          <p className="text-[#636e72] text-sm">Cliente: <strong>{lead?.name || 'N/A'}</strong></p>
        </div>

        {!generatedScripts ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#2d3436] mb-2">
                <i className="fas fa-tag mr-1"></i> Qual promoção você quer enviar?
              </label>
              <SoftInput
                placeholder="Ex: 50% OFF, 2 por 1, R$ 20 de desconto..."
                value={promotion}
                onChange={(e) => setPromotion(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2d3436] mb-2">
                <i className="fas fa-hamburger mr-1"></i> Para qual tipo de produto?
              </label>
              <SoftInput
                placeholder="Ex: pizzas, hambúrgueres, sobremesas..."
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              />
            </div>

            <div 
              className="p-4 rounded-lg"
              style={{ background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.2)' }}
            >
              <div className="flex items-start gap-2">
                <i className="fas fa-robot text-[#6c5ce7] text-xl mt-0.5"></i>
                <div>
                  <p className="font-semibold text-[#2d3436] mb-1">Remarketing Inteligente com IA</p>
                  <p className="text-sm text-[#636e72]">
                    Nossa IA vai gerar 3 versões de mensagem diferentes (persuasiva, brincalhona e neutra) 
                    para você escolher a mais adequada ao seu público.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <SoftButton onClick={onClose} className="flex-1">
                Cancelar
              </SoftButton>
              <SoftButton 
                variant="primary" 
                onClick={handleGenerateScripts}
                disabled={isGenerating || !promotion || !productType}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-wand-magic-sparkles mr-2"></i>
                    Gerar Scripts com IA
                  </>
                )}
              </SoftButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100">
                <i className="fas fa-check-circle text-green-600"></i>
                <span className="text-sm font-semibold text-green-700">3 Scripts Gerados!</span>
              </div>
            </div>

            {/* Script Persuasivo */}
            <div 
              onClick={() => handleSelectScript('persuasiva')}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedScript === generatedScripts.persuasiva 
                  ? 'border-2 border-[#6c5ce7] bg-[#6c5ce7]/5' 
                  : 'border border-gray-200 hover:border-[#6c5ce7]/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-bullhorn text-red-500"></i>
                <span className="font-bold text-[#2d3436]">PERSUASIVA</span>
                {selectedScript === generatedScripts.persuasiva && (
                  <i className="fas fa-check-circle text-[#6c5ce7] ml-auto"></i>
                )}
              </div>
              <p className="text-sm text-[#2d3436] whitespace-pre-wrap">{generatedScripts.persuasiva}</p>
            </div>

            {/* Script Brincalhão */}
            <div 
              onClick={() => handleSelectScript('brincalhona')}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedScript === generatedScripts.brincalhona 
                  ? 'border-2 border-[#6c5ce7] bg-[#6c5ce7]/5' 
                  : 'border border-gray-200 hover:border-[#6c5ce7]/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-smile-beam text-yellow-500"></i>
                <span className="font-bold text-[#2d3436]">BRINCALHONA</span>
                {selectedScript === generatedScripts.brincalhona && (
                  <i className="fas fa-check-circle text-[#6c5ce7] ml-auto"></i>
                )}
              </div>
              <p className="text-sm text-[#2d3436] whitespace-pre-wrap">{generatedScripts.brincalhona}</p>
            </div>

            {/* Script Neutro */}
            <div 
              onClick={() => handleSelectScript('neutra')}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedScript === generatedScripts.neutra 
                  ? 'border-2 border-[#6c5ce7] bg-[#6c5ce7]/5' 
                  : 'border border-gray-200 hover:border-[#6c5ce7]/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-balance-scale text-blue-500"></i>
                <span className="font-bold text-[#2d3436]">NEUTRA</span>
                {selectedScript === generatedScripts.neutra && (
                  <i className="fas fa-check-circle text-[#6c5ce7] ml-auto"></i>
                )}
              </div>
              <p className="text-sm text-[#2d3436] whitespace-pre-wrap">{generatedScripts.neutra}</p>
            </div>

            {/* Área de edição */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3436] mb-2">
                Mensagem (editável)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 rounded-xl border-none resize-none"
                style={{
                  background: '#eef2f5',
                  boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
                  minHeight: '120px',
                  fontFamily: 'inherit'
                }}
                placeholder="Clique em um dos scripts acima ou digite sua própria mensagem..."
              />
            </div>

            <div className="flex gap-3">
              <SoftButton 
                onClick={() => {
                  setGeneratedScripts(null);
                  setSelectedScript('');
                  setCustomMessage('');
                }}
                className="flex-1"
              >
                <i className="fas fa-arrow-left mr-2"></i> Voltar
              </SoftButton>
              <SoftButton 
                variant="whatsapp" 
                onClick={handleSendMessage}
                disabled={!customMessage || isSending}
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Enviando...
                  </>
                ) : (
                  <>
                    <i className="fab fa-whatsapp mr-2"></i> Enviar WhatsApp
                  </>
                )}
              </SoftButton>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scaleUp { 
          from { transform: scale(0.9); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        }
      `}</style>
    </div>
  );
}