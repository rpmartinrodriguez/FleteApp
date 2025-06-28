import React, { useState } from 'react';

export default function AuthPage({ onNavigate, userType, handleAuthSubmit, setNotification }) {
  const [isLogin, setIsLogin] = useState(true);
  const isProvider = userType === 'provider';
  const userTypeSpanish = isProvider ? 'Proveedor' : 'Cliente';

  return (
    <div className="w-full max-w-md animate-fadeIn">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full">
        <button onClick={() => onNavigate('landing')} className="text-blue-500 hover:underline mb-4">&larr; Volver</button>
        <h2 className="text-3xl font-bold text-center mb-2">{isLogin ? 'Inicio de Sesión' : `Registro de ${userTypeSpanish}`}</h2>
        <p className="text-center text-gray-500 mb-6">{isLogin ? 'Ingresa tus credenciales.' : 'Crea tu cuenta para continuar.'}</p>

        <form onSubmit={(e) => handleAuthSubmit(e, isLogin)}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input type="text" name="name" required className="w-full px-3 py-2 border rounded-md" />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" name="email" required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" name="password" required className="w-full px-3 py-2 border rounded-md" placeholder="Mínimo 6 caracteres" />
          </div>

          {!isLogin && isProvider && (
            <div className="space-y-4 mb-6 border-t pt-4">
              <p className="text-sm font-semibold text-gray-600">Detalles del Proveedor</p>
              <div><label className="block text-sm">Teléfono</label><input type="tel" name="phone" required className="w-full px-3 py-2 border rounded-md" /></div>
              <div><label className="block text-sm">Tipo de Vehículo</label><input type="text" name="vehicleType" required className="w-full px-3 py-2 border rounded-md" /></div>
              <div><label className="block text-sm">Patente</label><input type="text" name="licensePlate" required className="w-full px-3 py-2 border rounded-md" /></div>
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-blue-600 hover:underline ml-1">
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
