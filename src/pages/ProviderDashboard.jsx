import React from 'react';
import RequestList from '../components/RequestList.jsx'; // Importamos el nuevo componente

// Mensaje que se muestra si el proveedor no está verificado
const VerificationNotice = ({ status, onNavigate }) => (
  <div className="text-center bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
    <h3 className="text-xl font-bold text-yellow-800">Tu cuenta no está verificada</h3>
    <p className="mt-2 text-yellow-700">
      {status === 'Pendiente de Revisión'
        ? 'Tus documentos están siendo revisados. Te notificaremos cuando el proceso finalice.'
        : 'Debes completar tu perfil y subir tus documentos para poder ver los fletes disponibles.'}
    </p>
    <button
      onClick={() => onNavigate('profile')}
      className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
    >
      Ir a Mi Perfil
    </button>
  </div>
);

// El panel del proveedor ahora decide qué mostrar basado en el estado de verificación
export default function ProviderDashboard({ userData, handleLogout, onNavigate, db, setNotification }) {
  const isVerified = userData.verificationStatus === 'Verificado';

  return (
    <div className="w-full max-w-4xl animate-fadeIn">
      <header className="w-full flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl font-bold">Panel de Proveedor</h2>
          <p className="text-gray-600">Hola, {userData.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('profile')} className="font-semibold text-blue-600 hover:underline">
            Mi Perfil
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md">Cerrar Sesión</button>
        </div>
      </header>
      <main className="w-full bg-white p-6 rounded-lg shadow-md">
        {isVerified ? (
          <>
            <h3 className="text-xl font-semibold mb-4">Fletes Disponibles</h3>
            {/* Aquí usamos el nuevo componente para mostrar la lista de fletes */}
            <RequestList db={db} setNotification={setNotification} />
          </>
        ) : (
          <VerificationNotice status={userData.verificationStatus} onNavigate={onNavigate} />
        )}
      </main>
    </div>
  );
}
