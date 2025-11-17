import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { LogIn, LayoutDashboard, Database, HardDrive, ListOrdered, Wrench, Menu, X, ArrowUpRight, Plus, Pencil, Trash2, CheckCircle, AlertTriangle, RefreshCw, User, Users, ClipboardList, Zap, Settings, Shield, ChevronDown, Check, Circle, ExternalLink, Calendar, Send, CornerUpLeft } from 'lucide-react';

// 1. IMPORTACIÓN DEL LOGO: Usa esta línea si tu imagen está en 'src/assets/login.png'
import TherapedicLogo from './assets/login.png'; 


// --- CONFIGURACIÓN GLOBAL ---
const API_BASE_URL = 'http://localhost:5000/api';

// --- CONTEXTO DE AUTENTICACIÓN (Sin cambios) ---
const AuthContext = createContext(null);

const useAuth = () => {
    return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Error parsing user data:", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario: username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Error de autenticación' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'No se pudo conectar con el servidor API.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const getToken = () => localStorage.getItem('token');
    const isAdmin = user?.rol === 'Admin';
    const userId = user?.usuarioIDTID;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, getToken, isAdmin, userId }}>
            {children}
        </AuthContext.Provider>
    );
};

// --- COMPONENTES UI BÁSICOS (Sin cambios) ---

const Toast = ({ message, type, onClose }) => {
    const icon = type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />;
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white flex items-center space-x-3 transition-opacity duration-300 ${bgColor}`}>
            {icon}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-indigo-600 font-semibold">Cargando datos...</span>
    </div>
);

// --- PANTALLA DE LOGIN (MODIFICADA) ---
const LoginPage = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        const result = await login(username, password);

        if (result.success) {
            setToast({ message: '¡Autenticación exitosa! Redirigiendo...', type: 'success' });
        } else {
            setMessage(result.message);
            setToast({ message: result.message, type: 'error' });
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                
                {/* 2. REEMPLAZO DEL LOGO */}
                <div className="flex justify-center mb-4">
                    <img 
                        src={TherapedicLogo} 
                        alt="Logo Therapedic IT" 
                        className="w-36 h-auto" // Puedes ajustar w-36 por w-48 o el tamaño que necesites
                    />
                </div>
                {/* FIN DEL REEMPLAZO */}

                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Aplicación para administradores de TI
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Acceso para personal de TI
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Usuario
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    // He dejado los colores 'indigo' de Tailwind, si quieres púrpura corporativo,
                                    // deberás definir esos colores en tu archivo tailwind.config.js y usarlos aquí.
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                                <strong className="font-bold">Error:</strong>
                                <span className="block sm:inline ml-2">{message}</span>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- CONTINÚAN LOS OTROS COMPONENTES (EquipoManagement, DashboardContent, etc.) SIN CAMBIOS ---
// ... (El código de EquipoManagement, TABS, DashboardContent sigue aquí)
// ... (Todos los componentes que vienen después de LoginPage no se muestran aquí por ser muy largos, pero deben estar en tu archivo)

const WelcomeDashboard = ({ user }) => (
    <div className="p-8 bg-white shadow-xl rounded-lg max-w-4xl mx-auto mt-8">
        <h2 className="text-3xl font-bold text-indigo-600">
            ¡Bienvenido, {user.nombreCompleto || user.rol}!
        </h2>
        <p className="mt-2 text-gray-700">
            Usa el menú lateral para gestionar los recursos de TI.
        </p>
    </div>
);

const PlaceholderModule = ({ title, description, icon: Icon }) => (
    <div className="p-8 bg-white shadow-xl rounded-lg max-w-4xl mx-auto mt-8 flex items-center space-x-4 border-l-4 border-indigo-500">
        <Icon className="w-8 h-8 text-indigo-500 flex-shrink-0" />
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="mt-1 text-gray-600">{description}</p>
        </div>
    </div>
);

// --- COMPONENTE: ESTRUCTURA DEL DASHBOARD ---

const TABS = {
    DASHBOARD: 'Dashboard',
    EQUIPOS: 'Gestión de Equipos',
    INVENTARIO: 'Gestión de Inventario',
    MANTENIMIENTO: 'Reportes de Mantenimiento',
    USUARIOS: 'Gestión de Usuarios', // Sólo visible para Admin
};

// ... (El resto del código de DashboardContent)
const DashboardContent = () => {
    // ... (Tu código actual de DashboardContent)
};

// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---
// (Revisar que este componente esté en la parte inferior de App.jsx)

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <LoadingSpinner />
            </div>
        );
    }

    // Si el usuario no está logueado, muestra la página de Login.
    if (!user) {
        // Renderiza la LoginPage corregida que tiene tu logo
        return <LoginPage />;
    }

    // Si el usuario está logueado, muestra el Dashboard.
    return (
        <DashboardContent />
    );
}

export default () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);