const nodemailer = require('nodemailer');
const config = require('../config/config');
const handlebars = require('../utils/handlebarHelpers');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass
      }
    });
  }

  async sendDocument(document, user, recipientEmail, message) {
    try {
      // Générer le PDF
      const pdf = await this.generatePDF(document, user);
      
      // Préparer l'email
      const mailOptions = {
        from: `"${user.companyName}" <${config.mail.user}>`,
        to: recipientEmail,
        subject: `${document.type === 'invoice' ? 'Facture' : 'Devis'} - ${document.number}`,
        html: `
          <p>Bonjour,</p>
          <p>${message || `Veuillez trouver ci-joint votre ${document.type === 'invoice' ? 'facture' : 'devis'}.`}</p>
          <p>Cordialement,<br>${user.companyName}</p>
        `,
        attachments: [{
          filename: `${document.type}_${document.number}.pdf`,
          content: pdf
        }]
      };

      // Envoyer l'email
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  async generatePDF(document, user) {
    // Réutiliser la logique de génération de PDF existante
    // ... (code similaire à documentController.generatePDF)
  }
}

module.exports = new EmailService(); 