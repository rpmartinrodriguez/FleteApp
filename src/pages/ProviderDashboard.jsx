import React from 'react';

// Por ahora, este panel es simple. Lo haremos más complejo en la Parte 3.
export default function ProviderDashboard({ userData, handleLogout }) {
  return (
    <div className="w-full max-w-4xl animate-fadeIn">
      <header className="w-full flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl font-bold">Panel de Proveedor</h2>
          <p className="text-gray-600">Hola, {userData.name}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md">Cerrar Sesión</button>
      </header>
      <main className="w-full bg-white p-6 rounded-lg shadow-md text-center">
        <p>Aquí verás los fletes disponibles para ofertar.</p>
      </main>
    </div>
  );
}
