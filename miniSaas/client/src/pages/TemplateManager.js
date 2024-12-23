import React, { useState, useEffect } from 'react';
import { templateService } from '../services/templateService';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';

function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await templateService.getAllTemplates();
      setTemplates(data);
    } catch (error) {
      setError('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (name) => {
    try {
      const template = await templateService.getTemplate(name);
      setSelectedTemplate(template);
      setEditMode(false);
    } catch (error) {
      setError('Erreur lors du chargement du template');
    }
  };

  const handleSave = async () => {
    try {
      if (selectedTemplate.id) {
        await templateService.updateTemplate(selectedTemplate.name, {
          content: selectedTemplate.content
        });
      } else {
        await templateService.createTemplate(selectedTemplate);
      }
      setSuccess('Template sauvegardé avec succès');
      loadTemplates();
      setEditMode(false);
    } catch (error) {
      setError('Erreur lors de la sauvegarde du template');
    }
  };

  const handleDelete = async (name) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      try {
        await templateService.deleteTemplate(name);
        setSuccess('Template supprimé avec succès');
        loadTemplates();
        setSelectedTemplate(null);
      } catch (error) {
        setError('Erreur lors de la suppression du template');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Templates
            </h1>
            <button
              onClick={() => {
                setSelectedTemplate({ name: '', content: '' });
                setEditMode(true);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Nouveau Template
            </button>
          </div>

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

          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">Templates</h2>
              <ul className="space-y-2">
                {templates.map((template) => (
                  <li
                    key={template.id}
                    className={`cursor-pointer p-2 rounded ${
                      selectedTemplate?.name === template.name
                        ? 'bg-indigo-100'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleTemplateSelect(template.name)}
                  >
                    {template.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-3 bg-white shadow rounded-lg p-4">
              {selectedTemplate && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <input
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          name: e.target.value
                        })
                      }
                      disabled={!editMode}
                      className="text-xl font-medium bg-transparent border-b-2 border-transparent focus:border-indigo-500 focus:outline-none"
                    />
                    <div className="space-x-2">
                      {!editMode ? (
                        <>
                          <button
                            onClick={() => setEditMode(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(selectedTemplate.name)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => setEditMode(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <CodeMirror
                    value={selectedTemplate.content}
                    height="500px"
                    extensions={[html()]}
                    onChange={(value) =>
                      setSelectedTemplate({
                        ...selectedTemplate,
                        content: value
                      })
                    }
                    readOnly={!editMode}
                    theme="light"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateManager; 