import { format } from 'date-fns';

export default async function TrackRestaurantSpin({ restaurantId, prizeId }, { base44 }) {
  try {
    const restaurant = await base44.entities.Restaurant.get(restaurantId);
    await base44.entities.Restaurant.update(restaurantId, {
      metrics_spins: (restaurant.metrics_spins || 0) + 1
    });

    if (prizeId) {
      const prize = await base44.entities.Prize.get(prizeId);
      if (prize) {
        await base44.entities.Prize.update(prizeId, {
          current_count: (prize.current_count || 0) + 1
        });
      }
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const existingMetrics = await base44.entities.Metric.filter({
      restaurant_id: restaurantId,
      date: today
    });

    if (existingMetrics.length > 0) {
      await base44.entities.Metric.update(existingMetrics[0].id, {
        spins: (existingMetrics[0].spins || 0) + 1
      });
    } else {
      await base44.entities.Metric.create({
        restaurant_id: restaurantId,
        date: today,
        access: 0,
        spins: 1,
        leads: 0,
        conversion_rate: 0
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar giro:', error);
    return { success: false, error: error.message };
  }
}