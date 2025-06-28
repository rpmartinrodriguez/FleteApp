import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Este componente muestra la lista de fletes de un cliente
function ClientRequestsList({ db, userId, setNotification }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const requestsRef = collection(db, "freight_requests");
    const q = query(requestsRef, where("clientId", "==", userId));

    // onSnapshot escucha en tiempo real los cambios en la base de datos
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userRequests = [];
      querySnapshot.forEach((doc) => {
        userRequests.push({ id: doc.id, ...doc.data() });
      });
      setRequests(userRequests);
      setIsLoading(false);
    }, (error) => {
      console.error("Error al escuchar solicitudes:", error);
      setNotification({ message: "No se pudieron cargar tus solicitudes." });
      setIsLoading(false);
    });

    // Se retorna la función de limpieza para dejar de escuchar cuando el componente se desmonta
    return () => unsubscribe();
  }, [db, userId, setNotification]);

  if (isLoading) {
    return <div className="text-center p-8">Cargando tus solicitudes...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-8 rounded-lg">
        <p>Aún no has creado ninguna solicitud de flete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map(request => (
        <div key={request.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg">{request.origin} &rarr; {request.destination}</p>
              <p className="text-sm text-gray-600">Fecha: {request.freightDate}</p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{request.description}</p>
            </div>
            <span className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${request.status === 'pendiente' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
              {request.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Este es el componente principal de la página del cliente
export default function ClientDashboard({ userData, handleLogout, onOpenModal, db, setNotification }) {
  return (
    <div className="w-full max-w-4xl animate-fadeIn">
      <header className="w-full flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl font-bold">Panel de Cliente</h2>
          <p className="text-gray-600">Hola, {userData.name}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Cerrar Sesión</button>
      </header>
      <main className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Mis Solicitudes de Flete</h3>
          <button onClick={onOpenModal} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-semibold">
            Crear Nueva Solicitud
          </button>
        </div>
        <ClientRequestsList db={db} userId={userData.uid} setNotification={setNotification} />
      </main>
    </div>
  );
}
