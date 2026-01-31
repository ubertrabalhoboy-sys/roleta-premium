import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null;

// Helper functions to match Base44 API
export const supabaseHelper = {
  // Restaurant operations
  Restaurant: {
    async list() {
      if (!supabase) throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      const { data, error } = await supabase.from('Restaurant').select('*');
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