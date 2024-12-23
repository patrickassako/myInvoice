import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { pdfService } from '../services/pdfService';

function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const doc = await documentService.getDocument(id);
      setDocument(doc);
    } catch (error) {
      setError('Erreur lors du chargement du document');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (field, value) => {
    setDocument(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const addItem = () => {
    setDocument(prev => ({
      ...prev,
      content: {
        ...prev.content,
        items: [
          ...prev.content.items,
          { description: '', quantity: 1, price: 0 }
        ]
      }
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...document.content.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    // Recalculer le total
    const total = newItems.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );

    setDocument(prev => ({
      ...prev,
      content: {
        ...prev.content,
        items: newItems,
        total
      }
    }));
  };

  const saveDocument = async () => {
    try {
      setSaving(true);
      await documentService.updateDocument(id, document);
      navigate('/dashboard');
    } catch (error) {
      setError('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const generateAndDownloadPDF = async () => {
    try {
      setSaving(true);
      const pdf = await pdfService.generatePDF(document, document.template);
      const pdfUrl = await pdfService.savePDF(id, pdf);
      
      // Mettre à jour le document avec l'URL du PDF
      await documentService.updateDocument(id, {
        ...document,
        pdfUrl
      });

      // Ouvrir le PDF dans un nouvel onglet
      window.open(pdfUrl, '_blank');
    } catch (error) {
      setError('Erreur lors de la génération du PDF');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {document.type === 'invoice' ? 'Facture' : 'Devis'} - {document.number}
          </h1>
          <div className="flex justify-end space-x-4">
            <button
              onClick={generateAndDownloadPDF}
              disabled={saving}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {saving ? 'Génération...' : 'Générer PDF'}
            </button>
            <button
              onClick={saveDocument}
              disabled={saving}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="space-y-6">
            {/* Informations client */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Client
              </label>
              <input
                type="text"
                value={document.content.clientName || ''}
                onChange={(e) => handleContentChange('clientName', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Nom du client"
              />
            </div>

            {/* Liste des articles */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Articles</h3>
                <button
                  onClick={addItem}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Ajouter un article
                </button>
              </div>
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {document.content.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          className="block w-24 border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                          className="block w-32 border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {(item.quantity * item.price).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 text-right">
                <p className="text-xl font-bold">
                  Total: {document.content.total.toFixed(2)} €
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentEditor; 