import React from 'react';
import FileUpload from '../components/FileUpload.jsx';

// Muestra un badge con el estado de verificación
const VerificationStatus = ({ status }) => {
  const statusInfo = {
    'No Verificado': 'bg-red-100 text-red-800',
    'Pendiente de Revisión': 'bg-yellow-100 text-yellow-800',
    'Verificado': 'bg-green-100 text-green-800',
  };
  const statusText = {
    'No Verificado': 'Debes subir todos los documentos requeridos para que revisemos tu perfil.',
    'Pendiente de Revisión': 'Hemos recibido tus documentos. Los revisaremos pronto y te notificaremos.',
    'Verificado': '¡Felicidades! Tu perfil está verificado y ya puedes recibir solicitudes de flete.',
  };

  return (
    <div className={`p-4 rounded-lg mb-6 ${statusInfo[status] || 'bg-gray-100 text-gray-800'}`}>
      <h3 className="font-bold text-lg">Estado de Verificación: {status}</h3>
      <p className="text-sm mt-1">{statusText[status]}</p>
    </div>
  );
};

// La página de perfil completa
export default function ProfilePage({ userData, handleFileUpload, uploadsInProgress }) {

  return (
    <div className="w-full max-w-4xl animate-fadeIn">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Mi Perfil de Proveedor</h2>
        <p className="text-slate-500 mb-8">Gestiona tu información y documentos para empezar a trabajar.</p>

        <VerificationStatus status={userData.verificationStatus || 'No Verificado'} />

        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-slate-700 mb-4">Documentación Requerida</h4>
            <div className="space-y-4">
              <FileUpload
                docType="license"
                label="Carnet de Conducir"
                onFileUpload={handleFileUpload}
                existingFileUrl={userData.documents?.license}
                isUploading={uploadsInProgress.license}
              />
              <FileUpload
                docType="insurance"
                label="Comprobante de Seguro"
                onFileUpload={handleFileUpload}
                existingFileUrl={userData.documents?.insurance}
                isUploading={uploadsInProgress.insurance}
              />
              <FileUpload
                docType="vehicle"
                label="Foto del Vehículo"
                onFileUpload={handleFileUpload}
                existingFileUrl={userData.documents?.vehicle}
                isUploading={uploadsInProgress.vehicle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
