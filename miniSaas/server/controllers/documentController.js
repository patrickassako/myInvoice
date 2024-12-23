const Document = require('../models/Document');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const emailService = require('../services/emailService');

exports.createDocument = async (req, res) => {
  try {
    const { type, template, content } = req.body;
    
    // Générer un numéro unique pour le document
    const count = await Document.countDocuments({ user: req.user._id });
    const number = `${type.toUpperCase()}-${Date.now()}-${count + 1}`;

    const document = new Document({
      user: req.user._id,
      type,
      number,
      template,
      content
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du document', error: error.message });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des documents', error: error.message });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findOne({ _id: id, user: req.user._id });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Lire le template HTML
    const templatePath = path.join(__dirname, `../templates/${document.template}.html`);
    const templateHtml = await fs.readFile(templatePath, 'utf-8');

    // Compiler le template avec Handlebars
    const template = handlebars.compile(templateHtml);
    const html = template({ ...document.content, user: req.user });

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();

    res.set('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du PDF', error: error.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du document', error: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Mise à jour des champs modifiables
    document.content = req.body.content;
    document.status = req.body.status || document.status;

    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du document', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({ 
      _id: req.params.id,
      user: req.user._id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    res.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du document', error: error.message });
  }
};

exports.sendDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, message } = req.body;

    const document = await Document.findOne({ 
      _id: id,
      user: req.user._id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    await emailService.sendDocument(document, req.user, email, message);
    
    // Mettre à jour le statut du document
    document.status = 'sent';
    await document.save();

    res.json({ message: 'Document envoyé avec succès' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi du document', 
      error: error.message 
    });
  }
}; 