import { supabase } from '../config/supabaseClient';

export const userService = {
  async updateProfile(updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', supabase.auth.user().id)
      .single();

    if (error) throw error;
    return data;
  },

  async uploadLogo(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${supabase.auth.user().id}-logo.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { publicURL, error: urlError } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    if (urlError) throw urlError;

    await this.updateProfile({ logo: publicURL });
    return publicURL;
  }
}; 