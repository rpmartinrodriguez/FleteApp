import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Importamos nuestras páginas y componentes
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CreateRequestModal from './components/CreateRequestModal.jsx';

// --- Configuración e Inicialización de Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyDE3sbD3yMQjlQfn1sHyRD9A10x4kDL0fs",
    authDomain: "flete-app-97c40.firebaseapp.com",
    projectId: "flete-app-97c40",
    storageBucket: "flete-app-97c40.appspot.com",
    messagingSenderId: "935943968349",
    appId: "1:935943968349:web:8a28af2cf4f1e7420edfb4"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializamos Firebase Storage

// --- Componentes de UI Globales ---
const Loader = () => ( <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div></div> );
const Notification = ({ message, isSuccess, onClear }) => { useEffect(() => { const timer = setTimeout(() => onClear(), 4000); return () => clearTimeout(timer); }, [onClear]); return ( <div className={`fixed top-5 right-5 text-white py-3 px-5 rounded-lg shadow-2xl z-50 ${isSuccess ? 'bg-green-500' : 'bg-red-600'}`}><p className="font-semibold">{message}</p></div> ); };
const Logo = () => ( <div className="flex items-center justify-center gap-3 mb-12"><svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 16.5V14C14 12.8954 13.1046 12 12 12H11C9.89543 12 9 12.8954 9 14V16.5M12 12V2H8.5C7.11929 2 6 3.11929 6 4.5V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 12L17 9L14 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12H17.5C18.8807 12 20 13.1193 20 14.5C20 15.8807 18.8807 17 17.5 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span className="text-4xl font-extrabold text-slate-800">FleteApp</span></div> );

// --- Componente Principal de la Aplicación ---
export default function App() {
    const [page, setPage] = useState('landing');
    const [pageProps, setPageProps] = useState({});
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [uploadsInProgress, setUploadsInProgress] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setIsLoading(true);
        if (firebaseUser) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const unsubDoc = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.role === 'client' || data.role === 'provider') {
                setUser(firebaseUser);
                setUserData(data);
                // Si el usuario es proveedor y no está en la página de perfil, lo mandamos a su dashboard.
                if (data.role === 'provider' && page !== 'providerProfile') {
                    setPage('providerDashboard');
                }
              } else {
                setNotification({ message: "Error en el perfil de usuario. Contacta a soporte." });
                signOut(auth);
              }
            } else {
              setNotification({ message: "Tu perfil de usuario no fue encontrado. Por favor, regístrate de nuevo." });
              signOut(auth);
            }
            setIsLoading(false);
          });
          return () => unsubDoc();
        } else {
          setUser(null); setUserData(null); setPage('landing');
          setIsLoading(false);
        }
      });
      return () => unsubscribe();
    }, []);

    const handleNavigate = (newPage, props = {}) => {
        // Lógica de navegación corregida y simplificada
        if (newPage === 'profile' && userData?.role === 'provider') {
            setPage('providerProfile');
        } else {
            setPage(newPage);
        }
        setPageProps(props);
    };

    const handleLogout = async () => { 
        await signOut(auth);
        setPage('landing'); // Redirige a landing al cerrar sesión
    };

    const handleAuthSubmit = async (e, isLogin) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      setIsLoading(true);
      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, data.email, data.password);
        } else {
          const isProvider = pageProps.userType === 'provider';
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
          const newUserData = {
            uid: userCredential.user.uid, name: data.name, email: data.email, role: pageProps.userType, createdAt: new Date(),
            ...(isProvider && { phone: data.phone, vehicleType: data.vehicleType, licensePlate: data.licensePlate, verificationStatus: 'No Verificado', documents: {} })
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

    const handleFileUpload = (docType, file, setProgress) => {
      if (!user) return;
      const filePath = `provider_documents/${user.uid}/${docType}_${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      setUploadsInProgress(prev => ({ ...prev, [docType]: true }));
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(progress);
        },
        (error) => {
          console.error("Error al subir archivo:", error);
          setNotification({ message: `Error al subir ${docType}.` });
          setUploadsInProgress(prev => ({ ...prev, [docType]: false }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, { [`documents.${docType}`]: downloadURL });
          setNotification({ message: `${docType} subido con éxito.`, isSuccess: true });
          setUploadsInProgress(prev => ({ ...prev, [docType]: false }));
          const updatedDoc = await getDoc(userDocRef);
          const docs = updatedDoc.data().documents;
          if (docs.license && docs.insurance && docs.vehicle) {
            await updateDoc(userDocRef, { verificationStatus: 'Pendiente de Revisión' });
            setNotification({ message: "¡Todos los documentos subidos! Tu perfil está en revisión.", isSuccess: true });
          }
        }
      );
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

    const renderPage = () => {
        if (isLoading) return <Loader />;

        if (user && userData) {
            switch (userData.role) {
                case 'client':
                    return <ClientDashboard 
                                userData={userData} 
                                handleLogout={handleLogout} 
                                onOpenModal={() => setIsModalOpen(true)}
                                db={db}
                                setNotification={setNotification}
                            />;
                case 'provider':
                    if (page === 'providerProfile') {
                        return <ProfilePage userData={userData} handleFileUpload={handleFileUpload} uploadsInProgress={uploadsInProgress} />;
                    }
                    // Por defecto, el proveedor siempre ve su dashboard
                    return <ProviderDashboard userData={userData} handleLogout={handleLogout} onNavigate={handleNavigate} />;
                default:
                    return <Loader />;
            }
        }

        switch (page) {
            case 'auth': return <AuthPage onNavigate={handleNavigate} handleAuthSubmit={handleAuthSubmit} setNotification={setNotification} {...pageProps} />;
            default: return <LandingPage onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="min-h-screen font-sans flex flex-col items-center p-4">
            {notification && <Notification message={notification.message} isSuccess={notification.isSuccess} onClear={() => setNotification(null)} />}
            <div className="w-full mt-10">
              <div className="w-full max-w-5xl mx-auto">
                {(!user || page === 'landing') && <Logo />}
                {renderPage()}
              </div>
            </div>
            <CreateRequestModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRequest}
                setNotification={setNotification}
            />
        </div>
    );
}
