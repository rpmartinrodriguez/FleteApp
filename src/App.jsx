import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from 'firebase/firestore';

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

// --- Componentes de UI ---
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

// --- Componentes de Página ---
const LandingPage = ({ onNavigate }) => (
    <div className="w-full max-w-4xl text-center">
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

const AuthPage = ({ onNavigate, userType, setNotification }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const isProvider = userType === 'provider';
    const userTypeSpanish = isProvider ? 'Proveedor' : 'Cliente';

    const handleFormSubmit = async (e) => {
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
                if (!data.name || (isProvider && (!data.phone || !data.vehicleType || !data.licensePlate))) {
                    setNotification({ message: "Por favor, completa todos los campos de registro." });
                    setIsLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                const userData = {
                    uid: userCredential.user.uid, name: data.name, email: data.email, role: userType, createdAt: new Date(),
                    ...(isProvider && { phone: data.phone, vehicleType: data.vehicleType, licensePlate: data.licensePlate })
                };
                await setDoc(doc(db, "users", userCredential.user.uid), userData);
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

    return (
        <div className="w-full max-w-md">
            {isLoading && <Loader />}
            <div className="bg-white p-8 rounded-xl shadow-lg w-full">
                <button onClick={() => onNavigate('landing')} className="text-blue-500 hover:underline mb-4">&larr; Volver</button>
                <h2 className="text-3xl font-bold text-center mb-2">{isLogin ? 'Inicio de Sesión' : `Registro de ${userTypeSpanish}`}</h2>
                <form onSubmit={handleFormSubmit}>
                    {!isLogin && (
                        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label><input type="text" name="name" required className="w-full px-3 py-2 border rounded-md" /></div>
                    )}
                    <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label><input type="email" name="email" required className="w-full px-3 py-2 border rounded-md" /></div>
                    <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label><input type="password" name="password" required className="w-full px-3 py-2 border rounded-md" placeholder="Mínimo 6 caracteres" /></div>
                    {!isLogin && isProvider && (
                        <div className="space-y-4 mb-6 border-t pt-4">
                            <p className="text-sm font-semibold text-gray-600">Detalles del Proveedor</p>
                            <div><label className="block text-sm">Teléfono</label><input type="tel" name="phone" required className="w-full px-3 py-2 border rounded-md" /></div>
                            <div><label className="block text-sm">Tipo de Vehículo</label><input type="text" name="vehicleType" required className="w-full px-3 py-2 border rounded-md" /></div>
                            <div><label className="block text-sm">Patente</label><input type="text" name="licensePlate" required className="w-full px-3 py-2 border rounded-md" /></div>
                        </div>
                    )}
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</button>
                </form>
                <p className="text-center mt-6 text-sm">
                    {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-blue-600 hover:underline ml-1">{isLogin ? 'Regístrate' : 'Inicia Sesión'}</button>
                </p>
            </div>
        </div>
    );
};

const DashboardPage = ({ userData }) => (
    <div className="w-full max-w-4xl">
        <header className="w-full flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-md">
            <div>
                <h2 className="text-2xl font-bold">Panel de {userData.role === 'client' ? 'Cliente' : 'Proveedor'}</h2>
                <p className="text-gray-600">Hola, {userData.name}</p>
            </div>
            <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-4 py-2 rounded-md">Cerrar Sesión</button>
        </header>
        <main className="w-full bg-white p-6 rounded-lg shadow-md text-center">
            <p>{userData.role === 'client' ? 'Aquí verás tus solicitudes de flete.' : 'Aquí verás los fletes disponibles.'}</p>
        </main>
    </div>
);

// --- Componente Principal ---
export default function App() {
    const [page, setPage] = useState('landing');
    const [pageProps, setPageProps] = useState({});
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setIsLoading(true);
                const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                setUser(firebaseUser);
                setUserData(userDoc.exists() ? userDoc.data() : null);
                setIsLoading(false);
            } else {
                setUser(null); setUserData(null); setPage('landing'); setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleNavigate = (newPage, props = {}) => {
        setPage(newPage);
        setPageProps(props);
    };

    if (isLoading) return <Loader />;
    if (user && userData) return <DashboardPage userData={userData} />;

    switch (page) {
        case 'auth': return <AuthPage onNavigate={handleNavigate} setNotification={setNotification} {...pageProps} />;
        default: return <LandingPage onNavigate={handleNavigate} />;
    }
}
