import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rcnqcaaffubdtwcroitz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbnFjYWFmZnViZHR3Y3JvaXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDYyNDUsImV4cCI6MjA4NTQyMjI0NX0.dywBYGIlDelQswuVsAzzT1Xpfl5vKLMdza9k7nYh7EE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions to match Base44 API
export const supabaseHelper = {
  // Restaurant operations
  Restaurant: {
    async list() {
      // Testando ambos os casos (maiúsculo e minúsculo)
      let { data, error } = await supabase.from('restaurant').select('*');
      if (error) {
        // Tentar com R maiúsculo se falhar
        const retry = await supabase.from('Restaurant').select('*');
        data = retry.data;
        error = retry.error;
      }
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('Restaurant').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('Restaurant')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('Restaurant')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('Restaurant').delete().eq('id', id);
      if (error) throw error;
    }
  },
  
  // Lead operations
  Lead: {
    async list() {
      const { data, error } = await supabase.from('Lead').select('*');
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('Lead').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('Lead')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('Lead')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('Lead').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Prize operations
  Prize: {
    async list() {
      const { data, error } = await supabase.from('Prize').select('*');
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('Prize').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('Prize')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('Prize')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('Prize').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // FoodOption operations
  FoodOption: {
    async list() {
      const { data, error } = await supabase.from('FoodOption').select('*');
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('FoodOption')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('FoodOption').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Notification operations
  Notification: {
    async list() {
      const { data, error } = await supabase.from('Notification').select('*');
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('Notification').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('Notification')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('Notification')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('Notification').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Metric operations
  Metric: {
    async list() {
      const { data, error } = await supabase.from('Metric').select('*');
      if (error) throw error;
      return data || [];
    },
    async filter(conditions) {
      let query = supabase.from('Metric').select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase
        .from('Metric')
        .insert([{ ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString(), updated_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('Metric')
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }
};