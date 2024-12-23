import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { documentService } from '../services/documentService';

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getAllDocuments();
      setDocuments(data);
    } catch (error) {
      setError('Erreur lors de la récupération des documents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createNewDocument = async (type) => {
    try {
      const document = await documentService.createDocument({
        type,
        template: 'default',
        content: {
          clientName: '',
          items: [],
          total: 0
        }
      });
      navigate(`/editor/${document.id}`);
    } catch (error) {
      setError('Erreur lors de la création du document');
      console.error(error);
    }
  };

  const deleteDocument = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await documentService.deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
      } catch (error) {
        setError('Erreur lors de la suppression du document');
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-end space-x-4 mb-6">
            <button
              onClick={() => createNewDocument('invoice')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Nouvelle Facture
            </button>
            <button
              onClick={() => createNewDocument('quote')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Nouveau Devis
            </button>
          </div>

          {loading ? (
            <div>Chargement...</div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <li key={doc._id}>
                    <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {doc.number}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/editor/${doc._id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => window.open(`/api/documents/${doc._id}/pdf`, '_blank')}
                          className="text-green-600 hover:text-green-900"
                        >
                          PDF
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 