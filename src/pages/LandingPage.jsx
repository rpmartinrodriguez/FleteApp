import React from 'react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="w-full max-w-4xl text-center animate-fadeIn">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Bienvenido a FleteApp</h1>
        <p className="mt-4 text-lg text-gray-600">La forma más fácil de encontrar u ofrecer servicios de flete.</p>
      </header>
      <main>
        <h2 className="text-2xl font-semibold mb-6">¿Cómo quieres empezar?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div onClick={() => onNavigate('auth', { userType: 'client' })} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <h3 className="text-2xl font-bold mb-2">Soy Cliente</h3>
            <p className="text-gray-500">Necesito encontrar un servicio de flete.</p>
          </div>
          <div onClick={() => onNavigate('auth', { userType: 'provider' })} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <h3 className="text-2xl font-bold mb-2">Soy Proveedor</h3>
            <p className="text-gray-500">Quiero ofrecer mis servicios de flete.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
