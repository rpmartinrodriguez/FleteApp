import React, { useState } from 'react';

// Este es un componente "controlado", lo que significa que React maneja el estado de los inputs.
export default function CreateRequestModal({ isOpen, onClose, onSave, setNotification }) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    freightDate: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.description.trim()) {
      setNotification({ message: "Primero escribe una lista simple de tu carga." });
      return;
    }
    setIsLoading(true);
    const prompt = `Basado en la siguiente lista de items para un flete, genera una descripción un poco más detallada y formal para el transportista. Sé amable y claro. Lista de items: "${formData.description}"`;
    try {
      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiKey = ""; // Provided by the environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('API Error');
      const result = await response.json();
      const generatedText = result.candidates[0].content.parts[0].text;
      setFormData(prev => ({ ...prev, description: generatedText }));
    } catch (error) {
      setNotification({ message: "Hubo un error al contactar a la IA." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pasamos los datos del formulario a la función onSave que viene del componente padre (App.jsx)
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-slideInUp">
        <h3 className="text-2xl font-bold mb-6">Nueva Solicitud de Flete</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
              <input type="text" name="origin" value={formData.origin} onChange={handleChange} placeholder="Ej: Av. Siempreviva 742" required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
              <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="Ej: Gualeguaychú, Entre Ríos" required className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="freightDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha del Flete</label>
            <input type="date" name="freightDate" value={formData.freightDate} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción de la Carga</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Ej: 1 heladera, 4 cajas, 1 sofá" required className="w-full px-3 py-2 border rounded-md"></textarea>
          </div>
          <div className="mb-6">
            <button type="button" onClick={handleGenerateDescription} disabled={isLoading} className="w-full text-sm font-semibold py-2 px-4 rounded-md gemini-button disabled:opacity-50">
              {isLoading ? 'Generando...' : '✨ Generar Descripción Detallada con IA'}
            </button>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md">Guardar Solicitud</button>
          </div>
        </form>
      </div>
    </div>
  );
}
