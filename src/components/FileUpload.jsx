import React, { useState, useRef } from 'react';

// Componente reutilizable para la subida de un archivo.
// Recibe props para saber qué documento es, el estado actual, y cómo manejar la subida.
export default function FileUpload({ docType, label, onFileUpload, existingFileUrl, isUploading }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Llama a la función del componente padre para iniciar la subida
      onFileUpload(docType, selectedFile, setProgress);
    }
  };

  const status = () => {
    if (isUploading) {
      return <span className="text-sm text-blue-600 font-semibold">Subiendo... {progress}%</span>;
    }
    if (existingFileUrl) {
      return <a href={existingFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 font-semibold hover:underline">✔️ Archivo Subido (Ver)</a>;
    }
    if (file) {
        return <span className="text-sm text-slate-600">{file.name}</span>;
    }
    return <span className="text-sm text-slate-500">Ningún archivo seleccionado.</span>;
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">{label}</p>
          <div className="mt-1">
            {status()}
          </div>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
          className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {existingFileUrl ? 'Reemplazar' : 'Seleccionar'}
        </button>
        <input
          type="file"
          accept="image/png, image/jpeg, application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {isUploading && (
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
}
