import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Este componente se conecta a Firebase y muestra los fletes pendientes.
export default function RequestList({ db, setNotification }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Creamos una consulta para traer solo los fletes con estado "pendiente"
    const requestsRef = collection(db, "freight_requests");
    const q = query(requestsRef, where("status", "==", "pendiente"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const availableRequests = [];
      querySnapshot.forEach((doc) => {
        availableRequests.push({ id: doc.id, ...doc.data() });
      });
      setRequests(availableRequests);
      setIsLoading(false);
    }, (error) => {
      console.error("Error al obtener fletes:", error);
      setNotification({ message: "No se pudieron cargar los fletes disponibles." });
      setIsLoading(false);
    });

    // Limpiamos el listener cuando el componente se desmonta
    return () => unsubscribe();
  }, [db, setNotification]);

  if (isLoading) {
    return <div className="text-center p-8">Buscando fletes disponibles...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-8 rounded-lg">
        <p>No hay fletes disponibles en este momento. ¡Vuelve a revisar pronto!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map(request => (
        <div key={request.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center">
              <p className="font-bold text-lg text-slate-800">{request.origin} &rarr; {request.destination}</p>
              <p className="text-sm font-medium text-slate-600">Fecha: {request.freightDate}</p>
            </div>
            <p className="mt-2 text-slate-700 whitespace-pre-wrap">{request.description}</p>
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
              <p className="text-sm text-slate-500">Solicitado por: {request.clientEmail}</p>
              <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-semibold">
                Hacer una Oferta
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
