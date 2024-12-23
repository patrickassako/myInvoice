import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Profile() {
  const { currentUser, setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    phone: '',
    siret: '',
    tva: '',
    iban: '',
    bic: '',
    logo: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        companyName: currentUser.companyName || '',
        address: currentUser.address || '',
        phone: currentUser.phone || '',
        siret: currentUser.siret || '',
        tva: currentUser.tva || '',
        iban: currentUser.iban || '',
        bic: currentUser.bic || '',
        logo: currentUser.logo || ''
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put('/api/users/profile', formData);
      setCurrentUser(response.data);
      setSuccess('Profil mis à jour avec succès');
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('logo', file);

      try {
        const response = await axios.post('/api/users/upload-logo', formData);
        setFormData(prev => ({ ...prev, logo: response.data.logoUrl }));
      } catch (error) {
        setError('Erreur lors du téléchargement du logo');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <h2 className="text-2xl font-bold mb-6">Profil de l'entreprise</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... champs du formulaire ... */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Ajouter les autres champs de la même manière */}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile; 