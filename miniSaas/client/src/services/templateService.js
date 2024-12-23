import { supabase } from '../config/supabaseClient';

export const templateService = {
  async getAllTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getTemplate(name) {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('name', name)
      .single();

    if (error) throw error;
    return data;
  },

  async createTemplate(template) {
    const { data, error } = await supabase
      .from('templates')
      .insert([template])
      .single();

    if (error) throw error;
    return data;
  },

  async updateTemplate(name, updates) {
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('name', name)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTemplate(name) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('name', name);

    if (error) throw error;
  }
}; 