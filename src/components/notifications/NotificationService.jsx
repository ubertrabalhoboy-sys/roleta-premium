import { supabaseHelper } from '@/components/utils/supabaseClient';

export class NotificationService {
  
  // Criar notificação
  static async create(data) {
    return await supabaseHelper.Notification.create(data);
  }

  // Verificar e criar notificação de lead quente
  static async checkHotLead(lead, restaurantId) {
    if (lead.day_pref && lead.time_pref && lead.fav_product) {
      // Verificar se já existe uma notificação não lida para este lead
      const existingNotifications = await supabaseHelper.Notification.filter({
        restaurant_id: restaurantId,
        type: 'hot_lead'
      });
      
      const hasNotification = existingNotifications.some(
        n => !n.read && n.metadata?.lead_id === lead.id
      );
      
      if (!hasNotification) {
        await this.create({
          restaurant_id: restaurantId,
          type: 'hot_lead',
          title: '🔥 Lead Quente Detectado!',
          message: `${lead.name} completou todos os dados. Pronto para conversão!`,
          priority: 'high',
          metadata: {
            lead_id: lead.id,
            lead_name: lead.name,
            lead_phone: lead.phone
          }
        });
      }
    }
  }

  // Verificar tendência de prêmios
  static async checkPrizeTrend(prizes, leads, restaurantId) {
    const prizeCount = {};
    leads.forEach(lead => {
      if (lead.prize) {
        prizeCount[lead.prize] = (prizeCount[lead.prize] || 0) + 1;
      }
    });

    for (const [prize, count] of Object.entries(prizeCount)) {
      if (count >= 10) {
        await this.create({
          restaurant_id: restaurantId,
          type: 'prize_trend',
          title: '📊 Prêmio em Alta',
          message: `"${prize}" foi ganho ${count} vezes. Considere ajustar as chances.`,
          priority: 'medium',
          metadata: { prize, count }
        });
      }
    }
  }

  // Verificar inatividade
  static async checkInactivity(restaurant, lastLeadDate) {
    if (!lastLeadDate) return;
    
    const daysSinceLastLead = Math.floor((Date.now() - new Date(lastLeadDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastLead >= 7) {
      await this.create({
        restaurant_id: restaurant.id,
        type: 'inactivity',
        title: '⚠️ Inatividade Detectada',
        message: `Sem novos leads há ${daysSinceLastLead} dias. Verifique a roleta.`,
        priority: 'high',
        metadata: { days: daysSinceLastLead }
      });
    }
  }

  // Verificar marcos (milestones)
  static async checkMilestones(restaurant, leadsCount) {
    const milestones = [10, 50, 100, 250, 500, 1000];
    
    for (const milestone of milestones) {
      if (leadsCount === milestone) {
        await this.create({
          restaurant_id: restaurant.id,
          type: 'milestone',
          title: '🎉 Marco Alcançado!',
          message: `Parabéns! Você atingiu ${milestone} leads!`,
          priority: 'low',
          metadata: { milestone }
        });
      }
    }
  }

  // Marcar como lida
  static async markAsRead(notificationId) {
    return await supabaseHelper.Notification.update(notificationId, { read: true });
  }

  // Marcar todas como lidas
  static async markAllAsRead(restaurantId) {
    const notifications = await supabaseHelper.Notification.filter({ 
      restaurant_id: restaurantId,
      read: false 
    });
    
    await Promise.all(
      notifications.map(n => supabaseHelper.Notification.update(n.id, { read: true }))
    );
  }
}

export default NotificationService;