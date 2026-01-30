export default async function ProcessLeadSubmission({ restaurantId, name, phone, prize, dayPref, timePref, favProduct }, { base44 }) {
  try {
    // 1. Criar o lead no banco de dados
    const lead = await base44.entities.Lead.create({
      restaurant_id: restaurantId,
      name: name,
      phone: phone,
      prize: prize,
      day_pref: dayPref,
      time_pref: timePref,
      fav_product: favProduct,
      sent_by_admin: false,
      coupon_status: 'pending'
    });

    // 2. Buscar o restaurante
    const restaurant = await base44.entities.Restaurant.get(restaurantId);

    // 3. Enviar para o Cloudflare Worker (webhook externo)
    try {
      const response = await fetch('https://proxy-webhook.zapiguia.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storeId: restaurant.slug || restaurant.id,
          nome: name,
          telefone: phone
        })
      });

      // Atualizar status do cupom baseado na resposta
      if (response.ok) {
        await base44.entities.Lead.update(lead.id, { coupon_status: 'sent' });
      } else {
        await base44.entities.Lead.update(lead.id, { coupon_status: 'failed' });
      }
    } catch (webhookError) {
      console.error('Erro ao enviar webhook:', webhookError);
      await base44.entities.Lead.update(lead.id, { coupon_status: 'failed' });
    }

    // 4. Criar notificação de hot lead se todos os dados foram preenchidos
    if (dayPref && timePref && favProduct) {
      await base44.entities.Notification.create({
        restaurant_id: restaurantId,
        type: 'hot_lead',
        title: '🔥 Lead Quente Detectado!',
        message: `${name} completou todos os dados. Pronto para conversão!`,
        priority: 'high',
        metadata: {
          lead_id: lead.id,
          lead_name: name,
          lead_phone: phone
        }
      });
    }

    // 5. Atualizar métricas do restaurante
    await base44.entities.Restaurant.update(restaurantId, {
      metrics_leads: (restaurant.metrics_leads || 0) + 1
    });

    // 6. Atualizar métricas diárias
    const today = new Date().toISOString().split('T')[0]; // yyyy-MM-dd
    const existingMetrics = await base44.entities.Metric.filter({ 
      restaurant_id: restaurantId, 
      date: today 
    });

    if (existingMetrics.length > 0) {
      const metric = existingMetrics[0];
      const updatedLeads = (metric.leads || 0) + 1;
      const totalAccess = metric.access || 0;
      
      await base44.entities.Metric.update(metric.id, {
        leads: updatedLeads,
        conversion_rate: totalAccess > 0 ? (updatedLeads / totalAccess) * 100 : 0
      });
    }

    return {
      success: true,
      leadId: lead.id,
      message: 'Lead processado com sucesso'
    };

  } catch (error) {
    console.error('Erro ao processar lead:', error);
    return {
      success: false,
      error: error.message
    };
  }
}