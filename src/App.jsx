import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';

// Importamos nuestras páginas y componentes desde sus archivos separados
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import CreateRequestModal from './components/CreateRequestModal.jsx';

// --- Configuración de Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyDE3sbD3yMQjlQfn1sHyRD9A10x4kDL0fs",
    authDomain: "flete-app-97c40.firebaseapp.com",
    projectId: "flete-app-97c40",
    storageBucket: "flete-app-97c40.appspot.com",
    messagingSenderId: "935943968349",
    appId: "1:935943968349:web:8a28af2cf4f1e7420edfb4"
};

// --- Inicialización de Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Componentes de UI Globales ---
const Loader = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
);

const Notification = ({ message, isSuccess, onClear }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClear(), 4000);
        return () => clearTimeout(timer);
    }, [onClear]);

    return (
        <div className={`fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg z-50 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
            <p>{message}</p>
        </div>
    );
};

// --- Componente Principal de la Aplicación ---
export default function App() {
    // --- State Management ---
    const [page, setPage] = useState('landing');
    const [pageProps, setPageProps] = useState({});
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Auth Listener Effect ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setIsLoading(true);
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                setUser(firebaseUser);
                setUserData(userDoc.exists() ? userDoc.data() : null);
            } else {
                setUser(null);
                setUserData(null);
                setPage('landing');
            }
            setIsLoading(false);
        });
        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    // --- Handler Functions ---
    const handleNavigate = (newPage, props = {}) => {
        setPage(newPage);
        setPageProps(props);
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const handleAuthSubmit = async (e, isLogin) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        if (!data.email || !data.password) {
            setNotification({ message: "Email y contraseña son requeridos." });
            return;
        }
        setIsLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, data.email, data.password);
            } else {
                const isProvider = pageProps.userType === 'provider';
                if (!data.name || (isProvider && (!data.phone || !data.vehicleType || !data.licensePlate))) {
                    setNotification({ message: "Por favor, completa todos los campos de registro." });
                    setIsLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                const newUserData = {
                    uid: userCredential.user.uid,
                    name: data.name,
                    email: data.email,
                    role: pageProps.userType,
                    createdAt: new Date(),
                    ...(isProvider && { phone: data.phone, vehicleType: data.vehicleType, licensePlate: data.licensePlate })
                };
                await setDoc(doc(db, "users", userCredential.user.uid), newUserData);
            }
        } catch (error) {
            let msg = "Ocurrió un error.";
            if (error.code === 'auth/email-already-in-use') msg = "Este correo ya está registrado.";
            else if (error.code === 'auth/invalid-credential') msg = "Correo o contraseña incorrectos.";
            else if (error.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres.";
            setNotification({ message: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveRequest = async (formData) => {
        if (!user) {
            setNotification({ message: "Debes iniciar sesión para crear una solicitud." });
            return;
        }
        setIsLoading(true);
        try {
            await addDoc(collection(db, "freight_requests"), {
                ...formData,
                clientId: user.uid,
                clientEmail: user.email,
                status: 'pendiente',
                createdAt: new Date()
            });
            setNotification({ message: "Solicitud creada con éxito.", isSuccess: true });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error al crear la solicitud:", error);
            setNotification({ message: "No se pudo crear la solicitud." });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Page Rendering Logic ---
    const renderPage = () => {
        if (isLoading) return <Loader />;

        if (user && userData) {
            if (userData.role === 'client') {
                return <ClientDashboard
                    userData={userData}
                    handleLogout={handleLogout}
                    onOpenModal={() => setIsModalOpen(true)}
                    db={db}
                    setNotification={setNotification}
                />;
            }
            if (userData.role === 'provider') {
                return <ProviderDashboard userData={userData} handleLogout={handleLogout} />;
            }
        }

        switch (page) {
            case 'auth':
                return <AuthPage
                    onNavigate={handleNavigate}
                    handleAuthSubmit={handleAuthSubmit}
                    setNotification={setNotification}
                    {...pageProps}
                />;
            default:
                return <LandingPage onNavigate={handleNavigate} />;
        }
    };

    // --- Final JSX Return ---
    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col items-center justify-center p-4">
            {notification && <Notification message={notification.message} isSuccess={notification.isSuccess} onClear={() => setNotification(null)} />}
            {renderPage()}
            <CreateRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRequest}
                setNotification={setNotification}
            />
        </div>
    );
}
