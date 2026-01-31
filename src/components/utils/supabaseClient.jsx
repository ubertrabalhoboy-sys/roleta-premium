import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rcnqcaaffubdtwcroitz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbnFjYWFmZnViZHR3Y3JvaXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDYyNDUsImV4cCI6MjA4NTQyMjI0NX0.dywBYGIlDelQswuVsAzzT1Xpfl5vKLMdza9k7nYh7EE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions to match Base44 API
export const supabaseHelper = {
  // Restaurant operations
  Restaurant: {
    async list() {
      const { data, error } = await supabase.from('restaurant').select('*');
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('restaurant').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const restaurantData = {
        ...payload,
        id: payload.id || crypto.randomUUID(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('restaurant')
        .insert([restaurantData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('restaurant')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('restaurant').delete().eq('id', id);
      if (error) throw error;
    }
  },
  
  // Lead operations
  Lead: {
    async list() {
      const { data, error } = await supabase.from('lead').select('*');
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('lead').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('lead')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('lead')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('lead').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Prize operations
  Prize: {
    async list() {
      const { data, error } = await supabase.from('prize').select('*');
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('prize').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('prize')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('prize')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('prize').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // FoodOption operations
  FoodOption: {
    async list() {
      const { data, error } = await supabase.from('foodoption').select('*');
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('foodoption')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('foodoption').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Notification operations
  Notification: {
    async list() {
      const { data, error } = await supabase.from('notification').select('*');
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('notification').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('notification')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('notification')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('notification').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Metric operations
  Metric: {
    async list() {
      const { data, error } = await supabase.from('metric').select('*');
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('metric').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('metric')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('metric')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }
};