import { supabase } from '../config/supabaseClient';
import html2pdf from 'html2pdf.js';

export const pdfService = {
  async generatePDF(document, template) {
    try {
      // Récupérer le template HTML
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('content')
        .eq('name', template)
        .single();

      if (templateError) throw templateError;

      // Remplacer les variables dans le template
      let htmlContent = templateData.content;
      htmlContent = htmlContent.replace(/{{([^}]+)}}/g, (match, key) => {
        return document.content[key.trim()] || '';
      });

      // Générer le PDF
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      document.body.appendChild(element);

      const options = {
        margin: 10,
        filename: `${document.type}_${document.number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdf = await html2pdf().set(options).from(element).save();
      document.body.removeChild(element);
      return pdf;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  },

  async savePDF(documentId, pdfFile) {
    const fileName = `${documentId}.pdf`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, pdfFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { publicURL, error: urlError } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);

    if (urlError) throw urlError;

    return publicURL;
  }
}; 