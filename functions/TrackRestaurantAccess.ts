import { format } from 'date-fns';

export default async function TrackRestaurantAccess({ restaurantId }, { base44 }) {
  try {
    const restaurant = await base44.entities.Restaurant.get(restaurantId);
    await base44.entities.Restaurant.update(restaurantId, {
      metrics_access: (restaurant.metrics_access || 0) + 1
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    const existingMetrics = await base44.entities.Metric.filter({
      restaurant_id: restaurantId,
      date: today
    });

    if (existingMetrics.length > 0) {
      await base44.entities.Metric.update(existingMetrics[0].id, {
        access: (existingMetrics[0].access || 0) + 1
      });
    } else {
      await base44.entities.Metric.create({
        restaurant_id: restaurantId,
        date: today,
        access: 1,
        spins: 0,
        leads: 0,
        conversion_rate: 0
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
    return { success: false, error: error.message };
  }
}