import { supabase } from '../config/supabaseClient';

export const documentService = {
  async createDocument(data) {
    const { data: document, error } = await supabase
      .from('documents')
      .insert([{
        ...data,
        user_id: supabase.auth.user().id
      }])
      .single();

    if (error) throw error;
    return document;
  },

  async getAllDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDocument(id) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateDocument(id, updates) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDocument(id) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 